import bundledAttorneyByDistrict from '../../../public/hawaii-attorney-by-district.json'
import bundledAttorneyByZip from '../../../public/hawaii-attorney-by-zip.json'
import bundledDistrictsGeoJsonRaw from '../../../public/hawaii-judicial-districts.geojson?raw'
import bundledGeoJsonRaw from '../../../public/hawaii-zcta.geojson?raw'

const bundledDistrictsGeoJson = JSON.parse(bundledDistrictsGeoJsonRaw) as GeoJSON.GeoJsonObject
const bundledGeoJson = JSON.parse(bundledGeoJsonRaw) as GeoJSON.GeoJsonObject

export { bundledAttorneyByDistrict, bundledAttorneyByZip, bundledDistrictsGeoJson, bundledGeoJson }
