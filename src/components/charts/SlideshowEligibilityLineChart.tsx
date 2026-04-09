import { Box, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts'
import { DatasetType } from '@mui/x-charts/internals'
import { useLayoutEffect, useRef, useState } from 'react'
import { ChartTestId } from '@/types/chart'

const ELIGIBILITY_LINE_COLOR = '#a5dde8'
const CHART_MARGIN = { bottom: 72, left: 88, right: 24, top: 24 }
const POINT_LABEL_OFFSET = 14

interface SlideshowEligibilityLineChartProps {
  data: DatasetType
}

export const SlideshowEligibilityLineChart = ({ data }: SlideshowEligibilityLineChartProps) => {
  const containerReference = useRef<HTMLDivElement>(null)
  const [chartSize, setChartSize] = useState({ height: 560, width: 800 })

  useLayoutEffect(() => {
    const element = containerReference.current

    if (!element) return

    const updateSize = () => {
      const width = element.clientWidth
      const height = element.clientHeight

      if (width > 0 && height > 0) {
        setChartSize({ height, width })
      }
    }

    updateSize()

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(updateSize)

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const yearlyData = data as { count: number; year: string }[]
  const years = yearlyData.map(item => item.year)
  const counts = yearlyData.map(item => item.count)

  const maxCount = Math.max(...counts)
  const yAxisMin = 0
  const yAxisMax = Math.ceil((maxCount * 1.1) / 10) * 10

  const plotWidth = Math.max(chartSize.width - CHART_MARGIN.left - CHART_MARGIN.right, 0)
  const plotHeight = Math.max(chartSize.height - CHART_MARGIN.top - CHART_MARGIN.bottom, 0)
  const xStep = yearlyData.length > 1 ? plotWidth / (yearlyData.length - 1) : 0

  const pointPositions = yearlyData.map((item, index) => {
    const x = CHART_MARGIN.left + xStep * index
    const y = CHART_MARGIN.top + plotHeight - ((item.count - yAxisMin) / (yAxisMax - yAxisMin)) * plotHeight

    return {
      ...item,
      x,
      y
    }
  })

  return (
    <Box ref={containerReference} sx={{ flex: 1, minHeight: 320, minWidth: 0, position: 'relative', width: '100%' }}>
      <LineChart
        axisHighlight={{ x: 'none', y: 'none' }}
        data-testid={ChartTestId.SLIDESHOW_ELIGIBILITY_LINE}
        grid={{ horizontal: true, vertical: true }}
        height={chartSize.height}
        margin={CHART_MARGIN}
        series={[
          {
            area: true,
            color: ELIGIBILITY_LINE_COLOR,
            curve: 'linear',
            data: yearlyData.map(item => item.count),
            label: 'Eligible to practice',
            showMark: true
          }
        ]}
        skipAnimation
        slotProps={{
          legend: {
            hidden: true
          }
        }}
        sx={{
          '& .MuiChartsAxis-directionX .MuiChartsAxis-label': {
            transform: 'translateY(10px)'
          },
          '& .MuiChartsAxis-directionY .MuiChartsAxis-label': {
            transform: 'translateX(-24px)'
          },
          '& .MuiChartsAxis-tickLabel': {
            fontSize: 13
          },
          '& .MuiAreaElement-root': {
            fillOpacity: 0.3
          },
          '& .MuiLineElement-root': {
            strokeWidth: 4
          },
          '& .MuiMarkElement-root': {
            fill: ELIGIBILITY_LINE_COLOR,
            stroke: '#ffffff',
            strokeWidth: 2
          }
        }}
        width={chartSize.width}
        xAxis={[
          {
            data: years,
            label: 'Bar Admission Year',
            labelStyle: { fontSize: 16 },
            scaleType: 'point' as const,
            tickLabelInterval: () => true,
            tickLabelStyle: { fontSize: 13 } as const,
            valueFormatter: (value: string) => value.toString()
          }
        ]}
        yAxis={[
          {
            max: yAxisMax,
            min: yAxisMin,
            label: 'Attorneys Eligible to Practice',
            labelStyle: { fontSize: 16 }
          }
        ]}
      />
      <Box
        component="svg"
        sx={{
          height: '100%',
          left: 0,
          overflow: 'visible',
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          width: '100%'
        }}
        viewBox={`0 0 ${chartSize.width} ${chartSize.height}`}
      >
        {pointPositions.map(point => (
          <text
            key={`${point.year}-label`}
            fill="#424242"
            fontSize="16"
            fontWeight="600"
            paintOrder="stroke"
            stroke="#ffffff"
            strokeWidth="4"
            textAnchor="middle"
            x={point.x}
            y={Math.max(point.y - POINT_LABEL_OFFSET, CHART_MARGIN.top + 10)}
          >
            {point.count.toLocaleString()}
          </text>
        ))}
      </Box>
      <Typography
        sx={{
          bottom: 12,
          color: 'text.secondary',
          fontSize: 14,
          left: CHART_MARGIN.left,
          position: 'absolute'
        }}
      >
        * Includes attorneys with full and limited eligibility to practice
      </Typography>
    </Box>
  )
}
