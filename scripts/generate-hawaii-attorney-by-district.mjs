import fs from 'node:fs/promises'
import path from 'node:path'
import * as turf from '@turf/turf'

const projectRoot = path.resolve(import.meta.dirname, '..')
const zipJsonPath = path.join(projectRoot, 'public', 'hawaii-attorney-by-zip.json')
const geoJsonPath = path.join(projectRoot, 'public', 'Judicial_Districts.geojson')
const districtsGeoPath = path.join(projectRoot, 'public', 'hawaii-judicial-districts.geojson')
const districtsDataPath = path.join(projectRoot, 'public', 'hawaii-attorney-by-district.json')

const AGE_BRACKET_ORDER = ['Under 30', '30-39', '40-49', '50-59', '60-69', '70-79', '80+']

function createEmptyAgeBrackets() {
  return Object.fromEntries(AGE_BRACKET_ORDER.map(bracket => [bracket, 0]))
}

function mergeAgeBrackets(target, source) {
  AGE_BRACKET_ORDER.forEach(bracket => {
    target[bracket] += source[bracket] ?? 0
  })
}

function createAreaEntry(idKey, id, labelKey, label) {
  return {
    [idKey]: id,
    [labelKey]: label,
    totalAttorneys: 0,
    ageSum: 0,
    ageBrackets: createEmptyAgeBrackets(),
    attorneys: []
  }
}

function addZipEntryToArea(areaEntry, zipEntry) {
  areaEntry.totalAttorneys += zipEntry.totalAttorneys
  areaEntry.ageSum += zipEntry.averageAge * zipEntry.totalAttorneys
  mergeAgeBrackets(areaEntry.ageBrackets, zipEntry.ageBrackets)
  areaEntry.attorneys.push(...zipEntry.attorneys)
}

function finalizeAreaEntry(areaEntry) {
  const over60Count = areaEntry.ageBrackets['60-69'] + areaEntry.ageBrackets['70-79'] + areaEntry.ageBrackets['80+']

  areaEntry.averageAge =
    areaEntry.totalAttorneys > 0 ? Number((areaEntry.ageSum / areaEntry.totalAttorneys).toFixed(1)) : 0
  areaEntry.percentOver60 =
    areaEntry.totalAttorneys > 0 ? Number(((over60Count / areaEntry.totalAttorneys) * 100).toFixed(1)) : 0

  delete areaEntry.ageSum
}

function getOver60Count(areaEntry) {
  return areaEntry.ageBrackets['60-69'] + areaEntry.ageBrackets['70-79'] + areaEntry.ageBrackets['80+']
}

function getDistrictId(district) {
  return district.toLowerCase().replace(/\s+/g, '_')
}

function unionFeatures(features) {
  if (features.length === 0) return null
  if (features.length === 1) return features[0].geometry

  let merged = turf.feature(features[0].geometry)

  for (let index = 1; index < features.length; index += 1) {
    const next = turf.feature(features[index].geometry)
    const result = turf.union(turf.featureCollection([merged, next]))
    if (result) {
      merged = result
    }
  }

  return merged.geometry
}

function getFeaturesByDistrict(geoJson) {
  const featuresByDistrict = new Map()

  geoJson.features.forEach(feature => {
    const district = feature.properties?.district
    if (!district) return

    if (!featuresByDistrict.has(district)) {
      featuresByDistrict.set(district, [])
    }
    featuresByDistrict.get(district).push(feature)
  })

  return featuresByDistrict
}

