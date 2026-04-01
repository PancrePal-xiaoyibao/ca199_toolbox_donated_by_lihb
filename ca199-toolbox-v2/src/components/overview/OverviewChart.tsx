import { useEffect, useMemo, useRef } from 'react'
import { LineChart } from 'echarts/charts'
import { DataZoomComponent, GraphicComponent, GridComponent, LegendComponent, MarkLineComponent, MarkPointComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { EChartsType, init, use } from 'echarts/core'
import type { IndicatorPoint, TimelineEvent } from '../../lib/models'

use([LineChart, GridComponent, TooltipComponent, LegendComponent, GraphicComponent, DataZoomComponent, MarkPointComponent, MarkLineComponent, CanvasRenderer])

interface OverviewChartProps {
  metrics: string[]
  points: IndicatorPoint[]
  events: TimelineEvent[]
  showKeyPoints: boolean
  showChangeRate: boolean
  changeThreshold: number
  percentThreshold: number
  minTime?: number
  maxTime?: number
  fullMinTime?: number
  fullMaxTime?: number
  onRangeChange?: (range: { min?: number; max?: number }) => void
}

const SERIES_COLORS = ['#2f5f73', '#7a9e4d', '#9b4a42', '#8a6d4f', '#5b6ac9']
type MarkPointItem = {
  coord: [string, number]
  value: number
  label: {
    show: boolean
    formatter: string
    color: string
    fontSize: number
    offset?: [number, number]
  }
}

type DataZoomEvent = {
  batch?: Array<{ start?: number; end?: number; startValue?: number; endValue?: number }>
  start?: number
  end?: number
  startValue?: number
  endValue?: number
}

export default function OverviewChart({
  metrics,
  points,
  events,
  showKeyPoints,
  showChangeRate,
  changeThreshold,
  percentThreshold,
  minTime,
  maxTime,
  fullMinTime,
  fullMaxTime,
  onRangeChange,
}: OverviewChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null)

  const series = useMemo(
    () =>
      metrics.map((metric, index) => {
        const metricPoints = points
          .filter((point) => point.name === metric)
          .sort((a, b) => a.date.localeCompare(b.date))
        const keyMarkers: MarkPointItem[] = []
        const changeMarkers: MarkPointItem[] = []
        const seriesData = metricPoints.map((point) => [new Date(point.date).getTime(), point.value, point.value] as [number, number, number])

        if (showKeyPoints && metricPoints.length > 0) {
          const values = metricPoints.map((point) => point.value)
          const min = Math.min(...values)
          const max = Math.max(...values)
          const last = metricPoints[metricPoints.length - 1]
          metricPoints.forEach((point) => {
            if (point.value === min || point.value === max || point.date === last.date) {
              keyMarkers.push({
                coord: [point.date, point.value],
                value: point.value,
                label: {
                  show: true,
                  formatter: point.date === last.date ? `${metric}\n${point.value}` : `${point.value}`,
                  color: '#27332d',
                  fontSize: 11,
                },
              })
            }
          })
        }

        if (showChangeRate && metricPoints.length >= 2) {
          for (let i = 1; i < metricPoints.length; i += 1) {
            const prev = metricPoints[i - 1]
            const curr = metricPoints[i]
            const diff = curr.value - prev.value
            const percent = prev.value !== 0 ? (diff / prev.value) * 100 : 0
            if (Math.abs(diff) >= changeThreshold && Math.abs(percent) >= percentThreshold) {
              changeMarkers.push({
                coord: [curr.date, curr.value],
                value: curr.value,
                label: {
                  show: true,
                  formatter: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} (${percent > 0 ? '+' : ''}${percent.toFixed(1)}%)`,
                  color: diff >= 0 ? '#9b4a42' : '#2f5f73',
                  fontSize: 10,
                  offset: [0, diff >= 0 ? -18 : 18],
                },
              })
            }
          }
        }

        return {
          name: metric,
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 2.5, color: SERIES_COLORS[index % SERIES_COLORS.length] },
          itemStyle: { color: SERIES_COLORS[index % SERIES_COLORS.length] },
          emphasis: { focus: 'series' },
          data: seriesData.map((item) => [item[0], item[1]]),
          markPoint: {
            symbolSize: 7,
            data: [...keyMarkers, ...changeMarkers],
          },
          markLine: {
            symbol: 'none',
            data: events.map((event) => ({
              xAxis: event.eventDate,
              label: {
                show: true,
                formatter: `${event.eventDate}\n\n${event.title}`,
                fontWeight: 'bold',
                fontSize: 11,
                padding: [6, 8],
                position: 'middle',
                rotate: 0,
                offset: [event.offsetX ?? 0, (event.offsetY ?? 0) - 10],
              },
              lineStyle: {
                color: '#999',
                type: 'dashed',
                width: 1,
              },
            })),
          },
        }
      }),
    [changeThreshold, events, metrics, percentThreshold, points, showChangeRate, showKeyPoints],
  )

  const chartTitle = useMemo(() => {
    if (fullMinTime === undefined || fullMaxTime === undefined) return '指标趋势图'
    const startYear = new Date(fullMinTime).getFullYear()
    const endYear = new Date(fullMaxTime).getFullYear()
    return `指标趋势图 (${startYear}-${endYear})`
  }, [fullMaxTime, fullMinTime])

  useEffect(() => {
    if (!chartRef.current) return undefined
    const chart: EChartsType = init(chartRef.current)
    chart.setOption({
      animationDuration: 500,
      legend: {
        top: 0,
        textStyle: { color: '#4c5851' },
      },
      title: {
        text: chartTitle,
        left: 'center',
        textStyle: { fontSize: 16, color: '#2c342f' },
      },
      grid: { left: 46, right: 24, top: 48, bottom: 46 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'time',
        min: minTime,
        max: maxTime,
        axisLabel: { color: '#55615b' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#55615b' },
        splitLine: { lineStyle: { color: 'rgba(51, 61, 57, 0.08)' } },
      },
      series,
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          height: 20,
          bottom: 20,
          fillerColor: 'rgba(60, 180, 255, 0.15)',
          startValue: minTime,
          endValue: maxTime,
        },
        { type: 'inside', xAxisIndex: 0, zoomOnMouseWheel: true, moveOnMouseMove: true },
      ],
    })

    const handleZoom = (event: unknown) => {
      const payloadSource = (event as DataZoomEvent | undefined)?.batch?.[0] ?? (event as DataZoomEvent | undefined)
      if (!payloadSource) return
      const payload = payloadSource
      if (payload.startValue !== undefined || payload.endValue !== undefined) {
        onRangeChange?.({ min: payload.startValue, max: payload.endValue })
        return
      }

      if (fullMinTime !== undefined && fullMaxTime !== undefined && payload.start !== undefined && payload.end !== undefined) {
        const total = fullMaxTime - fullMinTime
        onRangeChange?.({
          min: fullMinTime + (payload.start / 100) * total,
          max: fullMinTime + (payload.end / 100) * total,
        })
      }
    }

    chart.on('datazoom', handleZoom)
    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(chartRef.current)
    return () => {
      chart.off('datazoom', handleZoom)
      resizeObserver.disconnect()
      chart.dispose()
    }
  }, [chartTitle, fullMaxTime, fullMinTime, maxTime, minTime, onRangeChange, series])

  return <div ref={chartRef} className="overview-chart" aria-label="多指标趋势图" />
}
