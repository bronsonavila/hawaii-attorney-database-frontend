import fs from 'node:fs/promises'
import path from 'node:path'
import Papa from 'papaparse'

const projectRoot = path.resolve(import.meta.dirname, '..')
const inputPath = path.join(projectRoot, 'logs', 'member-statistics-with-age.csv')
const geoJsonPath = path.join(projectRoot, 'public', 'hawaii-zcta.geojson')
const outputPath = path.join(projectRoot, 'public', 'hawaii-attorney-by-zip.json')

const MEMBERSHIP_PLAN_COLUMN = 'Primary Membership ? Plan Name With Level'
const ZIP_COLUMN = 'Work Address Zip'

const ACTIVE_STATUSES = ['Active', 'Government', 'Judge']

const AGE_BRACKET_ORDER = ['Under 30', '30-39', '40-49', '50-59', '60-69', '70-79', '80+']

const HONOLULU_PO_BOX_COORDS = [21.31, -157.86]

// Hardcoded coordinates for missing PO Box / Military / non-polygon ZIPs.
// Sourced from Google Maps Geocoding API lookups.
const MISSING_ZIP_COORDS = {
  96801: HONOLULU_PO_BOX_COORDS,
  96802: HONOLULU_PO_BOX_COORDS,
  96803: HONOLULU_PO_BOX_COORDS,
  96804: HONOLULU_PO_BOX_COORDS,
  96806: HONOLULU_PO_BOX_COORDS,
  96807: HONOLULU_PO_BOX_COORDS,
  96808: HONOLULU_PO_BOX_COORDS,
  96809: HONOLULU_PO_BOX_COORDS,
  96810: HONOLULU_PO_BOX_COORDS,
  96811: HONOLULU_PO_BOX_COORDS,
  96812: HONOLULU_PO_BOX_COORDS,
  96823: [21.3089, -157.85],
  96824: [21.28, -157.76],
  96828: [21.29, -157.82],
  96830: [21.28, -157.83],
  96837: [21.32, -157.86],
  96839: [21.31, -157.81],
  96840: HONOLULU_PO_BOX_COORDS,
  96846: HONOLULU_PO_BOX_COORDS,
  96721: [19.716, -155.05],
  96733: [20.887, -156.465],
  96739: [19.663, -155.981],
  96745: [19.663, -155.981],
  96854: [21.34, -157.88], // Fort Shafter
  96861: [21.38, -157.9], // Camp Smith
  96866: [21.36, -157.89] // Tripler
}

function haversineKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const getAgeBracketLabel = age => {
  if (age >= 80) return '80+'
  if (age >= 70) return '70-79'
  if (age >= 60) return '60-69'
  if (age >= 50) return '50-59'
  if (age >= 40) return '40-49'
  if (age >= 30) return '30-39'

  return 'Under 30'
}

const parseAge = value => {
  const trimmedValue = value?.trim() ?? ''
  if (!/^\d+$/.test(trimmedValue)) return null

  const age = Number.parseInt(trimmedValue, 10)
  if (!Number.isFinite(age) || age < 0 || age > 130) return null

  return age
}

const normalizeActiveAttorneyStatus = planName => {
  const trimmedPlanName = planName?.trim() ?? ''
  if (!trimmedPlanName) return null

  for (const status of ACTIVE_STATUSES) {
    if (trimmedPlanName.startsWith(status)) {
      return status
    }
  }

  return null
}

const createEmptyAgeBrackets = () => Object.fromEntries(AGE_BRACKET_ORDER.map(bracket => [bracket, 0]))

function computeRingCentroid(ring) {
  let area = 0
  let centroidX = 0
  let centroidY = 0

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x0, y0] = ring[index]
    const [x1, y1] = ring[index + 1]
    const cross = x0 * y1 - x1 * y0

    area += cross
    centroidX += (x0 + x1) * cross
    centroidY += (y0 + y1) * cross
  }

  if (area === 0) {
    const [longitude, latitude] = ring[0]
    return [latitude, longitude]
  }

  area *= 0.5
  centroidX /= 6 * area
  centroidY /= 6 * area

  return [centroidY, centroidX]
}

function computeFeatureCentroid(feature) {
  const geometry = feature.geometry

  if (!geometry) return null

  if (geometry.type === 'Polygon') {
    return computeRingCentroid(geometry.coordinates[0])
  }

  if (geometry.type === 'MultiPolygon') {
    let totalArea = 0
    let weightedLatitude = 0
    let weightedLongitude = 0

    geometry.coordinates.forEach(polygon => {
      const ring = polygon[0]
      let area = 0
      let centroidX = 0
      let centroidY = 0

      for (let index = 0; index < ring.length - 1; index += 1) {
        const [x0, y0] = ring[index]
        const [x1, y1] = ring[index + 1]
        const cross = x0 * y1 - x1 * y0

        area += cross
        centroidX += (x0 + x1) * cross
        centroidY += (y0 + y1) * cross
      }

      if (area === 0) return

      area *= 0.5
      const polygonLongitude = centroidX / (6 * area)
      const polygonLatitude = centroidY / (6 * area)
      const absoluteArea = Math.abs(area)

      totalArea += absoluteArea
      weightedLatitude += polygonLatitude * absoluteArea
      weightedLongitude += polygonLongitude * absoluteArea
    })

    if (totalArea === 0) return null

    return [weightedLatitude / totalArea, weightedLongitude / totalArea]
  }

  return null
}

