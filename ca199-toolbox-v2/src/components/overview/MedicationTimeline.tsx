import { useEffect, useMemo, useRef } from 'react'
import { LineChart } from 'echarts/charts'
import { DataZoomComponent, GridComponent, MarkPointComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { EChartsType, connect, init, use } from 'echarts/core'
import type { MedicationSpan } from '../../lib/models'

use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, MarkPointComponent, CanvasRenderer])

interface MedicationTimelineProps {
  medications: MedicationSpan[]
  minTime?: number
  maxTime?: number
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

const CHART_SYNC_GROUP = 'overview-timeline-sync'

export default function MedicationTimeline({
  medications,
  minTime,
  maxTime,
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

          const labelText =
            durationDays < 75
              ? `${item.tag || item.drugName}\n(${durationText})`
              : `${item.tag || item.drugName}\n(${durationText})\n${item.startDate.slice(2)} 到 ${(item.endDate || item.startDate).slice(2)}`

          const midTime = (start + end) / 2
          markPoints.push({
            coord: [midTime, 0.5],
            value: labelText,
            label: {
              show: true,
              position: 'middle',
              formatter: '{c}',
              fontSize: 11,
              padding: [10, 6],
              fontWeight: 'bold',
              color: '#18303a',
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
    chart.group = CHART_SYNC_GROUP
    connect(CHART_SYNC_GROUP)
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
          realtime: false,
          brushSelect: false,
          moveHandleSize: 10,
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

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(chartRef.current)
    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }, [maxTime, minTime, series])

  if (!medications.length) {
    return <p className="matrix-empty">暂无用药记录</p>
  }

  return <div ref={chartRef} className="timeline-chart" aria-label="用药时间轴图" />
}
