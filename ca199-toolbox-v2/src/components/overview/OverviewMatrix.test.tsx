import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import OverviewMatrix from './OverviewMatrix'
import type { ImportedDataset } from '../../lib/models'

const dataset: ImportedDataset = {
  sourceMode: 'normalized',
  summary: { primary_diagnosis: '胰腺癌' },
  indicators: [
    { date: '2026-01-01', name: 'CA199', value: 120 },
    { date: '2026-02-01', name: 'CA199', value: 80 },
    { date: '2026-01-01', name: 'CEA', value: 6 },
    { date: '2026-02-01', name: 'CEA', value: 4 },
    { date: '2026-01-01', name: 'ALT', value: 45 },
    { date: '2026-02-01', name: 'ALT', value: 32 },
  ],
  medications: [{ startDate: '2026-01-03', endDate: '2026-02-28', drugName: 'AG', tag: 'AG方案' }],
  events: [{ eventDate: '2026-01-15', eventType: 'imaging', title: 'CT复查' }],
}

describe('OverviewMatrix', () => {
  it('collapses and expands metric groups', async () => {
    const user = userEvent.setup()
    render(<OverviewMatrix dataset={dataset} />)

    expect(screen.getByText('肿瘤标志物')).toBeInTheDocument()
    expect(screen.getByText('肝肾功能')).toBeInTheDocument()
    expect(screen.getAllByText('ALT').length).toBeGreaterThan(0)

    const hepaticToggle = screen.getByRole('button', { name: /肝肾功能/i })

    await user.click(hepaticToggle)
    expect(screen.getByRole('button', { name: /肝肾功能.*展开/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /肝肾功能.*展开/i }))
    expect(screen.getByRole('button', { name: /肝肾功能.*折叠/i })).toBeInTheDocument()
  })
})
