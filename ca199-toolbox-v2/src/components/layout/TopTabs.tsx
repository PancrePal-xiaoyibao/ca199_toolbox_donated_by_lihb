import type { TabKey } from '../../lib/models'

const TABS: Array<{ key: TabKey; label: string; hint: string }> = [
  { key: 'overview', label: '病程总览', hint: '医生第一眼先看趋势与治疗线' },
  { key: 'details', label: '病情详情', hint: '多指标、明细和证据层' },
  { key: 'summary', label: '病程摘要', hint: '患者视角的纵向病程记录' },
]

interface TopTabsProps {
  activeTab: TabKey
  onChange: (tab: TabKey) => void
}

export default function TopTabs({ activeTab, onChange }: TopTabsProps) {
  return (
    <div className="top-tabs" role="tablist" aria-label="主导航标签">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          className={activeTab === tab.key ? 'tab-button is-active' : 'tab-button'}
          onClick={() => onChange(tab.key)}
        >
          <span className="tab-label">{tab.label}</span>
          <span className="tab-hint">{tab.hint}</span>
        </button>
      ))}
    </div>
  )
}