function buildCentroidLookup(geoJson) {
  const centroidsByZip = {}

  geoJson.features.forEach(feature => {
    const zip = feature.properties?.zcta5ce20
    if (!zip) return

    const centroid = computeFeatureCentroid(feature)
    if (centroid) {
      centroidsByZip[zip] = centroid
    }
  })

  return centroidsByZip
}

async function main() {
  const [statisticsCsv, geoJsonText] = await Promise.all([
    fs.readFile(inputPath, 'utf8'),
    fs.readFile(geoJsonPath, 'utf8')
  ])

  const geoJson = JSON.parse(geoJsonText)
  const centroidsByZip = buildCentroidLookup(geoJson)

  const geoZips = new Set(geoJson.features.map(f => f.properties?.zcta5ce20).filter(Boolean))

  const { data: rows, errors } = Papa.parse(statisticsCsv, {
    header: true,
    skipEmptyLines: 'greedy'
  })

  if (errors.length > 0) {
    throw new Error(`Failed parsing statistics CSV: ${errors[0].message}`)
  }

  // Pre-calculate nearest valid GeoJSON polygon for our missing ZIPs
  const nearestGeoZipLookup = {}
  for (const [missingZip, coord] of Object.entries(MISSING_ZIP_COORDS)) {
    let best = null
    let bestDist = Infinity
    for (const [geoZip, geoCoord] of Object.entries(centroidsByZip)) {
      const d = haversineKm(coord, geoCoord)
      if (d < bestDist) {
        bestDist = d
        best = geoZip
      }
    }
    // Only map if it's within a reasonable distance (e.g. 50km).
    // This prevents Pacific island ZIPs from jumping to Hawaii.
    if (best && bestDist < 50) {
      nearestGeoZipLookup[missingZip] = best
    }
  }

  const zipData = {}
  let totalIncluded = 0
  let totalExcludedNoZip = 0
  let totalExcludedNoStatus = 0
  let totalExcludedNoAge = 0
  let totalExcludedFarPacific = 0
  let totalMerged = 0

  rows.forEach(row => {
    const status = normalizeActiveAttorneyStatus(row[MEMBERSHIP_PLAN_COLUMN])
    if (!status) {
      totalExcludedNoStatus += 1
      return
    }

    const age = parseAge(row.age)
    if (age === null) {
      totalExcludedNoAge += 1
      return
    }

    const rawZip = row[ZIP_COLUMN]?.trim() ?? ''

    // Quick filter: only process 96xxx ZIPs
    if (!/^96\d{3}$/.test(rawZip)) {
      totalExcludedNoZip += 1
      return
    }

    let resolvedZip = rawZip
    if (!geoZips.has(rawZip)) {
      const nearest = nearestGeoZipLookup[rawZip]
      if (nearest) {
        resolvedZip = nearest
        totalMerged += 1
      } else {
        // Either we don't have hardcoded coords for it, or it's >50km away (like Guam)
        totalExcludedFarPacific += 1
        return
      }
    }

    if (!zipData[resolvedZip]) {
      zipData[resolvedZip] = {
        zip: resolvedZip,
        totalAttorneys: 0,
        ageSum: 0,
        ageBrackets: createEmptyAgeBrackets(),
        attorneys: []
      }
    }

    const bracket = getAgeBracketLabel(age)
    const zipEntry = zipData[resolvedZip]

    zipEntry.totalAttorneys += 1
    zipEntry.ageSum += age
    zipEntry.ageBrackets[bracket] += 1
    zipEntry.attorneys.push({ age, bracket, status })

    totalIncluded += 1
  })

  Object.values(zipData).forEach(zipEntry => {
    zipEntry.averageAge = Number((zipEntry.ageSum / zipEntry.totalAttorneys).toFixed(1))

    const over60Count = zipEntry.ageBrackets['60-69'] + zipEntry.ageBrackets['70-79'] + zipEntry.ageBrackets['80+']
    zipEntry.percentOver60 = Number(((over60Count / zipEntry.totalAttorneys) * 100).toFixed(1))

    zipEntry.centroid = centroidsByZip[zipEntry.zip] ?? null
    delete zipEntry.ageSum
  })

  const output = {
    zipData,
    metadata: {
      totalIncluded,
      totalExcludedNoZip,
      totalExcludedNoStatus,
      totalExcludedNoAge,
      totalExcludedFarPacific,
      totalMerged,
      asOfDate: 'May 15, 2026'
    }
  }

  await fs.writeFile(outputPath, `${JSON.stringify(output)}\n`, 'utf8')

  console.log('Generated Hawaii attorney-by-zip data successfully.')
  console.log(`Output file: ${outputPath}`)
  console.log(`ZIP codes with data: ${Object.keys(zipData).length}`)
  console.log(`Total included attorneys: ${totalIncluded}`)
  console.log(`Merged from PO Box/military ZIPs into nearest neighbor: ${totalMerged}`)
  console.log(`Excluded (Guam/Samoa/no-coords/non-96xxx): ${totalExcludedFarPacific + totalExcludedNoZip}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
