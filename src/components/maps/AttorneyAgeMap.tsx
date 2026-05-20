import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import type { Layer, Map as LeafletMap } from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  getColorForRetirementRisk,
  getTextColorForRetirementRisk,
  RETIREMENT_RISK_BUCKETS
} from '@/utils/maps/hawaiiMapUtils'

type ViewMode = 'choropleth' | 'bubble'
type ViewLevel = 'zip' | 'district'

interface AreaData {
  totalAttorneys: number
  percentOver60: number
  centroid: [number, number] | null
  ageBrackets: Record<string, number>
}

interface ZipData extends AreaData {
  zip: string
  locality?: string
}

interface DistrictData extends AreaData {
  districtId: string
  districtLabel: string
  zips?: string[]
}

interface AttorneyByZipJson {
  zipData: Record<string, ZipData>
  metadata: { asOfDate: string }
}

interface AttorneyByDistrictJson {
  districtData: Record<string, DistrictData>
  metadata: { asOfDate: string }
}

interface MapDataBundle {
  geoJson: GeoJSON.GeoJsonObject
  areaData: Record<string, AreaData>
  getFeatureKey: (feature: GeoJSON.Feature) => string | undefined
  getAreaLabel: (key: string, entry: AreaData) => string
}

const MAP_DRAGGING_CLASS = 'attorney-age-map-dragging'

const closeOpenTooltips = (map: LeafletMap) => {
  map.eachLayer((layer: Layer & { closeTooltip?: () => void }) => {
    layer.closeTooltip?.()
  })
}

const MapInteractionGuard = () => {
  useMapEvents({
    dragstart: event => {
      const map = event.target as LeafletMap
      map.getContainer().classList.add(MAP_DRAGGING_CLASS)
      closeOpenTooltips(map)
    },
    drag: event => {
      closeOpenTooltips(event.target as LeafletMap)
    },
    dragend: event => {
      const map = event.target as LeafletMap
      closeOpenTooltips(map)
      window.setTimeout(() => {
        closeOpenTooltips(map)
        map.getContainer().classList.remove(MAP_DRAGGING_CLASS)
      }, 0)
    }
  })

  return null
}

const getOver60Count = (entry: AreaData) =>
  entry.ageBrackets['60-69'] + entry.ageBrackets['70-79'] + entry.ageBrackets['80+']

const hasAttorneys = (entry: AreaData | null): entry is AreaData => Boolean(entry && entry.totalAttorneys > 0)

const buildTooltipHtml = (title: string, entry: AreaData) => {
  const over60Count = getOver60Count(entry)

  return `
    <div style="font-family: monospace;">
      <strong>${title}</strong><br/>
      <table style="border-collapse: collapse;">
        <tbody>
          <tr><td style="padding: 0 8px 0 0;">Active Attorneys:</td><td style="padding: 0; text-align: right;">${entry.totalAttorneys}</td></tr>
          <tr style="color: ${getTextColorForRetirementRisk(entry.percentOver60)}; font-weight: 700;"><td style="padding: 0 8px 0 0;">Attorneys 60+:</td><td style="padding: 0; text-align: right;">${over60Count} (${entry.percentOver60}%)</td></tr>
        </tbody>
      </table>
      <br/>
      <table style="border-collapse: collapse;">
        <tbody>
          <tr><td style="padding: 0 8px 0 0;">Under 30:</td><td style="padding: 0; text-align: right;">${entry.ageBrackets['Under 30']}</td></tr>
          <tr><td style="padding: 0 8px 0 0;">30-39:</td><td style="padding: 0; text-align: right;">${entry.ageBrackets['30-39']}</td></tr>
          <tr><td style="padding: 0 8px 0 0;">40-49:</td><td style="padding: 0; text-align: right;">${entry.ageBrackets['40-49']}</td></tr>
          <tr><td style="padding: 0 8px 0 0;">50-59:</td><td style="padding: 0; text-align: right;">${entry.ageBrackets['50-59']}</td></tr>
          <tr><td style="padding: 0 8px 0 0;">60-69:</td><td style="padding: 0; text-align: right;">${entry.ageBrackets['60-69']}</td></tr>
          <tr><td style="padding: 0 8px 0 0;">70-79:</td><td style="padding: 0; text-align: right;">${entry.ageBrackets['70-79']}</td></tr>
          <tr><td style="padding: 0 8px 0 0;">80+:</td><td style="padding: 0; text-align: right;">${entry.ageBrackets['80+']}</td></tr>
        </tbody>
      </table>
    </div>
  `
}

