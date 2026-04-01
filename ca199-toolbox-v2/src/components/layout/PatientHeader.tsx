import { formatDateTime } from '../../lib/date'
import type { ImportedDataset } from '../../lib/models'

interface PatientHeaderProps {
  dataset?: ImportedDataset
}

export default function PatientHeader({ dataset }: PatientHeaderProps) {
  return (
    <header className="patient-header">
      <div>
        <p className="eyebrow">CA199 Toolbox v2</p>
        <h1>病情展示工作台</h1>
        <p className="lead">
          基于本地导入数据生成医生友好的病程总览，同时保留患者视角的摘要时间轴。
        </p>
      </div>
      <div className="header-meta">
        <div>
          <span className="meta-label">数据模式</span>
          <strong>{dataset?.sourceMode ?? '未导入'}</strong>
        </div>
        <div>
          <span className="meta-label">最近更新</span>
          <strong>{formatDateTime(dataset?.summary?.last_updated_at)}</strong>
        </div>
        <div>
          <span className="meta-label">主要诊断</span>
          <strong>{dataset?.summary?.primary_diagnosis ?? '待补充'}</strong>
        </div>
      </div>
    </header>
  )
}
