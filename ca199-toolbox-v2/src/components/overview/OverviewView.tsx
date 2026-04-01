import { useMemo } from 'react'
import dayjs from 'dayjs'
import { useAppStore } from '../../app/store'
import { formatDate, formatDurationRange } from '../../lib/date'
import { buildMetricGroups } from '../../lib/metric-groups'
import EmptyState from '../common/EmptyState'
import OverviewChart from './OverviewChart'
import { useState } from 'react'
import MedicationTimeline from './MedicationTimeline'
import MedicationLegend from './MedicationLegend'

export default function OverviewView() {
  const dataset = useAppStore((state) => state.dataset)
  const activeMetrics = useAppStore((state) => state.activeMetrics)
  const toggleMetric = useAppStore((state) => state.toggleMetric)
  const timeRange = useAppStore((state) => state.timeRange)
  const setTimeRange = useAppStore((state) => state.setTimeRange)
  const indicators = dataset?.indicators ?? []
  const events = dataset?.events ?? []
  const medications = dataset?.medications ?? []
  const hasData = indicators.length > 0
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [metricSearch, setMetricSearch] = useState('')
  const [showKeyPoints, setShowKeyPoints] = useState(true)
  const [showChangeRate, setShowChangeRate] = useState(false)
  const [changeThreshold, setChangeThreshold] = useState(0)
  const [percentThreshold, setPercentThreshold] = useState(20)

  const groups = useMemo(() => buildMetricGroups(indicators), [indicators])
  const endDate = indicators
    .map((point) => dayjs(point.date))
    .filter((value) => value.isValid())
    .sort((left, right) => left.valueOf() - right.valueOf())
  const latestDate = endDate[endDate.length - 1]

  const startCutoff = useMemo(() => {
    if (!latestDate || timeRange === 'all') return null
    if (timeRange === '12m') return latestDate.subtract(12, 'month')
    if (timeRange === '6m') return latestDate.subtract(6, 'month')
    return latestDate.subtract(3, 'month')
  }, [latestDate, timeRange])

  const filteredIndicators = indicators.filter((point) => {
    if (!startCutoff) return true
    const date = dayjs(point.date)
    return !date.isValid() || date.isAfter(startCutoff) || date.isSame(startCutoff, 'day')
  })

  const filteredEvents = events.filter((event) => {
    if (!startCutoff) return true
    const date = dayjs(event.eventDate)
    return !date.isValid() || date.isAfter(startCutoff) || date.isSame(startCutoff, 'day')
  })

  const filteredMedications = medications.filter((item) => {
    if (!startCutoff) return true
    const date = dayjs(item.endDate || item.startDate)
    return !date.isValid() || date.isAfter(startCutoff) || date.isSame(startCutoff, 'day')
  })
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      metrics: group.metrics.filter((metric) => metric.toLowerCase().includes(metricSearch.trim().toLowerCase())),
    }))
    .filter((group) => group.metrics.length > 0)

  const allTimePoints = [
    ...filteredIndicators.map((item) => new Date(item.date).getTime()),
    ...filteredMedications.flatMap((item) => [new Date(item.startDate).getTime(), new Date(item.endDate || item.startDate).getTime()]),
    ...filteredEvents.map((item) => new Date(item.eventDate).getTime()),
  ].filter((value) => Number.isFinite(value))

  let minTime = allTimePoints.length ? Math.min(...allTimePoints) : undefined
  let maxTime = allTimePoints.length ? Math.max(...allTimePoints) : undefined

  if (minTime !== undefined && maxTime !== undefined) {
    const range = maxTime - minTime
    const padding = range * 0.05 || 24 * 60 * 60 * 1000
    minTime -= padding
    maxTime += padding
  }

  function toggleGroup(key: string) {
    setCollapsedGroups((current) => ({ ...current, [key]: !current[key] }))
  }

  if (!hasData) {
    return <EmptyState title="等待病程数据" body="先导入标准化导出文件，系统会自动生成默认总览。" />
  }

  return (
    <section className="tab-section">
      <div className="overview-layout">
        <aside className="paper-panel selector-panel-v2">
          <div className="selector-block">
            <p className="eyebrow">时间范围</p>
            <div className="range-chip-row">
              {[
                ['3m', '近3月'],
                ['6m', '近6月'],
                ['12m', '近12月'],
                ['all', '全部'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={timeRange === key ? 'range-chip is-active' : 'range-chip'}
                  onClick={() => setTimeRange(key as 'all' | '12m' | '6m' | '3m')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="selector-block">
            <p className="eyebrow">指标选择器</p>
            <input
              type="text"
              className="metric-search-input"
              placeholder="搜索指标..."
              value={metricSearch}
              onChange={(event) => setMetricSearch(event.target.value)}
            />
            <div className="grouped-selector">
              {visibleGroups.map((group) => {
                const collapsed = Boolean(collapsedGroups[group.key])
                return (
                  <section key={group.key} className="metric-group-card">
                    <button type="button" className="metric-group-header" onClick={() => toggleGroup(group.key)}>
                      <div>
                        <strong>{group.title}</strong>
                        <span>{group.metrics.length} 项</span>
                      </div>
                      <span>{collapsed ? '展开' : '折叠'}</span>
                    </button>
                    {!collapsed ? (
                      <div className="metric-checklist">
                        {group.metrics.map((metric) => {
                          const checked = activeMetrics.includes(metric)
                          return (
                            <label key={metric} className={checked ? 'metric-option is-active' : 'metric-option'}>
                              <input type="checkbox" checked={checked} onChange={() => toggleMetric(metric)} aria-label={metric} />
                              <span>{metric}</span>
                            </label>
                          )
                        })}
                      </div>
                    ) : null}
                  </section>
                )
              })}
            </div>
          </div>

          <div className="selector-block">
            <p className="eyebrow">显示控制</p>
            <label className={showKeyPoints ? 'metric-option is-active' : 'metric-option'}>
              <input type="checkbox" checked={showKeyPoints} onChange={() => setShowKeyPoints((value) => !value)} />
              <span>关键点</span>
            </label>
            <label className={showChangeRate ? 'metric-option is-active' : 'metric-option'}>
              <input type="checkbox" checked={showChangeRate} onChange={() => setShowChangeRate((value) => !value)} />
              <span>变化率</span>
            </label>
            {showChangeRate ? (
              <div className="threshold-stack">
                <label>
                  <span>数值变化 ≥</span>
                  <input type="number" value={changeThreshold} min="0" step="0.1" onChange={(event) => setChangeThreshold(Number(event.target.value) || 0)} />
                </label>
                <label>
                  <span>变化幅度 ≥ {Math.round(percentThreshold)}%</span>
                  <input type="range" min="0" max="100" value={percentThreshold} onChange={(event) => setPercentThreshold(Number(event.target.value))} />
                </label>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="overview-main-column">
          <section className="paper-panel overview-stack-panel">
            <OverviewChart
              metrics={activeMetrics}
              points={filteredIndicators.filter((point) => activeMetrics.includes(point.name))}
              events={filteredEvents}
              showKeyPoints={showKeyPoints}
              showChangeRate={showChangeRate}
              changeThreshold={changeThreshold}
              percentThreshold={percentThreshold}
              minTime={minTime}
              maxTime={maxTime}
            />
            <div className="timeline-subsection">
              <MedicationTimeline
                medications={filteredMedications}
                minTime={minTime}
                maxTime={maxTime}
              />
            </div>
            <div className="legend-subsection">
              <MedicationLegend medications={filteredMedications} />
            </div>
          </section>

          <div className="overview-support-grid">
            <article className="paper-panel">
              <p className="eyebrow">用药方案</p>
              <h3>当前与历史方案</h3>
              <ul className="timeline-list">
                {filteredMedications.map((item) => (
                  <li key={`${item.startDate}-${item.drugName}`}>
                    <strong>{item.tag || item.drugName}</strong>
                    <span>
                      {formatDate(item.startDate)} 至 {formatDate(item.endDate)}（{formatDurationRange(item.startDate, item.endDate)}）
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="paper-panel">
              <p className="eyebrow">关键事件</p>
              <h3>标注与复查节点</h3>
              <ul className="timeline-list">
                {filteredEvents.map((event) => (
                  <li key={`${event.eventDate}-${event.title}`}>
                    <strong>{event.title}</strong>
                    <span>{formatDate(event.eventDate)}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
