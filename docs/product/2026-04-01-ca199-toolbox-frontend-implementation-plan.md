# CA199 Toolbox Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new local-first React frontend for CA199 Toolbox with three tabs (`病程总览`, `病情详情`, `病程摘要`) that replaces the current single-file tool-style UI with a professional, doctor-friendly information layout.

**Architecture:** Create a standalone `ca199-toolbox-v2/` Vite app and keep the legacy root `index.html` untouched during the first migration phase. Use React + TypeScript + Zustand + ECharts, with dual-path import for `normalized/` and `legacy/` case-organizer exports inside the frontend app. Build the visual shell first, then wire data import, chart generation, timeline rendering, and summary views.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Zustand, ECharts, PapaParse, dayjs, Vitest, Testing Library

---

## File Structure

### New files

- `ca199-toolbox-v2/package.json`
- `ca199-toolbox-v2/tsconfig.json`
- `ca199-toolbox-v2/tsconfig.app.json`
- `ca199-toolbox-v2/tsconfig.node.json`
- `ca199-toolbox-v2/vite.config.ts`
- `ca199-toolbox-v2/index.html`
- `ca199-toolbox-v2/src/main.tsx`
- `ca199-toolbox-v2/src/app/App.tsx`
- `ca199-toolbox-v2/src/app/store.ts`
- `ca199-toolbox-v2/src/styles/globals.css`
- `ca199-toolbox-v2/src/styles/tokens.css`
- `ca199-toolbox-v2/src/lib/date.ts`
- `ca199-toolbox-v2/src/lib/format.ts`
- `ca199-toolbox-v2/src/lib/models.ts`
- `ca199-toolbox-v2/src/lib/importers.ts`
- `ca199-toolbox-v2/src/components/layout/AppShell.tsx`
- `ca199-toolbox-v2/src/components/layout/TopTabs.tsx`
- `ca199-toolbox-v2/src/components/layout/PatientHeader.tsx`
- `ca199-toolbox-v2/src/components/common/FileImportPanel.tsx`
- `ca199-toolbox-v2/src/components/common/ScreenshotModeToggle.tsx`
- `ca199-toolbox-v2/src/components/common/EmptyState.tsx`
- `ca199-toolbox-v2/src/components/overview/OverviewChart.tsx`
- `ca199-toolbox-v2/src/components/overview/OverviewView.tsx`
- `ca199-toolbox-v2/src/components/details/DetailsView.tsx`
- `ca199-toolbox-v2/src/components/summary/SummaryView.tsx`
- `ca199-toolbox-v2/src/test/setup.ts`
- `ca199-toolbox-v2/src/test/fixtures/dataRows.ts`
- `ca199-toolbox-v2/src/lib/importers.test.ts`
- `ca199-toolbox-v2/src/components/layout/TopTabs.test.tsx`

### Existing files to modify

- `README.md`
- `QUICKSTART.md`
- `.gitignore`