function buildDistrictGeometries(featuresByDistrict) {
  const districtFeatures = []
  const districtGeometryById = new Map()

  for (const [districtName, features] of [...featuresByDistrict.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const districtId = getDistrictId(districtName)
    const mergedGeometry = unionFeatures(features)

    if (!mergedGeometry) {
      throw new Error(`No GeoJSON polygons found for judicial district ${districtName}`)
    }

    districtGeometryById.set(districtId, mergedGeometry)
    districtFeatures.push({
      type: 'Feature',
      properties: {
        districtId,
        districtName,
        districtLabel: districtName
      },
      geometry: mergedGeometry
    })
  }

  return { districtFeatures, districtGeometryById }
}

function findDistrictIdForZip(zip, zipEntry, districtFeatures) {
  if (!zipEntry.centroid) {
    throw new Error(`ZIP ${zip} is missing a centroid and cannot be assigned to a judicial district`)
  }

  const point = turf.point([zipEntry.centroid[1], zipEntry.centroid[0]])
  const containingFeature = districtFeatures.find(feature => turf.booleanPointInPolygon(point, feature))

  if (containingFeature) {
    return containingFeature.properties.districtId
  }

  const nearestFeature = districtFeatures
    .map(feature => ({
      feature,
      distanceKm: turf.pointToPolygonDistance(point, feature, { units: 'kilometers' })
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0]

  if (!nearestFeature || nearestFeature.distanceKm > 10) {
    throw new Error(`ZIP ${zip} centroid is not inside or near any judicial district`)
  }

  console.warn(
    `ZIP ${zip} centroid is outside judicial districts; assigned to nearest district ` +
      `${nearestFeature.feature.properties.districtLabel} (${nearestFeature.distanceKm.toFixed(2)} km)`
  )

  return nearestFeature.feature.properties.districtId
}

function getBubbleCenterForGeometry(geometry) {
  const feature = turf.feature(geometry)
  const centerOfMass = turf.centerOfMass(feature)

  if (turf.booleanPointInPolygon(centerOfMass, feature)) {
    return centerOfMass.geometry.coordinates
  }

  return turf.pointOnFeature(feature).geometry.coordinates
}

function getWeightedZipCenter(zipEntries, getWeight) {
  let latitudeSum = 0
  let longitudeSum = 0
  let weightSum = 0

  for (const zipEntry of zipEntries) {
    if (!zipEntry.centroid) continue

    const weight = getWeight(zipEntry)
    if (weight <= 0) continue

    latitudeSum += zipEntry.centroid[0] * weight
    longitudeSum += zipEntry.centroid[1] * weight
    weightSum += weight
  }

  return weightSum > 0 ? [longitudeSum / weightSum, latitudeSum / weightSum] : null
}

function getHeaviestInsideZipCenter(zipEntries, districtFeature, getWeight) {
  const insideZipEntry = [...zipEntries]
    .filter(zipEntry => zipEntry.centroid && getWeight(zipEntry) > 0)
    .sort((a, b) => getWeight(b) - getWeight(a))
    .find(zipEntry => turf.booleanPointInPolygon(turf.point([zipEntry.centroid[1], zipEntry.centroid[0]]), districtFeature))

  return insideZipEntry ? [insideZipEntry.centroid[1], insideZipEntry.centroid[0]] : null
}

function getBubbleCenterForDistrict(geometry, zipEntries) {
  const districtFeature = turf.feature(geometry)
  const candidates = [
    getWeightedZipCenter(zipEntries, getOver60Count),
    getWeightedZipCenter(zipEntries, zipEntry => zipEntry.totalAttorneys),
    getHeaviestInsideZipCenter(zipEntries, districtFeature, getOver60Count),
    getHeaviestInsideZipCenter(zipEntries, districtFeature, zipEntry => zipEntry.totalAttorneys)
  ]

  const insideCandidate = candidates.find(
    coordinates => coordinates && turf.booleanPointInPolygon(turf.point(coordinates), districtFeature)
  )

  return insideCandidate ?? getBubbleCenterForGeometry(geometry)
}

async function main() {
  const [zipJsonText, geoJsonText] = await Promise.all([
    fs.readFile(zipJsonPath, 'utf8'),
    fs.readFile(geoJsonPath, 'utf8')
  ])

  const zipJson = JSON.parse(zipJsonText)
  const geoJson = JSON.parse(geoJsonText)

  const zipsInData = Object.keys(zipJson.zipData).sort()

  const featuresByDistrict = getFeaturesByDistrict(geoJson)
  const { districtFeatures, districtGeometryById } = buildDistrictGeometries(featuresByDistrict)

  const districtData = Object.fromEntries(
    districtFeatures.map(feature => [
      feature.properties.districtId,
      createAreaEntry('districtId', feature.properties.districtId, 'districtLabel', feature.properties.districtLabel)
    ])
  )

  const zipsByDistrict = Object.fromEntries(Object.keys(districtData).map(districtId => [districtId, []]))

  for (const zip of zipsInData) {
    const zipEntry = zipJson.zipData[zip]
    const districtId = findDistrictIdForZip(zip, zipEntry, districtFeatures)
    const districtEntry = districtData[districtId]

    zipsByDistrict[districtId].push(zip)

    addZipEntryToArea(districtEntry, zipEntry)
  }

  for (const districtEntry of Object.values(districtData)) {
    finalizeAreaEntry(districtEntry)

    const geometry = districtGeometryById.get(districtEntry.districtId)
    const districtZipEntries = zipsByDistrict[districtEntry.districtId].map(zip => zipJson.zipData[zip])
    const [lng, lat] = getBubbleCenterForDistrict(geometry, districtZipEntries)
    districtEntry.centroid = [lat, lng]
    districtEntry.zips = zipsByDistrict[districtEntry.districtId]
  }

  const districtsGeoJson = {
    type: 'FeatureCollection',
    features: districtFeatures
  }

  const districtOutput = {
    districtData,
    metadata: {
      ...zipJson.metadata,
      districtCount: districtFeatures.length,
      source: 'hawaii-attorney-by-zip.json'
    }
  }

  await fs.writeFile(districtsGeoPath, `${JSON.stringify(districtsGeoJson)}\n`, 'utf8')
  await fs.writeFile(districtsDataPath, `${JSON.stringify(districtOutput)}\n`, 'utf8')

  console.log('Generated Hawaii attorney-by-district data successfully.')
  console.log(`Districts GeoJSON: ${districtsGeoPath}`)
  console.log(`Districts data JSON: ${districtsDataPath}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
