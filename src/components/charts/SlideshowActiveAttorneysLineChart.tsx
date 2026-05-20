import { Box, Link, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts'
import { DatasetType } from '@mui/x-charts/internals'
import { useLayoutEffect, useRef, useState } from 'react'
import { ChartTestId } from '@/types/chart'
import { HSBA_ACTIVE_ATTORNEYS_BY_YEAR } from '@/constants/chartConstants'

const ACTIVE_ATTORNEYS_LINE_COLOR = '#a5dde8'
const CHART_MARGIN = { bottom: 72, left: 88, right: 40, top: 24 }
const POINT_LABEL_OFFSET = 14

interface SlideshowActiveAttorneysLineChartProps {
  data?: DatasetType
}

export const SlideshowActiveAttorneysLineChart = ({ data }: SlideshowActiveAttorneysLineChartProps) => {
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

  const yearlyData = (data || HSBA_ACTIVE_ATTORNEYS_BY_YEAR) as { count: number; year: string }[]
  const years = yearlyData.map(item => item.year)
  const counts = yearlyData.map(item => item.count)

  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)
  const yAxisMin = Math.max(0, Math.floor(minCount / 100) * 100 - 100)
  const yAxisMax = Math.ceil(maxCount / 100) * 100 + 100
  
  const yAxisTicks = Array.from(
    { length: (yAxisMax - yAxisMin) / 50 + 1 },
    (_, i) => yAxisMin + i * 50
  )

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
        data-testid={ChartTestId.SLIDESHOW_HSBA_ACTIVE_ATTORNEYS}
        grid={{ horizontal: true, vertical: true }}
        height={chartSize.height}
        margin={CHART_MARGIN}
        series={[
          {
            color: ACTIVE_ATTORNEYS_LINE_COLOR,
            curve: 'linear',
            data: yearlyData.map(item => item.count),
            label: 'Active Attorneys',
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
          '& .MuiLineElement-root': {
            strokeWidth: 4
          },
          '& .MuiMarkElement-root': {
            fill: ACTIVE_ATTORNEYS_LINE_COLOR,
            stroke: '#ffffff',
            strokeWidth: 2
          }
        }}
        width={chartSize.width}
        xAxis={[
          {
            data: years,
            label: 'Year',
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
            tickInterval: yAxisTicks,
            label: 'Active Attorneys',
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
        {pointPositions.map((point, index) => (
          <text
            key={`${point.year}-label`}
            fill="#424242"
            fontSize="16"
            fontWeight="600"
            paintOrder="stroke"
            stroke="#ffffff"
            strokeWidth="4"
            textAnchor={index === 0 ? 'start' : 'middle'}
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
        * Sources:{' '}
        <Link href="https://hsba.org/member-demographics" target="_blank" rel="noopener noreferrer">
          HSBA Member Demographics
        </Link>{' '}
        and{' '}
        <Link href="https://dbedt.hawaii.gov/economic/databook-archive/" target="_blank" rel="noopener noreferrer">
          DBEDT Databook Archive
        </Link>
      </Typography>
    </Box>
  )
}