## Task 1: Bootstrap The New Frontend Workspace

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/app/App.tsx`
- Create: `frontend/src/styles/globals.css`
- Create: `frontend/src/styles/tokens.css`
- Test: `frontend/src/components/layout/TopTabs.test.tsx`

- [ ] **Step 1: Write the failing shell test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/app/App'

describe('App shell', () => {
  it('renders the three primary tabs', () => {
    render(<App />)

    expect(screen.getByRole('tab', { name: '病程总览' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '病情详情' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '病程摘要' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Create the frontend workspace files**

```json
{
  "name": "ca199-toolbox-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "dayjs": "^1.11.13",
    "echarts": "^5.6.0",
    "papaparse": "^5.5.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/papaparse": "^5.3.15",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.5"
  }
}
```

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/tokens.css'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```tsx
export default function App() {
  return (
    <main className="min-h-screen bg-app text-app">
      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8">
        <nav aria-label="Primary tabs" className="mb-6">
          <div role="tablist" aria-orientation="horizontal" className="flex gap-2">
            <button role="tab" aria-selected="true">病程总览</button>
            <button role="tab" aria-selected="false">病情详情</button>
            <button role="tab" aria-selected="false">病程摘要</button>
          </div>
        </nav>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Add design tokens and global CSS**

```css
:root {
  --bg-app: #f4f1ea;
  --bg-panel: rgba(255, 252, 246, 0.88);
  --text-app: #1f2320;
  --text-muted: #59615b;
  --line-subtle: rgba(48, 57, 50, 0.12);
  --accent-treatment: #315c72;
  --accent-check: #577a5e;
  --accent-risk: #9b4a42;
  --accent-patient: #8a6d4f;
}
```

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: "Source Han Serif SC", "Noto Serif SC", serif;
  background: var(--bg-app);
  color: var(--text-app);
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 4: Run test to verify it fails or passes appropriately**

Run:

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox/frontend && npm test -- TopTabs.test.tsx
```

Expected:

- Before implementation: FAIL because frontend app and test setup are missing
- After implementation: PASS with `renders the three primary tabs`

- [ ] **Step 5: Commit**

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox
git add frontend
git commit -m "feat: bootstrap CA199 frontend workspace"
```

## Task 2: Build The App Shell And Shared State

**Files:**
- Create: `frontend/src/app/store.ts`
- Create: `frontend/src/components/layout/AppShell.tsx`
- Create: `frontend/src/components/layout/TopTabs.tsx`
- Create: `frontend/src/components/layout/PatientHeader.tsx`
- Create: `frontend/src/components/common/ScreenshotModeToggle.tsx`
- Create: `frontend/src/components/common/EmptyState.tsx`
- Test: `frontend/src/components/layout/TopTabs.test.tsx`

- [ ] **Step 1: Write the failing tab interaction test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import AppShell from './AppShell'

describe('TopTabs', () => {
  it('switches the selected tab in the shell', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    await user.click(screen.getByRole('tab', { name: '病情详情' }))

    expect(screen.getByRole('tab', { name: '病情详情' })).toHaveAttribute('aria-selected', 'true')
  })
})
```

- [ ] **Step 2: Add the Zustand store**

```ts
import { create } from 'zustand'

export type AppTab = 'overview' | 'details' | 'summary'

type AppState = {
  activeTab: AppTab
  screenshotMode: boolean
  setActiveTab: (tab: AppTab) => void
  toggleScreenshotMode: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'overview',
  screenshotMode: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleScreenshotMode: () => set((state) => ({ screenshotMode: !state.screenshotMode })),
}))
```

- [ ] **Step 3: Implement the shell components**

```tsx
const tabs = [
  { key: 'overview', label: '病程总览' },
  { key: 'details', label: '病情详情' },
  { key: 'summary', label: '病程摘要' },
] as const

