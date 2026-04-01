export function formatNumber(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return '--'
  return Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value)
}

export function joinDetail(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' · ')
}
