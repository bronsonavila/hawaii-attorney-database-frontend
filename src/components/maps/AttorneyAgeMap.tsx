import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getColorForRetirementRisk, getTextColorForRetirementRisk, RETIREMENT_RISK_BUCKETS } from '@/utils/maps/hawaiiMapUtils'

type ViewMode = 'choropleth' | 'bubble'

interface Attorney {
  age: number
  bracket: string
  status: string
}

interface ZipData {
  zip: string
  totalAttorneys: number
  averageAge: number
  percentOver60: number
  centroid: [number, number] | null
  ageBrackets: Record<string, number>
  attorneys: Attorney[]
}

interface AttorneyByZipJson {
  zipData: Record<string, ZipData>
  metadata: {
    totalIncluded: number
    totalExcludedNoZip: number
    totalExcludedNoStatus: number
    totalExcludedNoAge: number
    totalMerged: number
    asOfDate: string
  }
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
  const [geoJson, setGeoJson] = useState<any>(null)
  const [attorneyData, setAttorneyData] = useState<AttorneyByZipJson | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [geoRes, attorneyRes] = await Promise.all([
          fetch('/hawaii-zcta.geojson'),
          fetch('/hawaii-attorney-by-zip.json')
        ])

        if (geoRes.ok && attorneyRes.ok) {
          const geoData = await geoRes.json()
          const attData = await attorneyRes.json()
          setGeoJson(geoData)
          setAttorneyData(attData)
        } else {
          console.error('Failed to fetch map data files')
        }
      } catch (err) {
        console.error('Error fetching map data:', err)
      }
    }

    void fetchData()
  }, [])

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode) {
      setViewMode(newMode)
    }
  }

  if (!geoJson || !attorneyData) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        <Typography>Loading map data...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleModeChange}
          aria-label="map view mode"
          size="small"
        >
          <ToggleButton value="choropleth" aria-label="choropleth">
            Choropleth
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
          borderColor: 'divider'
        }}
      >
        <MapContainer center={[20.7, -157.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {/* Base GeoJSON Layer */}
          <GeoJSON
            key={`geojson-${viewMode}`} // Force re-render on mode change so styles apply properly
            data={geoJson}
            style={feature => {
              const zip = feature?.properties?.zcta5ce20
              const zipEntry = zip ? attorneyData.zipData[zip] : null

              if (viewMode === 'choropleth') {
                return {
                  fillColor: zipEntry ? getColorForRetirementRisk(zipEntry.percentOver60) : '#e0e0e0',
                  weight: 1,
                  opacity: 1,
                  color: 'white',
                  fillOpacity: zipEntry ? 0.8 : 0.2
                }
              } else {
                // Outline only for bubble and scatter
                return {
                  weight: 1,
                  opacity: 0.3,
                  color: '#666',
                  fillOpacity: 0
                }
              }
            }}
            onEachFeature={(feature, layer) => {
              if (viewMode !== 'choropleth') return

              const zip = feature?.properties?.zcta5ce20
              const zipEntry = zip ? attorneyData.zipData[zip] : null

              if (zipEntry) {
                const over60Count =
                  zipEntry.ageBrackets['60-69'] + zipEntry.ageBrackets['70-79'] + zipEntry.ageBrackets['80+']
                const tooltipContent = `
                  <strong>ZIP: ${zip}</strong><br/>
                  Total Attorneys: ${zipEntry.totalAttorneys}<br/>
                  <strong style="color: ${getTextColorForRetirementRisk(zipEntry.percentOver60)};">Attorneys 60+: ${over60Count} (${zipEntry.percentOver60}%)</strong><br/>
                  <br/>
                  Under 30: ${zipEntry.ageBrackets['Under 30']}<br/>
                  30-39: ${zipEntry.ageBrackets['30-39']}<br/>
                  40-49: ${zipEntry.ageBrackets['40-49']}<br/>
                  50-59: ${zipEntry.ageBrackets['50-59']}<br/>
                  60-69: ${zipEntry.ageBrackets['60-69']}<br/>
                  70-79: ${zipEntry.ageBrackets['70-79']}<br/>
                  80+: ${zipEntry.ageBrackets['80+']}
                `
                layer.bindTooltip(tooltipContent)
              }
            }}
          />

          {/* Bubble Mode Layer */}
          {viewMode === 'bubble' &&
            Object.values(attorneyData.zipData).map(zipEntry => {
              if (!zipEntry.centroid) return null

              const over60Count =
                zipEntry.ageBrackets['60-69'] + zipEntry.ageBrackets['70-79'] + zipEntry.ageBrackets['80+']

              return (
                <CircleMarker
                  key={`bubble-${zipEntry.zip}`}
                  center={[zipEntry.centroid[0], zipEntry.centroid[1]]}
                  radius={Math.max(4, Math.sqrt(over60Count) * 2.5)}
                  pathOptions={{
                    fillColor: getColorForRetirementRisk(zipEntry.percentOver60),
                    color: 'white',
                    weight: 1,
                    fillOpacity: 0.8,
                    opacity: 1
                  }}
                >
                  <Tooltip>
                    <div style={{ lineHeight: 1.4 }}>
                      <strong>ZIP: {zipEntry.zip}</strong>
                      <br />
                      Total Attorneys: {zipEntry.totalAttorneys}
                      <br />
                      <strong style={{ color: getTextColorForRetirementRisk(zipEntry.percentOver60) }}>
                        Attorneys 60+: {over60Count} ({zipEntry.percentOver60}%)
                      </strong>
                      <br />
                      <br />
                      Under 30: {zipEntry.ageBrackets['Under 30']}
                      <br />
                      30-39: {zipEntry.ageBrackets['30-39']}
                      <br />
                      40-49: {zipEntry.ageBrackets['40-49']}
                      <br />
                      50-59: {zipEntry.ageBrackets['50-59']}
                      <br />
                      60-69: {zipEntry.ageBrackets['60-69']}
                      <br />
                      70-79: {zipEntry.ageBrackets['70-79']}
                      <br />
                      80+: {zipEntry.ageBrackets['80+']}
                    </div>
                  </Tooltip>
                </CircleMarker>
              )
            })}
        </MapContainer>

        <Legend />
      </Box>
    </Box>
  )
}
