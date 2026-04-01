import { useAppStore } from '../../app/store'
import { formatDate } from '../../lib/date'
import EmptyState from '../common/EmptyState'

export default function SummaryView() {
  const dataset = useAppStore((state) => state.dataset)

  if (!dataset) {
    return <EmptyState title="等待病程摘要" body="导入病程事件后，这里会生成纵向时间轴，便于患者与家属回顾。" />
  }

  return (
    <section className="tab-section">
      <article className="paper-panel">
        <p className="eyebrow">患者视角</p>
        <h2>病程摘要时间轴</h2>
        <div className="summary-timeline">
          {dataset.events.map((event) => (
            <div key={`${event.eventDate}-${event.title}`} className="summary-node">
              <div className="summary-date">{formatDate(event.eventDate)}</div>
              <div className="summary-card">
                <strong>{event.title}</strong>
                <p>{event.patientNote || event.description || event.doctorNote || '暂无补充记录'}</p>
                {event.nextStep ? <small>下一步：{event.nextStep}</small> : null}
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
