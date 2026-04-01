import { useId, useState } from 'react'
import { importFiles } from '../../lib/importers'
import type { ImportedDataset } from '../../lib/models'

interface FileImportPanelProps {
  onImported: (dataset: ImportedDataset) => void
  dataset?: ImportedDataset
}

export default function FileImportPanel({ onImported, dataset }: FileImportPanelProps) {
  const inputId = useId()
  const [status, setStatus] = useState<string>('未导入文件')
  const [isLoading, setIsLoading] = useState(false)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files?.length) return

    setIsLoading(true)
    try {
      const dataset = await importFiles(files)
      onImported(dataset)
      setStatus(`已导入 ${files.length} 个文件，模式：${dataset.sourceMode}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '导入失败'
      setStatus(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="paper-panel import-panel">
      <div>
        <p className="eyebrow">数据入口</p>
        <h2>导入 case-organizer 导出文件</h2>
        <p className="body-copy">
          优先选择 <code>exports/normalized/ca199_toolbox_bundle.json</code>。如果需要，也可以继续选择
          <code>normalized/</code> 下的标准文件集。
        </p>
      </div>
      <div className="import-actions">
        <label htmlFor={inputId} className="accent-button">
          {isLoading ? '正在解析…' : '选择文件'}
        </label>
        <input
          id={inputId}
          type="file"
          multiple
          accept=".csv,.json"
          className="visually-hidden"
          onChange={handleChange}
        />
        <p className="status-line">{status}</p>
      </div>
      {dataset ? (
        <div className="import-status-strip">
          <span>指标数据：{dataset.indicators.length} 条</span>
          <span>用药数据：{dataset.medications.length} 条</span>
          <span>事件数据：{dataset.events.length} 条</span>
        </div>
      ) : null}
      <ul className="file-hint-list">
        <li>`preferred`: `ca199_toolbox_bundle.json`</li>
        <li>`normalized`: `indicators.csv`, `medications.csv`, `timeline_events.csv`, `patient_summary.json`</li>
        <li>`legacy`: `data.csv`, `medication.csv`, `remarksline.csv`（仅兼容旧版）</li>
      </ul>
    </section>
  )
}
