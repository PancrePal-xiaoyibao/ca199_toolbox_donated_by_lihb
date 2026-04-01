import { useEffect, useMemo, useRef } from 'react'
import { LineChart } from 'echarts/charts'
import { DataZoomComponent, GridComponent, MarkPointComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { EChartsType, init, use } from 'echarts/core'
import type { MedicationSpan } from '../../lib/models'

use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, MarkPointComponent, CanvasRenderer])

interface MedicationTimelineProps {
  medications: MedicationSpan[]
  minTime?: number
  maxTime?: number
  fullMinTime?: number
  fullMaxTime?: number
  onRangeChange?: (range: { min?: number; max?: number }) => void
}

const COLORS = ['#FF6B6B', '#FFD93D', '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD', '#FFB347', '#8BC34A']
type TimelineMarkPoint = {
  coord: [number, number]
  value: string
  label: {
    show: boolean
    position: string
    formatter: string
    fontSize: number
    padding: number[]
    fontWeight: string
    color: string
  }
  symbol: string
  symbolSize: number
  itemStyle: { color: string }
}

type DataZoomEvent = {
  batch?: Array<{ start?: number; end?: number; startValue?: number; endValue?: number }>
  start?: number
  end?: number
  startValue?: number
  endValue?: number
}

export default function MedicationTimeline({
  medications,
  minTime,
  maxTime,
  fullMinTime,
  fullMaxTime,
  onRangeChange,
}: MedicationTimelineProps) {
  const chartRef = useRef<HTMLDivElement | null>(null)

  const regimens = useMemo(() => [...new Set(medications.map((item) => item.drugName))], [medications])

  const series = useMemo(
    () =>
      regimens.map((regimen, index) => {
        const items = medications.filter((item) => item.drugName === regimen)
        const data: Array<[number, number | null]> = []
        const markPoints: TimelineMarkPoint[] = []

        items.forEach((item) => {
          const start = new Date(item.startDate).getTime()
          const end = new Date(item.endDate || item.startDate).getTime()
          const durationDays = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 1)
          data.push([start, 0.5], [end, 0.5], [end, null])

          const durationText =
            durationDays >= 30
              ? `${Math.floor(durationDays / 30)}个月${durationDays % 30 ? `${durationDays % 30}天` : ''}`
              : `${durationDays}天`

          const midTime = (start + end) / 2
          markPoints.push({
            coord: [midTime, 0.5],
            value: `${item.tag || item.drugName}\n(${durationText})\n${item.startDate.slice(2)} 到 ${(item.endDate || item.startDate).slice(2)}`,
            label: {
              show: true,
              position: 'middle',
              formatter: '{c}',
              fontSize: 12,
              padding: [10, 6],
              fontWeight: 'bold',
              color: '#ffffff',
            },
            symbol: 'circle',
            symbolSize: 1,
            itemStyle: { color: 'transparent' },
          })
        })

        return {
          name: regimen,
          type: 'line',
          symbol: 'none',
          lineStyle: { width: 0 },
          areaStyle: {
            color: COLORS[index % COLORS.length],
            opacity: 0.72,
          },
          data,
          markPoint: {
            data: markPoints,
          },
        }
      }),
    [medications, regimens],
  )

  useEffect(() => {
    if (!chartRef.current) return undefined
    const chart: EChartsType = init(chartRef.current)
    chart.setOption({
      title: {
        text: '用药时间轴',
        left: 'center',
        textStyle: { fontSize: 14, color: '#2c342f' },
      },
      grid: { top: 24, bottom: 22, left: 8, right: 8 },
      tooltip: {
        trigger: 'item',
        formatter: (params: { seriesName?: string }) => params.seriesName ?? '',
      },
      xAxis: {
        type: 'time',
        min: minTime,
        max: maxTime,
        axisLabel: { formatter: '{yyyy}-{MM}', color: '#5b6760' },
      },
      yAxis: { type: 'value', show: false, min: 0, max: 1 },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          height: 18,
          bottom: 4,
          fillerColor: 'rgba(60, 180, 255, 0.15)',
          startValue: minTime,
          endValue: maxTime,
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          startValue: minTime,
          endValue: maxTime,
        },
      ],
      series,
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
  }, [fullMaxTime, fullMinTime, maxTime, minTime, onRangeChange, series])

  if (!medications.length) {
    return <p className="matrix-empty">暂无用药记录</p>
  }

  return <div ref={chartRef} className="timeline-chart" aria-label="用药时间轴图" />
}