export function TopTabs() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)

  return (
    <div role="tablist" aria-orientation="horizontal" className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeTab === tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={activeTab === tab.key ? 'tab-active' : 'tab-idle'}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

```tsx
export default function AppShell() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-6 md:px-8">
      <PatientHeader />
      <div className="mb-5 flex items-center justify-between">
        <TopTabs />
        <ScreenshotModeToggle />
      </div>
      <section className="rounded-[28px] border border-[color:var(--line-subtle)] bg-[color:var(--bg-panel)] p-4 md:p-6">
        <EmptyState title="导入指标数据后开始查看病程" description="首版先完成壳层和分区，后续任务再接入数据与图表。" />
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Run the shell test**

Run:

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox/frontend && npm test -- TopTabs.test.tsx
```

Expected:

- PASS with tab selection updating `aria-selected`

- [ ] **Step 5: Commit**

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox
git add frontend/src/app frontend/src/components/layout frontend/src/components/common
git commit -m "feat: add CA199 app shell and tab state"
```

## Task 3: Implement CSV Import And Domain Transformers

**Files:**
- Create: `frontend/src/lib/importers.ts`
- Create: `frontend/src/lib/date.ts`
- Create: `frontend/src/lib/format.ts`
- Create: `frontend/src/lib/constants.ts`
- Create: `frontend/src/test/fixtures/dataRows.ts`
- Create: `frontend/src/lib/importers.test.ts`
- Create: `frontend/src/components/common/FileImportPanel.tsx`
- Create: `frontend/src/components/common/FileImportPanel.test.tsx`
- Modify: `frontend/src/app/store.ts`

- [ ] **Step 1: Write the failing importer tests**

```ts
import { describe, expect, it } from 'vitest'
import { parseIndicatorRows, parseMedicationRows } from './importers'
import { indicatorCsvRows, medicationCsvRows } from '../test/fixtures/dataRows'

describe('parseIndicatorRows', () => {
  it('normalizes indicator rows into typed records', () => {
    const records = parseIndicatorRows(indicatorCsvRows)

    expect(records[0]).toMatchObject({
      indicatorName: 'CA199',
      indicatorValue: 120.5,
      testDate: '2024-01-01',
    })
  })
})

describe('parseMedicationRows', () => {
  it('normalizes medication rows into timeline records', () => {
    const records = parseMedicationRows(medicationCsvRows)

    expect(records[0]).toMatchObject({
      drugName: '化疗方案A',
      startDate: '2024-01-01',
      endDate: '2024-01-15',
    })
  })
})
```

- [ ] **Step 2: Add import helpers and typed records**

```ts
export type IndicatorRecord = {
  testDate: string
  indicatorName: string
  indicatorValue: number
}

export function parseIndicatorRows(rows: Record<string, string>[]): IndicatorRecord[] {
  return rows
    .filter((row) => row.testTime && row.indicatorName && row.indicatorValue)
    .map((row) => ({
      testDate: row.testTime.slice(0, 10),
      indicatorName: row.indicatorName.trim(),
      indicatorValue: Number(row.indicatorValue),
    }))
    .filter((row) => Number.isFinite(row.indicatorValue))
}
```

```ts
export type MedicationRecord = {
  startDate: string
  endDate: string
  drugName: string
  tag?: string
}

export function parseMedicationRows(rows: Record<string, string>[]): MedicationRecord[] {
  return rows
    .filter((row) => row.START_DATE && row.END_DATE && row.DRUG_NAME)
    .map((row) => ({
      startDate: row.START_DATE,
      endDate: row.END_DATE,
      drugName: row.DRUG_NAME.trim(),
      tag: row.TAG?.trim() || undefined,
    }))
}
```

- [ ] **Step 3: Extend store and import panel**

```ts
type AppState = {
  activeTab: AppTab
  screenshotMode: boolean
  indicators: IndicatorRecord[]
  medications: MedicationRecord[]
  setIndicators: (rows: IndicatorRecord[]) => void
  setMedications: (rows: MedicationRecord[]) => void
  setActiveTab: (tab: AppTab) => void
  toggleScreenshotMode: () => void
}
```

```tsx
export function FileImportPanel() {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      <label className="import-card">
        <span>加载指标数据</span>
        <input type="file" accept=".csv" />
      </label>
      <label className="import-card">
        <span>加载用药数据</span>
        <input type="file" accept=".csv" />
      </label>
    </section>
  )
}
```

- [ ] **Step 4: Run importer tests**

Run:

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox/frontend && npm test -- importers.test.ts FileImportPanel.test.tsx
```

Expected:

- PASS with normalized indicator and medication records

- [ ] **Step 5: Commit**

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox
git add frontend/src/lib frontend/src/components/common/FileImportPanel.tsx frontend/src/app/store.ts frontend/src/test
git commit -m "feat: add frontend CSV import pipeline"
```

## Task 4: Build The Overview Page

**Files:**
- Create: `frontend/src/lib/chart-builders.ts`
- Create: `frontend/src/lib/chart-builders.test.ts`
- Create: `frontend/src/components/overview/OverviewChart.tsx`
- Create: `frontend/src/components/overview/MetricSwitcher.tsx`
- Create: `frontend/src/components/overview/TreatmentTimeline.tsx`
- Create: `frontend/src/components/overview/EventRail.tsx`
- Create: `frontend/src/components/overview/StatusCards.tsx`
- Create: `frontend/src/components/overview/StatusCards.test.tsx`
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/app/store.ts`

- [ ] **Step 1: Write the failing overview data builder test**

