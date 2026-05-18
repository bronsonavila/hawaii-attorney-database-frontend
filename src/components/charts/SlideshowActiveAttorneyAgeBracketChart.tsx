import { Box } from '@mui/material'
import { BarChart } from '@mui/x-charts'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { TEAL_NAVY } from '@/constants/colors'
import {
  SLIDESHOW_ACTIVE_ATTORNEY_AGE_BRACKET_ORDER,
  SLIDESHOW_ACTIVE_ATTORNEY_STATUS_ORDER
} from '@/constants/chartConstants'
import { ChartTestId } from '@/types/chart'
import { calculateActiveAttorneyAgeBrackets } from '@/utils/charts/activeAttorneyAgeBracketsUtils'

const STACK_COLORS = {
  Active: TEAL_NAVY[7][0],
  Government: TEAL_NAVY[7][1],
  Judge: TEAL_NAVY[7][2]
} as const

const CHART_MARGIN = { bottom: 72, left: 86, right: 120, top: 24 }
const BAR_WIDTH_RATIO = 0.72
const INSIDE_LABEL_MIN_HEIGHT_PX = 24
const LABEL_FONT_SIZE_PX = 14
const TOTAL_LABEL_FONT_SIZE_PX = 18
const LABEL_HALF_HEIGHT_PX = 10
const LABEL_MIN_SPACING_PX = 24
const CALLOUT_GAP_PX = 20

