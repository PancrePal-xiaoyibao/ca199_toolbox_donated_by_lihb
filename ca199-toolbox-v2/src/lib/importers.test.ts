import { describe, expect, it } from 'vitest'
import { importFiles } from './importers'
import { normalizedEvents, normalizedIndicators, normalizedMedications } from '../test/fixtures/dataRows'

describe('importFiles', () => {
  it('parses normalized exports', async () => {
    const files = [
      new File([normalizedIndicators], 'indicators.csv', { type: 'text/csv' }),
      new File([normalizedMedications], 'medications.csv', { type: 'text/csv' }),
      new File([normalizedEvents], 'timeline_events.csv', { type: 'text/csv' }),
      new File([JSON.stringify({ primary_diagnosis: '胰腺癌' })], 'patient_summary.json', { type: 'application/json' }),
    ]

    const dataset = await importFiles(files)

    expect(dataset.sourceMode).toBe('normalized')
    expect(dataset.indicators).toHaveLength(3)
    expect(dataset.medications[0].tag).toBe('AG方案')
    expect(dataset.events[0].title).toBe('CT复查')
    expect(dataset.summary?.primary_diagnosis).toBe('胰腺癌')
  })

  it('parses legacy exports', async () => {
    const files = [
      new File(['testTime,indicatorName,indicatorValue\n2026-01-01,CA199,90\n'], 'data.csv', { type: 'text/csv' }),
      new File(['START_DATE,END_DATE,DRUG_NAME,TAG\n2026-01-01,2026-02-01,AG,方案A\n'], 'medication.csv', { type: 'text/csv' }),
      new File(['REMARKS_DATE,REMARKS,OFFSETX,OFFSETY\n2026-01-15,开始化疗,0,0\n'], 'remarksline.csv', { type: 'text/csv' }),
    ]

    const dataset = await importFiles(files)

    expect(dataset.sourceMode).toBe('legacy')
    expect(dataset.indicators[0].name).toBe('CA199')
    expect(dataset.medications[0].drugName).toBe('AG')
    expect(dataset.events[0].title).toBe('开始化疗')
  })
})
