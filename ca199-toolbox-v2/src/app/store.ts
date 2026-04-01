import { create } from 'zustand'
import type { ImportedDataset, TabKey } from '../lib/models'

interface AppState {
  activeTab: TabKey
  screenshotMode: boolean
  dataset?: ImportedDataset
  activeMetrics: string[]
  timeRange: 'all' | '12m' | '6m' | '3m'
  setActiveTab: (tab: TabKey) => void
  setScreenshotMode: (value: boolean) => void
  setDataset: (dataset: ImportedDataset) => void
  toggleMetric: (metric: string) => void
  setTimeRange: (range: 'all' | '12m' | '6m' | '3m') => void
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'overview',
  screenshotMode: false,
  dataset: undefined,
  activeMetrics: [],
  timeRange: 'all',
  setActiveTab: (activeTab) => set({ activeTab }),
  setScreenshotMode: (screenshotMode) => set({ screenshotMode }),
  setDataset: (dataset) =>
    set({
      dataset,
      activeMetrics: [...new Set(dataset.indicators.map((point) => point.name))].slice(0, 3),
      timeRange: 'all',
    }),
  toggleMetric: (metric) =>
    set((state) => {
      const exists = state.activeMetrics.includes(metric)
      if (exists) {
        const next = state.activeMetrics.filter((item) => item !== metric)
        return { activeMetrics: next.length ? next : [metric] }
      }

      return { activeMetrics: [...state.activeMetrics, metric].slice(-5) }
    }),
  setTimeRange: (timeRange) => set({ timeRange }),
}))