```ts
import { describe, expect, it } from 'vitest'
import { buildOverviewSeries } from './chart-builders'
import { indicatorRecords } from '../test/fixtures/dataRows'

describe('buildOverviewSeries', () => {
  it('returns sorted points for one selected metric', () => {
    const series = buildOverviewSeries(indicatorRecords, 'CA199')

    expect(series.metric).toBe('CA199')
    expect(series.points).toHaveLength(2)
    expect(series.points[0].value).toBe(120.5)
  })
})
```

- [ ] **Step 2: Implement overview builders**

```ts
export function buildOverviewSeries(records: IndicatorRecord[], metric: string) {
  const points = records
    .filter((record) => record.indicatorName === metric)
    .sort((a, b) => a.testDate.localeCompare(b.testDate))
    .map((record) => ({
      date: record.testDate,
      value: record.indicatorValue,
    }))

  return { metric, points }
}
```

```ts
export function buildStatusCards(records: IndicatorRecord[], metric: string) {
  const series = buildOverviewSeries(records, metric).points
  const latest = series.at(-1)
  const previous = series.at(-2)

  return {
    latestValue: latest?.value ?? null,
    latestDate: latest?.date ?? null,
    delta: latest && previous ? latest.value - previous.value : null,
  }
}
```

- [ ] **Step 3: Implement overview components**

```tsx
export function OverviewChart() {
  return (
    <div className="rounded-[24px] border border-[color:var(--line-subtle)] bg-white/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">核心指标趋势</h2>
        <MetricSwitcher />
      </div>
      <div className="h-[360px]" data-testid="overview-chart" />
    </div>
  )
}
```

```tsx
export function TreatmentTimeline() {
  return (
    <div className="rounded-[24px] border border-[color:var(--line-subtle)] bg-white/60 p-4">
      <h3 className="mb-3 text-sm font-medium text-[color:var(--text-muted)]">治疗时间轴</h3>
      <div className="h-24" data-testid="treatment-timeline" />
    </div>
  )
}
```

```tsx
export function StatusCards() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <article className="rounded-[20px] border border-[color:var(--line-subtle)] p-4">
        <div className="text-xs text-[color:var(--text-muted)]">最近一次</div>
        <div className="mt-2 text-2xl font-semibold">120.5</div>
      </article>
    </div>
  )
}
```

- [ ] **Step 4: Wire the overview into `App.tsx` and run tests**

Run:

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox/frontend && npm test -- chart-builders.test.ts StatusCards.test.tsx
```

Expected:

- PASS with overview builder output and visible status cards

- [ ] **Step 5: Commit**

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox
git add frontend/src/app/App.tsx frontend/src/lib/chart-builders.ts frontend/src/components/overview
git commit -m "feat: add overview page structure"
```

## Task 5: Build Details And Summary Tabs

**Files:**
- Create: `frontend/src/components/details/DetailFilters.tsx`
- Create: `frontend/src/components/details/MultiMetricPanel.tsx`
- Create: `frontend/src/components/details/LabGroupPanel.tsx`
- Create: `frontend/src/components/details/RecordDetailList.tsx`
- Create: `frontend/src/components/summary/SummaryTimeline.tsx`
- Create: `frontend/src/components/summary/SummaryNode.tsx`
- Create: `frontend/src/components/summary/SummaryTimeline.test.tsx`
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/app/store.ts`

- [ ] **Step 1: Write the failing summary rendering test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SummaryTimeline } from './SummaryTimeline'

describe('SummaryTimeline', () => {
  it('renders timeline nodes in chronological order', () => {
    render(
      <SummaryTimeline
        nodes={[
          { id: '2', date: '2024-02-01', title: '开始新疗程', type: '治疗' },
          { id: '1', date: '2024-01-15', title: 'CT 复查', type: '检查' },
        ]}
      />,
    )

    const headings = screen.getAllByRole('heading')
    expect(headings[0]).toHaveTextContent('CT 复查')
    expect(headings[1]).toHaveTextContent('开始新疗程')
  })
})
```

- [ ] **Step 2: Implement the detail and summary components**

