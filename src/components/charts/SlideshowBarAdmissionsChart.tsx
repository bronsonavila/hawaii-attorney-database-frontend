import { Box } from '@mui/material'
import { BarChart } from '@mui/x-charts'
import type { BarLabelProps } from '@mui/x-charts'
import { DatasetType } from '@mui/x-charts/internals'
import { animated, to, type SpringValue } from '@react-spring/web'
import { SLIDESHOW_LAW_SCHOOL_ORDER, SLIDESHOW_LICENSE_TYPE_ORDER } from '@/constants/chartConstants'
import { ChartTestId, ViewType } from '@/types/chart'
import { useLayoutEffect, useRef, useState } from 'react'

/** Light fills so black labels meet contrast on dark modal backgrounds. */
const SLIDESHOW_BAR_COLORS = {
  eligibleTeal: '#a5dde8',
  limitedAmber: '#ffe0b2',
  notEligibleRose: '#f8d0e0',
  totalTeal: '#a5dde8'
} as const

const LAW_SCHOOL_OTHER_SERIES_ID = 'slideshow-law-school-other'
const LAW_SCHOOL_RICHARDSON_SERIES_ID = 'slideshow-law-school-richardson'
/** Second series in stack order (`Other`) when explicit `id` is omitted by the chart pipeline. */
const LAW_SCHOOL_OTHER_FALLBACK_SERIES_ID = 'auto-generated-id-1'

const COMMON_CHART_PROPS = {
  axisHighlight: { x: 'none', y: 'none' } as const,
  grid: { horizontal: true },
  margin: { bottom: 110, left: 76, right: 20, top: 24 },
  slotProps: {
    legend: {
      direction: 'row' as const,
      position: { horizontal: 'middle' as const, vertical: 'bottom' as const }
    }
  }
}

const TOTAL_SERIES = [{ color: SLIDESHOW_BAR_COLORS.totalTeal, id: 'slideshow-total-count', label: 'Count' }]

const SLIDESHOW_LICENSE_SERIES_COLORS = {
  'Eligible to practice': SLIDESHOW_BAR_COLORS.eligibleTeal,
  'Limited eligibility to practice': SLIDESHOW_BAR_COLORS.limitedAmber,
  'Not eligible to practice': SLIDESHOW_BAR_COLORS.notEligibleRose
} as const

const SLIDESHOW_LICENSE_SERIES = SLIDESHOW_LICENSE_TYPE_ORDER.map(label => ({
  color: SLIDESHOW_LICENSE_SERIES_COLORS[label as keyof typeof SLIDESHOW_LICENSE_SERIES_COLORS],
  id: `slideshow-license-${label.replace(/\s+/g, '-').toLowerCase()}`,
  label
}))

const SLIDESHOW_LAW_SCHOOL_SERIES_COLORS = {
  'William S. Richardson': SLIDESHOW_BAR_COLORS.eligibleTeal,
  Other: SLIDESHOW_BAR_COLORS.limitedAmber
} as const

const SLIDESHOW_LAW_SCHOOL_SERIES = SLIDESHOW_LAW_SCHOOL_ORDER.map(label => ({
  color: SLIDESHOW_LAW_SCHOOL_SERIES_COLORS[label as keyof typeof SLIDESHOW_LAW_SCHOOL_SERIES_COLORS],
  id: label === 'Other' ? LAW_SCHOOL_OTHER_SERIES_ID : LAW_SCHOOL_RICHARDSON_SERIES_ID,
  label
}))

/** Top inset for bar value text; `dominantBaseline="hanging"` keeps glyphs inside the bar (avoids clip-path cropping). */
const TOP_INSIDE_LABEL_OFFSET_PX = 6

type BarLabelSpringStyle = {
  height: SpringValue<number>
  width: SpringValue<number>
  x: SpringValue<number>
  y: SpringValue<number>
}

type BarLabelItemInput = {
  dataIndex: number
  seriesId: number | string
  value: number | null
}

type BarLabelContextInput = {
  bar: { height: number; width: number }
}

/**
 * Places the value at the top inside the bar segment (MUI default centers the label).
 * Uses animated center Y and segment height from the bar label spring.
 */
export const SlideshowBarLabel = (props: BarLabelProps) => {
  const { children, className, style } = props

  const springStyle = style as unknown as BarLabelSpringStyle | undefined

  if (!springStyle) return null

  const labelY = to(
    [springStyle.y, springStyle.height],
    (centerY, segmentHeight) => centerY - segmentHeight / 2 + TOP_INSIDE_LABEL_OFFSET_PX
  )

  return (
    <animated.text
      className={className}
      dominantBaseline="hanging"
      fill="#424242"
      fontSize={16}
      fontWeight={700}
      paintOrder="stroke"
      pointerEvents="none"
      stroke="#ffffff"
      strokeWidth={4}
      textAnchor="middle"
      x={springStyle.x}
      y={labelY}
    >
      {children}
    </animated.text>
  )
}

interface SlideshowBarAdmissionsChartProps {
  data: DatasetType
  viewType: ViewType
}

