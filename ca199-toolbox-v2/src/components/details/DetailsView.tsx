import { useMemo } from 'react'
import { useAppStore } from '../../app/store'
import { formatDate } from '../../lib/date'
import { formatNumber, joinDetail } from '../../lib/format'
import EmptyState from '../common/EmptyState'

export default function DetailsView() {
  const dataset = useAppStore((state) => state.dataset)

  const groupedMetrics = useMemo(() => {
    if (!dataset) return []
    const groups = new Map<string, number[]>()
    dataset.indicators.forEach((point) => {
      const bucket = groups.get(point.name) ?? []
      bucket.push(point.value)
      groups.set(point.name, bucket)
    })
    return [...groups.entries()].map(([name, values]) => ({
      name,
      latest: values[values.length - 1],
      high: Math.max(...values),
      low: Math.min(...values),
      count: values.length,
    }))
  }, [dataset])

  if (!dataset) {
    return <EmptyState title="等待详情数据" body="导入文件后，这里会展开多指标、检验明细和关键病程证据。" />
  }

  return (
    <section className="tab-section two-column">
      <article className="paper-panel">
        <p className="eyebrow">多指标概览</p>
        <h2>核心检验指标</h2>
        <div className="metric-table">
          {groupedMetrics.map((metric) => (
            <div key={metric.name} className="metric-row">
              <div>
                <strong>{metric.name}</strong>
                <small>{metric.count} 次记录</small>
              </div>
              <div>
                <span>最近 {formatNumber(metric.latest)}</span>
                <small>区间 {formatNumber(metric.low)} - {formatNumber(metric.high)}</small>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="paper-panel">
        <p className="eyebrow">证据层</p>
        <h2>明细记录与说明</h2>
        <div className="detail-list">
          {dataset.events.map((event) => (
            <div key={`${event.eventDate}-${event.title}`} className="detail-card">
              <div className="detail-head">
                <strong>{event.title}</strong>
                <span>{formatDate(event.eventDate)}</span>
              </div>
              <p>{joinDetail([event.description, event.doctorNote, event.patientNote, event.nextStep]) || '暂无补充说明'}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