const Legend = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 400
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0 }}>
        Retirement Risk
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
        % of Attorneys Age 60+
      </Typography>
      {RETIREMENT_RISK_BUCKETS.map(bucket => (
        <Box key={bucket.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              bgcolor: getColorForRetirementRisk(bucket.min),
              border: '1px solid rgba(0,0,0,0.1)'
            }}
          />
          <Typography variant="body2">{bucket.label}</Typography>
        </Box>
      ))}
    </Box>
  )
}

export const AttorneyAgeMap = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('choropleth')
  const [viewLevel, setViewLevel] = useState<ViewLevel>('zip')
  const [activeBubbleTooltipKey, setActiveBubbleTooltipKey] = useState<string | null>(null)
  const [zipGeoJson, setZipGeoJson] = useState<GeoJSON.GeoJsonObject | null>(null)
  const [districtGeoJson, setDistrictGeoJson] = useState<GeoJSON.GeoJsonObject | null>(null)
  const [attorneyByZip, setAttorneyByZip] = useState<AttorneyByZipJson | null>(null)
  const [attorneyByDistrict, setAttorneyByDistrict] = useState<AttorneyByDistrictJson | null>(null)

  useEffect(() => {
    if (import.meta.env.VITE_STANDALONE === 'true') {
      void import('@/utils/maps/standaloneMapData').then(
        ({
          bundledGeoJson,
          bundledDistrictsGeoJson,
          bundledAttorneyByZip,
          bundledAttorneyByDistrict
        }) => {
          setZipGeoJson(bundledGeoJson)
          setDistrictGeoJson(bundledDistrictsGeoJson)
          setAttorneyByZip(bundledAttorneyByZip as unknown as AttorneyByZipJson)
          setAttorneyByDistrict(bundledAttorneyByDistrict as unknown as AttorneyByDistrictJson)
        }
      )
      return
    }

    const fetchData = async () => {
      try {
        const [geoRes, attorneyRes, districtsGeoRes, attorneyDistrictRes] =
          await Promise.all([
            fetch('/hawaii-zcta.geojson'),
            fetch('/hawaii-attorney-by-zip.json'),
            fetch('/hawaii-judicial-districts.geojson'),
            fetch('/hawaii-attorney-by-district.json')
          ])

        if (
          geoRes.ok &&
          attorneyRes.ok &&
          districtsGeoRes.ok &&
          attorneyDistrictRes.ok
        ) {
          setZipGeoJson(await geoRes.json())
          setAttorneyByZip(await attorneyRes.json())
          setDistrictGeoJson(await districtsGeoRes.json())
          setAttorneyByDistrict(await attorneyDistrictRes.json())
        } else {
          console.error('Failed to fetch map data files')
        }
      } catch (err) {
        console.error('Error fetching map data:', err)
      }
    }

    void fetchData()
  }, [])

  useEffect(() => {
    setActiveBubbleTooltipKey(null)
  }, [viewMode, viewLevel])

  const activeMapData = useMemo((): MapDataBundle | null => {
    if (viewLevel === 'zip' && zipGeoJson && attorneyByZip) {
      return {
        geoJson: zipGeoJson,
        areaData: attorneyByZip.zipData,
        getFeatureKey: feature => feature.properties?.zcta5ce20 as string | undefined,
        getAreaLabel: (key, entry) => {
          const locality = (entry as ZipData).locality?.trim()

          return locality ? `${locality} (${key})` : `ZIP: ${key}`
        }
      }
    }

    if (viewLevel === 'district' && districtGeoJson && attorneyByDistrict) {
      return {
        geoJson: districtGeoJson,
        areaData: attorneyByDistrict.districtData,
        getFeatureKey: feature => feature.properties?.districtId as string | undefined,
        getAreaLabel: (_key, entry) => (entry as DistrictData).districtLabel
      }
    }

    return null
  }, [viewLevel, zipGeoJson, attorneyByZip, districtGeoJson, attorneyByDistrict])

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode) {
      setViewMode(newMode)
    }
  }

  const handleLevelChange = (_: React.MouseEvent<HTMLElement>, newLevel: ViewLevel | null) => {
    if (newLevel) {
      setViewLevel(newLevel)
    }
  }

  if (!activeMapData) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        <Typography>Loading map data...</Typography>
      </Box>
    )
  }

  const { geoJson, areaData, getFeatureKey, getAreaLabel } = activeMapData

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          flexWrap: 'wrap',
          '& .MuiToggleButton-root': {
            px: 2.5,
            textTransform: 'none'
          }
        }}
      >
        <ToggleButtonGroup
          value={viewLevel}
          exclusive
          onChange={handleLevelChange}
          aria-label="map geographic level"
          size="small"
        >
          <ToggleButton value="zip" aria-label="zip code level">
            ZIP Code
          </ToggleButton>
          <ToggleButton value="district" aria-label="judicial district level">
            Judicial District
          </ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleModeChange}
          aria-label="map view mode"
          size="small"
        >
          <ToggleButton value="choropleth" aria-label="choropleth">
            Shaded Map
          </ToggleButton>
          <ToggleButton value="bubble" aria-label="bubble map">
            Bubble Map
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: 400,
          position: 'relative',
          borderRadius: 1,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          '& .attorney-age-map-dragging .leaflet-interactive': {
            pointerEvents: 'none'
          },
          '& .leaflet-interactive:focus': {
            outline: 'none'
          },
          '& .leaflet-tile-pane': {
            filter: 'grayscale(100%)'
          }
        }}
      >
        <MapContainer center={[20.7, -157.5]} zoom={8} style={{ height: '100%', width: '100%' }}>
          <MapInteractionGuard />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            opacity={0.55}
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <GeoJSON
            key={`geojson-${viewLevel}-${viewMode}`}
            data={geoJson}
            style={feature => {
              const featureKey = feature ? getFeatureKey(feature as GeoJSON.Feature) : undefined
              const areaEntry = featureKey ? areaData[featureKey] : null
              const shouldShowRisk = hasAttorneys(areaEntry)

              if (viewMode === 'choropleth') {
                return {
                  fillColor: shouldShowRisk ? getColorForRetirementRisk(areaEntry.percentOver60) : 'transparent',
                  weight: viewLevel === 'zip' ? 1 : 2,
                  opacity: 1,
                  color: 'white',
                  fillOpacity: shouldShowRisk ? 0.8 : 0
                }
              }

              return {
                weight: viewLevel === 'zip' ? 1 : 2,
                opacity: 0.55,
                color: '#4f4f4f',
                fillColor: 'transparent',
                fillOpacity: 0
              }
            }}
            onEachFeature={(feature, layer) => {
              const featureKey = getFeatureKey(feature)
              const areaEntry = featureKey ? areaData[featureKey] : null

              if (hasAttorneys(areaEntry) && featureKey) {
                if (viewMode === 'choropleth') {
                  layer.bindTooltip(buildTooltipHtml(getAreaLabel(featureKey, areaEntry), areaEntry))
                  return
                }

                layer.on({
                  mouseover: () => setActiveBubbleTooltipKey(featureKey),
                  mouseout: () => setActiveBubbleTooltipKey(currentKey => (currentKey === featureKey ? null : currentKey))
                })
              }
            }}
          />

          {viewMode === 'bubble' &&
            Object.entries(areaData).map(([key, areaEntry]) => {
              if (!areaEntry.centroid || areaEntry.totalAttorneys === 0) return null

              const over60Count = getOver60Count(areaEntry)

              return (
                <CircleMarker
                  key={`bubble-${viewLevel}-${key}`}
                  center={[areaEntry.centroid[0], areaEntry.centroid[1]]}
                  radius={Math.max(4, Math.sqrt(over60Count) * 2.5)}
                  pathOptions={{
                    fillColor: getColorForRetirementRisk(areaEntry.percentOver60),
                    color: 'white',
                    weight: 1,
                    fillOpacity: 0.8,
                    opacity: 1
                  }}
                  eventHandlers={{
                    mouseover: () => setActiveBubbleTooltipKey(key),
                    mouseout: () => setActiveBubbleTooltipKey(currentKey => (currentKey === key ? null : currentKey))
                  }}
                >
                  {activeBubbleTooltipKey === key && (
                    <Tooltip permanent direction="auto">
                      <div
                        style={{ lineHeight: 1.4 }}
                        dangerouslySetInnerHTML={{
                          __html: buildTooltipHtml(getAreaLabel(key, areaEntry), areaEntry)
                        }}
                      />
                    </Tooltip>
                  )}
                </CircleMarker>
              )
            })}
        </MapContainer>

        <Legend />
      </Box>
    </Box>
  )
}
