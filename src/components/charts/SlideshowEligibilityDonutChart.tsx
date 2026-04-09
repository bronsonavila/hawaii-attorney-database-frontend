import { Box, Typography } from '@mui/material'
import { PieChart } from '@mui/x-charts'
import { useLayoutEffect, useRef, useState } from 'react'
import { SLIDESHOW_BAR_ADMISSIONS_END_YEAR } from '@/constants/chartConstants'
import { ChartTestId } from '@/types/chart'

const SLIDESHOW_BAR_COLORS = {
  'Eligible to practice': '#a5dde8',
  'Limited eligibility to practice': '#ffe0b2',
  'Not eligible to practice': '#f8d0e0'
} as const

interface SlideshowEligibilityDonutChartProps {
  data: { id: string; label: string; value: number }[]
}

const getPercentageLabel = (value: number, total: number) => {
  if (total === 0) return '0%'

  const percentage = (value / total) * 100
  const rounded = percentage >= 10 ? percentage.toFixed(1) : percentage.toFixed(2)

  return `${rounded.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')}%`
}

const getPolarPoint = (centerX: number, centerY: number, radius: number, angleDegrees: number) => {
  const angleRadians = (angleDegrees * Math.PI) / 180

  return {
    x: centerX + radius * Math.sin(angleRadians),
    y: centerY - radius * Math.cos(angleRadians)
  }
}

export const SlideshowEligibilityDonutChart = ({ data }: SlideshowEligibilityDonutChartProps) => {
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

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const donutDiameter = Math.min(chartSize.width * 0.55, chartSize.height * 0.75)
  const outerRadius = Math.max(180, donutDiameter / 2)
  const innerRadius = outerRadius * 0.68

  const chartCenterX = chartSize.width / 2
  const chartCenterY = chartSize.height / 2

  const callouts =
    total === 0
      ? []
      : data.reduce<
          Array<{
            color: string
            label: string
            value: number
            percentage: string
            isRightSide: boolean
            startX: number
            startY: number
            endX: number
            endY: number
          }>
        >((result, item) => {
          const previousAngle = result.reduce((sum, currentItem) => {
            const currentValue = data.find(dataItem => dataItem.label === currentItem.label)?.value || 0
            return sum + (currentValue / total) * 360
          }, 0)

          const sliceAngle = (item.value / total) * 360
          const midAngle = previousAngle + sliceAngle / 2
          const isRightSide = Math.sin((midAngle * Math.PI) / 180) >= 0

          const startPoint = getPolarPoint(chartCenterX, chartCenterY, outerRadius + 6, midAngle)
          const endPoint = getPolarPoint(chartCenterX, chartCenterY, outerRadius + 36, midAngle)

          result.push({
            color: '#9E9E9E',
            label: item.label,
            value: item.value,
            percentage: getPercentageLabel(item.value, total),
            isRightSide,
            startX: startPoint.x,
            startY: startPoint.y,
            endX: endPoint.x,
            endY: endPoint.y
          })

          return result
        }, [])

  return (
    <Box ref={containerReference} sx={{ flex: 1, minHeight: 320, minWidth: 0, position: 'relative', width: '100%' }}>
      <PieChart
        data-testid={ChartTestId.SLIDESHOW_ELIGIBILITY_DONUT}
        height={chartSize.height}
        margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
        series={[
          {
            data: data.map(d => ({
              ...d,
              label: d.label,
              color: SLIDESHOW_BAR_COLORS[d.label as keyof typeof SLIDESHOW_BAR_COLORS]
            })),
            innerRadius,
            outerRadius,
            paddingAngle: 0,
            cornerRadius: 0,
            cx: chartCenterX,
            cy: chartCenterY
          }
        ]}
        skipAnimation
        slotProps={{
          legend: { hidden: true }
        }}
        width={chartSize.width}
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
        {callouts.map(callout => (
          <g key={callout.label}>
            <circle cx={callout.startX} cy={callout.startY} fill={callout.color} r="3" />
            <line
              x1={callout.startX}
              y1={callout.startY}
              x2={callout.endX}
              y2={callout.endY}
              stroke={callout.color}
              strokeWidth="1.5"
            />
          </g>
        ))}
      </Box>

      {callouts.map(callout => (
        <Box
          key={`${callout.label}-label`}
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            top: callout.endY,
            transform: 'translateY(-50%)',
            ...(callout.isRightSide
              ? { left: callout.endX + 8, textAlign: 'left' }
              : { right: chartSize.width - callout.endX + 8, textAlign: 'right' }),
            maxWidth: 320
          }}
        >
          <Typography sx={{ color: 'text.primary', fontSize: 22, fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}>
            {callout.label}
          </Typography>
          <Typography sx={{ fontSize: 20, lineHeight: 1.2 }}>
            <Box component="span" sx={{ color: 'text.primary' }}>
              {callout.value.toLocaleString()}
            </Box>{' '}
            <Box component="span" sx={{ color: 'text.secondary' }}>
              ({callout.percentage})
            </Box>
          </Typography>
        </Box>
      ))}

      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          height: innerRadius * 2,
          justifyContent: 'center',
          left: 0,
          pointerEvents: 'none',
          position: 'absolute',
          top: chartCenterY,
          transform: 'translateY(-50%)',
          width: '100%'
        }}
      >
        <Typography sx={{ color: 'text.primary', fontSize: 64, fontWeight: 700, lineHeight: 1, mb: 0.5 }}>
          {total.toLocaleString()}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 20 }}>
          Attorneys admitted as of {SLIDESHOW_BAR_ADMISSIONS_END_YEAR}
        </Typography>
      </Box>
    </Box>
  )
}