```tsx
export function DetailFilters() {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="filter-chip">近 3 个月</button>
      <button className="filter-chip">近 12 个月</button>
      <button className="filter-chip">全部</button>
    </div>
  )
}
```

```tsx
export function SummaryTimeline({ nodes }: { nodes: Array<{ id: string; date: string; title: string; type: string }> }) {
  const sorted = [...nodes].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-4">
      {sorted.map((node) => (
        <SummaryNode key={node.id} node={node} />
      ))}
    </div>
  )
}
```

```tsx
export function SummaryNode({ node }: { node: { date: string; title: string; type: string } }) {
  return (
    <article className="grid gap-2 rounded-[20px] border border-[color:var(--line-subtle)] bg-white/70 p-4 md:grid-cols-[140px_1fr]">
      <div className="text-sm text-[color:var(--text-muted)]">{node.date}</div>
      <div>
        <div className="mb-1 text-xs uppercase tracking-[0.18em] text-[color:var(--accent-patient)]">{node.type}</div>
        <h3 className="text-base font-semibold">{node.title}</h3>
      </div>
    </article>
  )
}
```

- [ ] **Step 3: Wire conditional tab rendering in `App.tsx`**

```tsx
const activeTab = useAppStore((s) => s.activeTab)

return (
  <AppShell>
    {activeTab === 'overview' && <OverviewPage />}
    {activeTab === 'details' && <DetailsPage />}
    {activeTab === 'summary' && <SummaryPage />}
  </AppShell>
)
```

- [ ] **Step 4: Run the details and summary tests**

Run:

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox/frontend && npm test -- SummaryTimeline.test.tsx TopTabs.test.tsx
```

Expected:

- PASS with summary nodes rendered in ascending date order

- [ ] **Step 5: Commit**

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox
git add frontend/src/components/details frontend/src/components/summary frontend/src/app/App.tsx
git commit -m "feat: add details and summary tabs"
```

## Task 6: Verification, Docs, And Migration Notes

**Files:**
- Modify: `README.md`
- Modify: `QUICKSTART.md`
- Modify: `.gitignore`

- [ ] **Step 1: Add frontend development instructions to README**

```md
## Frontend Development

新版前端位于 `frontend/` 目录。

```bash
cd frontend
npm install
npm run dev
```
```

- [ ] **Step 2: Update Quick Start to distinguish legacy UI and new frontend**

```md
## 新版前端预览

```bash
cd frontend
npm install
npm run dev
```

旧版仍可通过根目录 `index.html` 打开。
```

- [ ] **Step 3: Ignore frontend dependencies and build output**

```gitignore
frontend/node_modules
frontend/dist
frontend/.vite
```

- [ ] **Step 4: Run full verification**

Run:

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox/frontend && npm test && npm run build
```

Expected:

- `npm test`: PASS
- `npm run build`: PASS and emits `dist/`

- [ ] **Step 5: Commit**

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox
git add README.md QUICKSTART.md .gitignore
git commit -m "docs: document new frontend workflow"
```

## Coverage Check

- `病程总览` has dedicated implementation in Task 4.
- `病情详情` has dedicated implementation in Task 5.
- `病程摘要` has dedicated implementation in Task 5.
- `本地优先导入` is covered in Task 3.
- `截图模式与应用壳层` is covered in Task 2.
- `前端工程化与后续扩展` is covered in Task 1 and Task 6.

## Risks And Mitigations

1. `视觉跑偏风险`
   Mitigation: lock tokens, component boundaries, and negative prompt constraints before broad implementation.

2. `旧版逻辑迁移风险`
   Mitigation: keep root `index.html` intact until new frontend reaches feature parity for overview data import and chart rendering.

3. `数据模型扩展风险`
   Mitigation: keep importers typed and minimal in phase 1; add richer event models only after summary tab stabilizes.

4. `图表与时间轴联动复杂度`
   Mitigation: land shell and static timeline first, then add interaction after domain transformers are stable.

## Execution Handoff

Plan complete and saved to `docs/product/2026-04-01-ca199-toolbox-frontend-implementation-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