const getChartTestId = (viewType: ViewType): ChartTestId => {
  switch (viewType) {
    case ViewType.TOTAL:
      return ChartTestId.SLIDESHOW_BAR_ADMISSIONS_TOTAL
    case ViewType.BY_LICENSE_TYPE:
      return ChartTestId.SLIDESHOW_BAR_ADMISSIONS_BY_LICENSE_TYPE
    case ViewType.BY_LAW_SCHOOL:
      return ChartTestId.SLIDESHOW_BAR_ADMISSIONS_BY_LAW_SCHOOL
    default:
      throw new Error(`Unhandled slideshow view type: ${viewType}`)
  }
}

const getSeriesDefinitions = (viewType: ViewType) => {
  switch (viewType) {
    case ViewType.TOTAL:
      return TOTAL_SERIES
    case ViewType.BY_LICENSE_TYPE:
      return SLIDESHOW_LICENSE_SERIES
    case ViewType.BY_LAW_SCHOOL:
      return SLIDESHOW_LAW_SCHOOL_SERIES
    default:
      throw new Error(`Unhandled slideshow view type: ${viewType}`)
  }
}

const minBarHeightForLabelStacked = 24

const buildBarLabelFormatter =
  (viewType: ViewType, rows: { count: number; [key: string]: number | string | undefined }[]) =>
  (item: BarLabelItemInput, context: BarLabelContextInput) => {
    if (viewType === ViewType.TOTAL) {
      if (item.value == null || item.value === 0) return null

      return String(item.value)
    }

    if (viewType === ViewType.BY_LAW_SCHOOL) {
      const seriesIdString = String(item.seriesId)

      const isOtherLawSchoolSeries =
        seriesIdString === LAW_SCHOOL_OTHER_SERIES_ID || seriesIdString === LAW_SCHOOL_OTHER_FALLBACK_SERIES_ID

      const isRichardsonSeries =
        seriesIdString === LAW_SCHOOL_RICHARDSON_SERIES_ID || seriesIdString === 'auto-generated-id-0'

      if (isOtherLawSchoolSeries) {
        if (context.bar.height < minBarHeightForLabelStacked) return null

        const otherCount = Number(rows[item.dataIndex]?.Other ?? item.value ?? 0)

        if (otherCount === 0) return null

        return String(otherCount)
      }

      if (isRichardsonSeries) {
        if (context.bar.height < minBarHeightForLabelStacked) return null

        const richardsonCount = Number(rows[item.dataIndex]?.['William S. Richardson'] ?? item.value ?? 0)

        if (richardsonCount === 0) return null

        return String(richardsonCount)
      }

      if (context.bar.height < minBarHeightForLabelStacked) return null

      if (item.value == null || item.value === 0) return null

      return String(item.value)
    }

    if (context.bar.height < minBarHeightForLabelStacked) return null

    if (item.value == null || item.value === 0) return null

    return String(item.value)
  }

export const SlideshowBarAdmissionsChart = ({ data, viewType }: SlideshowBarAdmissionsChartProps) => {
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

  const attorneyData = data as { year: string; count: number; [key: string]: number | string | undefined }[]
  const years = attorneyData.map(d => d.year)

  // A function is required: otherwise MUI skips alternating x labels to "avoid overlap" (see ChartsXAxis addLabelDimension).
  const xAxis = [
    {
      data: years,
      label: 'Bar Admission Year',
      labelStyle: { fontSize: 12 },
      scaleType: 'band' as const,
      tickLabelInterval: () => true,
      tickLabelStyle: { fontSize: 11 } as const,
      valueFormatter: (value: string) => value.toString()
    }
  ]

  const seriesDefinitions = getSeriesDefinitions(viewType)

  const series =
    viewType === ViewType.TOTAL
      ? seriesDefinitions.map(seriesItem => ({
          ...seriesItem,
          data: attorneyData.map(d => d.count)
        }))
      : seriesDefinitions.map(seriesItem => ({
          ...seriesItem,
          data: attorneyData.map(d => d[seriesItem.label] as number),
          stack: 'count' as const
        }))

  return (
    <Box ref={containerReference} sx={{ flex: 1, minHeight: 320, minWidth: 0, width: '100%' }}>
      <BarChart
        {...COMMON_CHART_PROPS}
        {...(viewType === ViewType.TOTAL
          ? { slotProps: { ...COMMON_CHART_PROPS.slotProps, legend: { hidden: true } } }
          : {})}
        barLabel={buildBarLabelFormatter(viewType, attorneyData)}
        data-testid={getChartTestId(viewType)}
        height={chartSize.height}
        series={series}
        skipAnimation
        slots={{ barLabel: SlideshowBarLabel }}
        sx={{
          '& .MuiBarElement-root': { fillOpacity: 1 },
          '& .MuiChartsAxis-tickLabel': { fontSize: 11 },
          '& .MuiChartsAxis-directionY .MuiChartsAxis-label': {
            transform: 'translateX(-20px)'
          },
          '& .MuiChartsAxis-directionX .MuiChartsAxis-label': {
            transform: 'translateY(10px)'
          }
        }}
        width={chartSize.width}
        xAxis={xAxis}
        yAxis={[{ label: 'Attorneys Admitted', labelStyle: { fontSize: 12 } }]}
      />
    </Box>
  )
}
