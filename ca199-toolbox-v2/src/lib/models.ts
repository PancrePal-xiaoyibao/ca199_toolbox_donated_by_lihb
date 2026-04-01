export type TabKey = 'overview' | 'details' | 'summary'

export interface IndicatorPoint {
  date: string
  name: string
  value: number
  unit?: string
  referenceLow?: number
  referenceHigh?: number
}

export interface MedicationSpan {
  startDate: string
  endDate?: string
  drugName: string
  tag?: string
}

export interface TimelineEvent {
  eventDate: string
  eventType: string
  title: string
  description?: string
  doctorNote?: string
  patientNote?: string
  nextStep?: string
  offsetX?: number
  offsetY?: number
}

export interface PatientSummary {
  patient_name?: string
  primary_diagnosis?: string
  current_phase?: string
  key_metrics?: string[]
  last_updated_at?: string
}

export interface ImportedDataset {
  indicators: IndicatorPoint[]
  medications: MedicationSpan[]
  events: TimelineEvent[]
  summary?: PatientSummary
  sourceMode: 'normalized' | 'legacy' | 'mixed'
}
