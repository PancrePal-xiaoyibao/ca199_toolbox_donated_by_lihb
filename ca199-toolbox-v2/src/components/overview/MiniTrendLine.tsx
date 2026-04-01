import { useMemo } from 'react'
import type { IndicatorPoint } from '../../lib/models'
import { formatNumber } from '../../lib/format'

interface MiniTrendLineProps {
  metric: string
  points: IndicatorPoint[]
  compact?: boolean
}

function buildPath(points: IndicatorPoint[], width: number, height: number): string {
  if (!points.length) return ''
  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width
      const y = height - ((point.value - min) / range) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

export default function MiniTrendLine({ metric, points, compact = false }: MiniTrendLineProps) {
  const sorted = useMemo(
    () => [...points].sort((left, right) => left.date.localeCompare(right.date)),
    [points],
  )

  const width = 720
  const height = compact ? 42 : 88
  const path = buildPath(sorted, width, height)
  const latest = sorted[sorted.length - 1]

  return (
    <div className={compact ? 'mini-trend compact' : 'mini-trend'}>
      <div className="mini-trend-header">
        <strong>{metric}</strong>
        <span>{formatNumber(latest?.value)}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height + 8}`} preserveAspectRatio="none" className="mini-trend-svg" aria-label={`${metric} 趋势`}>
        <defs>
          <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(47,95,115,0.20)" />
            <stop offset="100%" stopColor="rgba(47,95,115,0.02)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2={width}
            y1={height * ratio}
            y2={height * ratio}
            className="mini-grid-line"
          />
        ))}
        {path ? <path d={`${path} L ${width},${height} L 0,${height} Z`} fill={`url(#fill-${metric})`} className="mini-fill-path" /> : null}
        {path ? <path d={path} className="mini-line-path" /> : null}
        {sorted.map((point, index) => {
          const values = sorted.map((item) => item.value)
          const min = Math.min(...values)
          const max = Math.max(...values)
          const range = max - min || 1
          const x = sorted.length === 1 ? width / 2 : (index / (sorted.length - 1)) * width
          const y = height - ((point.value - min) / range) * height
          return <circle key={`${metric}-${point.date}`} cx={x} cy={y} r={compact ? 2.6 : 3.6} className="mini-point" />
        })}
      </svg>
    </div>
  )
}