type LabelPlacement = {
  callout?: boolean
  count: number
  isTotal?: boolean
  key: string
  leaderLineStartX?: number
  leaderLineStartY?: number
  status?: string
  x: number
  y: number
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const spreadTinyLabels = (labels: LabelPlacement[], minY: number, maxY: number): LabelPlacement[] => {
  if (labels.length <= 1) return labels

  const spreadLabels = [...labels].sort((firstLabel, secondLabel) => firstLabel.y - secondLabel.y)

  for (let index = 1; index < spreadLabels.length; index += 1) {
    const previousLabel = spreadLabels[index - 1]
    const currentLabel = spreadLabels[index]

    if (currentLabel.y - previousLabel.y < LABEL_MIN_SPACING_PX) {
      currentLabel.y = previousLabel.y + LABEL_MIN_SPACING_PX
    }
  }

  const overflowBottom = spreadLabels[spreadLabels.length - 1].y - maxY

  if (overflowBottom > 0) {
    spreadLabels.forEach(label => {
      label.y -= overflowBottom
    })
  }

  const overflowTop = minY - spreadLabels[0].y

  if (overflowTop > 0) {
    spreadLabels.forEach(label => {
      label.y += overflowTop
    })
  }

  return spreadLabels
}

export const SlideshowActiveAttorneyAgeBracketChart = () => {
  const containerReference = useRef<HTMLDivElement>(null)
  const [chartSize, setChartSize] = useState({ height: 560, width: 800 })
  const ageBracketData = useMemo(() => calculateActiveAttorneyAgeBrackets(), [])

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

  const series = SLIDESHOW_ACTIVE_ATTORNEY_STATUS_ORDER.map(status => ({
    color: STACK_COLORS[status],
    data: ageBracketData.map(row => row[status]),
    label: status,
    stack: 'age-status' as const
  }))

  const yAxisMax = Math.max(...ageBracketData.map(row => row.count))
  const yAxisCeiling = Math.max(10, Math.ceil((yAxisMax * 1.05) / 10) * 10)

  const labelPlacements = useMemo(() => {
    const plotWidth = chartSize.width - CHART_MARGIN.left - CHART_MARGIN.right
    const plotHeight = chartSize.height - CHART_MARGIN.top - CHART_MARGIN.bottom

    if (plotWidth <= 0 || plotHeight <= 0) return []

    const bandWidth = plotWidth / ageBracketData.length
    const barWidth = bandWidth * BAR_WIDTH_RATIO
    const minLabelY = CHART_MARGIN.top + LABEL_HALF_HEIGHT_PX
    const maxLabelY = CHART_MARGIN.top + plotHeight - LABEL_HALF_HEIGHT_PX

    return ageBracketData.flatMap((row, bracketIndex) => {
      const barCenterX = CHART_MARGIN.left + bandWidth * (bracketIndex + 0.5)
      const tinyLabelX = barCenterX + barWidth / 2 + CALLOUT_GAP_PX
      const tinyLabelLineStartX = barCenterX + barWidth / 2
      let stackedStart = 0

      const insideLabels: LabelPlacement[] = []
      const tinyLabels: LabelPlacement[] = []

      const stackTop = CHART_MARGIN.top + plotHeight - (row.count / yAxisCeiling) * plotHeight
      const totalLabels: LabelPlacement[] = [
        {
          count: row.count,
          isTotal: true,
          key: `${row.bracket}-total`,
          x: barCenterX,
          y: Math.max(LABEL_HALF_HEIGHT_PX, stackTop - LABEL_HALF_HEIGHT_PX - 4)
        }
      ]

      SLIDESHOW_ACTIVE_ATTORNEY_STATUS_ORDER.forEach(status => {
        const value = row[status]

        if (value <= 0) return

        const statusText = status === 'Judge' ? `Judge${value === 1 ? '' : 's'}` : status

        const stackedEnd = stackedStart + value
        const segmentHeight = (value / yAxisCeiling) * plotHeight
        const segmentMiddle = CHART_MARGIN.top + plotHeight - ((stackedStart + value / 2) / yAxisCeiling) * plotHeight

        stackedStart = stackedEnd

        if (segmentHeight >= INSIDE_LABEL_MIN_HEIGHT_PX) {
          insideLabels.push({
            count: value,
            key: `${row.bracket}-${status}`,
            status: statusText,
            x: barCenterX,
            y: clamp(segmentMiddle, minLabelY, maxLabelY)
          })

          return
        }

        tinyLabels.push({
          callout: true,
          count: value,
          key: `${row.bracket}-${status}`,
          leaderLineStartX: tinyLabelLineStartX,
          leaderLineStartY: segmentMiddle,
          status: statusText,
          x: tinyLabelX,
          y: clamp(segmentMiddle, minLabelY, maxLabelY)
        })
      })

      return [...totalLabels, ...insideLabels, ...spreadTinyLabels(tinyLabels, minLabelY, maxLabelY)]
    })
  }, [ageBracketData, chartSize.height, chartSize.width, yAxisCeiling])

  return (
    <Box ref={containerReference} sx={{ flex: 1, minHeight: 320, minWidth: 0, position: 'relative', width: '100%' }}>
      <BarChart
        axisHighlight={{ x: 'none', y: 'none' }}
        data-testid={ChartTestId.SLIDESHOW_ACTIVE_ATTORNEY_AGE_BRACKETS}
        grid={{ horizontal: true }}
        height={chartSize.height}
        margin={CHART_MARGIN}
        series={series}
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
            fontSize: 15,
            fontWeight: 500
          }
        }}
        width={chartSize.width}
        xAxis={[
          {
            data: SLIDESHOW_ACTIVE_ATTORNEY_AGE_BRACKET_ORDER,
            label: 'Age Bracket',
            labelStyle: { fontSize: 18 },
            scaleType: 'band' as const,
            tickLabelInterval: () => true,
            tickLabelStyle: { fontSize: 15, fontWeight: 500 } as const
          }
        ]}
        yAxis={[
          {
            label: 'Attorneys',
            labelStyle: { fontSize: 18 },
            max: yAxisCeiling,
            min: 0
          }
        ]}
      />
      <svg
        aria-hidden="true"
        height={chartSize.height}
        style={{ left: 0, overflow: 'visible', pointerEvents: 'none', position: 'absolute', top: 0, zIndex: 1 }}
        width={chartSize.width}
      >
        {labelPlacements.map(label => (
          <g key={label.key}>
            {label.callout ? (
              <>
                <polyline
                  fill="none"
                  points={[
                    `${label.leaderLineStartX ?? label.x},${label.leaderLineStartY ?? label.y}`,
                    `${(label.leaderLineStartX ?? label.x) + 6},${label.leaderLineStartY ?? label.y}`,
                    `${label.x - 4},${label.y}`
                  ].join(' ')}
                  stroke="#424242"
                  strokeLinejoin="round"
                  strokeWidth={1.25}
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={label.leaderLineStartX}
                  cy={label.leaderLineStartY}
                  fill="#424242"
                  r={2}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              </>
            ) : null}
            <text
              dominantBaseline="middle"
              fill={label.isTotal ? TEAL_NAVY[12][11] : '#424242'}
              fontSize={label.isTotal ? TOTAL_LABEL_FONT_SIZE_PX : LABEL_FONT_SIZE_PX}
              paintOrder="stroke"
              stroke="#ffffff"
              strokeLinejoin="round"
              strokeWidth={4}
              textAnchor={label.callout ? 'start' : 'middle'}
              x={label.x}
              y={label.y}
            >
              {label.isTotal ? (
                <tspan fontWeight={700}>{label.count.toLocaleString()}</tspan>
              ) : (
                <>
                  <tspan fontWeight={700}>{label.count}</tspan>
                  <tspan dx={4} fontWeight={500}>
                    {label.status}
                  </tspan>
                </>
              )}
            </text>
          </g>
        ))}
      </svg>
    </Box>
  )
}
