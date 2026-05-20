import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = path.resolve(import.meta.dirname, '..')
const zipJsonPath = path.join(projectRoot, 'public', 'hawaii-attorney-by-zip.json')
const cachePath = path.join(projectRoot, 'logs', 'zip-region-audit.json')
const reportPath = path.join(projectRoot, 'logs', 'zip-region-audit.txt')

const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY ?? ''
const FORCE_REFRESH = process.argv.includes('--refresh')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getComponent(components, type) {
  return components.find(component => component.types.includes(type)) ?? null
}

function parseGeocodeResult(result) {
  const components = result.address_components ?? []
  const county = getComponent(components, 'administrative_area_level_2')?.long_name ?? ''
  const neighborhood = getComponent(components, 'neighborhood')?.long_name ?? ''
  const locality =
    getComponent(components, 'locality')?.long_name ??
    getComponent(components, 'postal_town')?.long_name ??
    getComponent(components, 'sublocality')?.long_name ??
    ''
  const lat = result.geometry?.location?.lat ?? null
  const lng = result.geometry?.location?.lng ?? null

  return { county, locality, neighborhood, lat, lng }
}

async function geocodeZip(zip) {
  const address = `${zip}, HI, USA`
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_GEOCODING_API_KEY}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ZIP ${zip}`)
  }

  const data = await response.json()
  if (data.status !== 'OK' || !data.results?.[0]) {
    throw new Error(`Geocoding failed for ZIP ${zip}: ${data.status}`)
  }

  return parseGeocodeResult(data.results[0])
}

async function loadCache() {
  try {
    const text = await fs.readFile(cachePath, 'utf8')
    return JSON.parse(text)
  } catch {
    return { entries: {} }
  }
}

async function main() {
  const zipJson = JSON.parse(await fs.readFile(zipJsonPath, 'utf8'))
  const zips = Object.keys(zipJson.zipData).sort()

  if (!GOOGLE_GEOCODING_API_KEY && !FORCE_REFRESH) {
    const cache = await loadCache()
    if (Object.keys(cache.entries).length === 0) {
      throw new Error(
        'GOOGLE_GEOCODING_API_KEY is not set and no cache exists at logs/zip-region-audit.json. ' +
          'Set the env var or run with an existing cache.'
      )
    }
    console.log(`Using cached geocode results (${Object.keys(cache.entries).length} ZIPs).`)
    await writeReport(zips.map(zip => cache.entries[zip]).filter(Boolean))
    return
  }

  if (!GOOGLE_GEOCODING_API_KEY) {
    throw new Error('GOOGLE_GEOCODING_API_KEY is required when using --refresh')
  }

  const cache = FORCE_REFRESH ? { entries: {} } : await loadCache()
  const rows = []

  for (const zip of zips) {
    if (!FORCE_REFRESH && cache.entries[zip]) {
      rows.push(cache.entries[zip])
      continue
    }

    const parsed = await geocodeZip(zip)

    const row = {
      zip,
      locality: parsed.locality,
      neighborhood: parsed.neighborhood,
      county: parsed.county,
      lat: parsed.lat,
      lng: parsed.lng
    }

    cache.entries[zip] = row
    rows.push(row)

    await sleep(100)
  }

  await fs.mkdir(path.dirname(cachePath), { recursive: true })
  await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')

  await writeReport(rows)
  console.log(`Wrote cache: ${cachePath}`)
  console.log(`Wrote report: ${reportPath}`)
}

async function writeReport(rows) {
  const header = 'ZIP   | locality              | neighborhood         | county          | lat      | lng'
  const lines = rows.map(row => {
    const locality = (row.locality ?? '').padEnd(22).slice(0, 22)
    const neighborhood = (row.neighborhood ?? '').padEnd(20).slice(0, 20)
    const county = (row.county ?? '').padEnd(15).slice(0, 15)
    const lat = row.lat == null ? 'n/a'.padEnd(9) : String(row.lat.toFixed(4)).padEnd(9)
    const lng = row.lng == null ? 'n/a'.padEnd(10) : String(row.lng.toFixed(4)).padEnd(10)
    return `${row.zip} | ${locality} | ${neighborhood} | ${county} | ${lat} | ${lng}`
  })

  const report = [header, ...lines, '', `Total: ${rows.length}`].join('\n')

  console.log('\n' + report)

  await fs.mkdir(path.dirname(reportPath), { recursive: true })
  await fs.writeFile(reportPath, `${report}\n`, 'utf8')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
