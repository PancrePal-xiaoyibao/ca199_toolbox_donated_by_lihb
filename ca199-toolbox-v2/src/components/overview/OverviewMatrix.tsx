import { useMemo, useState } from 'react'
import type { ImportedDataset, MedicationSpan, TimelineEvent } from '../../lib/models'
import { formatDate } from '../../lib/date'
import { buildMetricGroups } from '../../lib/metric-groups'
import MiniTrendLine from './MiniTrendLine'

interface OverviewMatrixProps {
  dataset: ImportedDataset
}

function dateBand(dataset: ImportedDataset): string {
  const allDates = [
    ...dataset.indicators.map((item) => item.date),
    ...dataset.medications.flatMap((item) => [item.startDate, item.endDate].filter(Boolean) as string[]),
    ...dataset.events.map((item) => item.eventDate),
  ].sort()

  if (!allDates.length) return '暂无时间数据'
  return `${formatDate(allDates[0])} 至 ${formatDate(allDates[allDates.length - 1])}`
}

function medicationLabel(item: MedicationSpan): string {
  return item.tag || item.drugName
}

function eventLabel(event: TimelineEvent): string {
  return event.title || event.eventType
}

export default function OverviewMatrix({ dataset }: OverviewMatrixProps) {
  const groups = useMemo(() => buildMetricGroups(dataset.indicators), [dataset.indicators])
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  function toggleGroup(key: string) {
    setCollapsedGroups((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  function setAllGroups(collapsed: boolean) {
    setCollapsedGroups(
      Object.fromEntries(groups.map((group) => [group.key, collapsed])),
    )
  }

  return (
    <section className="paper-panel matrix-panel">
      <div className="matrix-topbar">
        <div>
          <p className="eyebrow">统一病程容器</p>
          <h2>病程总览矩阵</h2>
          <p className="body-copy">
            所有治疗、事件和指标组共享同一时间语义。默认全部展开，可单独折叠。
          </p>
        </div>
        <div className="matrix-actions">
          <span className="matrix-band">{dateBand(dataset)}</span>
          <button type="button" className="ghost-chip" onClick={() => setAllGroups(false)}>
            全部展开
          </button>
          <button type="button" className="ghost-chip" onClick={() => setAllGroups(true)}>
            全部折叠
          </button>
        </div>
      </div>

      <div className="overview-strip">
        <div className="overview-strip-label">
          <strong>Overview</strong>
          <span>统一时间轴</span>
        </div>
        <div className="overview-strip-body">
          {groups.slice(0, 1).map((group) =>
            group.summaryMetrics.map((metric) => (
              <MiniTrendLine
                key={`strip-${metric}`}
                metric={metric}
                points={dataset.indicators.filter((point) => point.name === metric)}
                compact
              />
            )),
          )}
        </div>
      </div>

      <div className="matrix-section">
        <div className="matrix-row-header">
          <strong>治疗方案</strong>
          <span>{dataset.medications.length} 条</span>
        </div>
        <div className="matrix-lane">
          {dataset.medications.length ? (
            dataset.medications.map((item) => (
              <div key={`${item.startDate}-${item.drugName}`} className="matrix-pill treatment">
                <strong>{medicationLabel(item)}</strong>
                <span>{formatDate(item.startDate)} 至 {formatDate(item.endDate)}</span>
              </div>
            ))
          ) : (
            <p className="matrix-empty">暂无治疗数据</p>
          )}
        </div>
      </div>

      <div className="matrix-section">
        <div className="matrix-row-header">
          <strong>关键事件</strong>
          <span>{dataset.events.length} 条</span>
        </div>
        <div className="matrix-lane">
          {dataset.events.length ? (
            dataset.events.map((event) => (
              <div key={`${event.eventDate}-${event.title}`} className="matrix-pill event">
                <strong>{eventLabel(event)}</strong>
                <span>{formatDate(event.eventDate)}</span>
              </div>
            ))
          ) : (
            <p className="matrix-empty">暂无事件数据</p>
          )}
        </div>
      </div>

      {groups.map((group) => {
        const isCollapsed = Boolean(collapsedGroups[group.key])
        const metricsToRender = isCollapsed ? group.summaryMetrics : group.metrics

        return (
          <div key={group.key} className="matrix-section is-group">
            <button type="button" className="matrix-row-header matrix-toggle" onClick={() => toggleGroup(group.key)}>
              <div>
                <strong>{group.title}</strong>
                <span>{group.metrics.length} 个指标</span>
              </div>
              <span>{isCollapsed ? '展开' : '折叠'}</span>
            </button>

            <div className="matrix-group-body">
              {metricsToRender.map((metric) => (
                <div key={metric} className="metric-lane">
                  <div className="metric-lane-label">
                    <strong>{metric}</strong>
                    <span>{isCollapsed ? '组摘要视图' : '独立折线区域'}</span>
                  </div>
                  <MiniTrendLine metric={metric} points={dataset.indicators.filter((point) => point.name === metric)} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
