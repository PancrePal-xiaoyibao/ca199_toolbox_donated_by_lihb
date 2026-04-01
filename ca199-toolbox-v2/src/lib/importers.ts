import Papa from 'papaparse'
import type { ImportedDataset, IndicatorPoint, MedicationSpan, PatientSummary, TimelineEvent } from './models'

type CsvRecord = Record<string, string | undefined>
type BundlePayload = {
  version?: number
  source_mode?: 'normalized'
  summary?: PatientSummary
  indicators?: CsvRecord[]
  medications?: CsvRecord[]
  events?: CsvRecord[]
}

function parseCsv(text: string): CsvRecord[] {
  return Papa.parse<CsvRecord>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  }).data
}

async function readFileText(file: File): Promise<string> {
  const blob = file as Blob
  if (typeof blob.text === 'function') {
    return blob.text()
  }

  if (typeof blob.arrayBuffer === 'function') {
    const buffer = await blob.arrayBuffer()
    return new TextDecoder().decode(buffer)
  }

  return new Response(file).text()
}

function parseNumber(value?: string): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseIndicators(rows: CsvRecord[], legacy = false): IndicatorPoint[] {
  return rows
    .map((row) => {
      if (legacy) {
        const value = parseNumber(row.indicatorValue)
        if (!row.testTime || !row.indicatorName || value === undefined) return null
        return {
          date: row.testTime,
          name: row.indicatorName,
          value,
        }
      }

      const value = parseNumber(row.indicator_value)
      if (!row.test_date || !row.indicator_name || value === undefined) return null
      return {
        date: row.test_date,
        name: row.indicator_name,
        value,
        unit: row.unit,
        referenceLow: parseNumber(row.reference_low),
        referenceHigh: parseNumber(row.reference_high),
      }
    })
    .filter((row): row is IndicatorPoint => Boolean(row))
}

function parseMedications(rows: CsvRecord[], legacy = false): MedicationSpan[] {
  return rows
    .map<MedicationSpan | null>((row) => {
      if (legacy) {
        if (!row.START_DATE || !row.DRUG_NAME) return null
        return {
          startDate: row.START_DATE,
          endDate: row.END_DATE,
          drugName: row.DRUG_NAME,
          tag: row.TAG,
        }
      }

      if (!row.start_date || !row.drug_name) return null
      return {
        startDate: row.start_date,
        endDate: row.end_date,
        drugName: row.drug_name,
        tag: row.tag,
      }
    })
    .filter((row): row is MedicationSpan => Boolean(row))
}

function parseEvents(rows: CsvRecord[], legacy = false): TimelineEvent[] {
  return rows
    .map<TimelineEvent | null>((row) => {
      if (legacy) {
        if (!row.REMARKS_DATE || !row.REMARKS) return null
        return {
          eventDate: row.REMARKS_DATE,
          eventType: 'remark',
          title: row.REMARKS,
          offsetX: parseNumber(row.OFFSETX) ?? 0,
          offsetY: parseNumber(row.OFFSETY) ?? 0,
        }
      }

      if (!row.event_date || !row.title) return null
      return {
        eventDate: row.event_date,
        eventType: row.event_type || 'event',
        title: row.title,
        description: row.description,
        doctorNote: row.doctor_note,
        patientNote: row.patient_note,
        nextStep: row.next_step,
      }
    })
    .filter((row): row is TimelineEvent => Boolean(row))
}

function detectMode(fileNames: string[]): ImportedDataset['sourceMode'] {
  const names = new Set(fileNames)
  const hasNormalized =
    names.has('ca199_toolbox_bundle.json') ||
    names.has('indicators.csv') ||
    names.has('medications.csv') ||
    names.has('timeline_events.csv') ||
    names.has('patient_summary.json')
  const hasLegacy = names.has('data.csv') || names.has('medication.csv') || names.has('remarksline.csv')

  if (hasNormalized && hasLegacy) return 'mixed'
  if (hasNormalized) return 'normalized'
  return 'legacy'
}

export async function importFiles(files: FileList | File[]): Promise<ImportedDataset> {
  const input = Array.from(files)
  const names = input.map((file) => file.name)
  const sourceMode = detectMode(names)

  let indicators: IndicatorPoint[] = []
  let medications: MedicationSpan[] = []
  let events: TimelineEvent[] = []
  let summary: PatientSummary | undefined

  for (const file of input) {
    const text = await readFileText(file)
    switch (file.name) {
      case 'ca199_toolbox_bundle.json': {
        const payload = JSON.parse(text) as BundlePayload
        indicators = parseIndicators(payload.indicators ?? [])
        medications = parseMedications(payload.medications ?? [])
        events = parseEvents(payload.events ?? [])
        summary = payload.summary
        break
      }
      case 'indicators.csv':
        indicators = parseIndicators(parseCsv(text))
        break
      case 'medications.csv':
        medications = parseMedications(parseCsv(text))
        break
      case 'timeline_events.csv':
        events = parseEvents(parseCsv(text))
        break
      case 'patient_summary.json':
        summary = JSON.parse(text) as PatientSummary
        break
      case 'data.csv':
        indicators = parseIndicators(parseCsv(text), true)
        break
      case 'medication.csv':
        medications = parseMedications(parseCsv(text), true)
        break
      case 'remarksline.csv':
        events = parseEvents(parseCsv(text), true)
        break
      default:
        break
    }
  }

  return {
    indicators,
    medications,
    events,
    summary,
    sourceMode,
  }
}
