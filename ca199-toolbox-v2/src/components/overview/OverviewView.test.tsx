import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { describe, expect, it } from 'vitest'
import { useAppStore } from '../../app/store'
import OverviewView from './OverviewView'

vi.mock('./OverviewChart', () => ({
  default: function MockOverviewChart() {
    return <div>mock chart</div>
  },
}))
vi.mock('./MedicationTimeline', () => ({
  default: function MockMedicationTimeline() {
    return <div>mock timeline</div>
  },
}))
vi.mock('./MedicationLegend', () => ({
  default: function MockMedicationLegend() {
    return <div>mock legend</div>
  },
}))

describe('OverviewView', () => {
  it('renders metric selector and supports toggling metrics', async () => {
    useAppStore.setState({
      dataset: {
        sourceMode: 'normalized',
        indicators: [
          { date: '2026-01-01', name: 'CA199', value: 100 },
          { date: '2026-01-02', name: 'CEA', value: 5 },
          { date: '2026-01-02', name: 'ALT', value: 32 },
        ],
        medications: [],
        events: [],
        summary: {},
      },
      activeMetrics: ['CA199'],
      timeRange: 'all',
    })

    const user = userEvent.setup()
    render(<OverviewView />)

    expect(screen.getByText('指标选择器')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('搜索指标...')).toBeInTheDocument()
    expect(screen.getByText('关键点')).toBeInTheDocument()
    expect(screen.getByText('变化率')).toBeInTheDocument()
    expect(screen.getByText('mock timeline')).toBeInTheDocument()
    expect(screen.getByText('mock legend')).toBeInTheDocument()
    expect(screen.getByText('当前与历史方案')).toBeInTheDocument()
    expect(screen.getByText('标注与复查节点')).toBeInTheDocument()
    expect(screen.getByText('肿瘤标志物')).toBeInTheDocument()
    expect(screen.getByText('肝肾功能')).toBeInTheDocument()
    await user.click(screen.getByLabelText('CEA'))
    expect((screen.getByLabelText('CEA') as HTMLInputElement).checked).toBe(true)
  })
})
