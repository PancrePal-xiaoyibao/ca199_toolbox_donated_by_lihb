import dayjs from 'dayjs'

export function formatDate(value?: string): string {
  if (!value) return '未填写'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : value
}

export function formatDateTime(value?: string): string {
  if (!value) return '未填写'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : value
}

export function formatDurationRange(start?: string, end?: string): string {
  if (!start || !end) return ''
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  if (!startDate.isValid() || !endDate.isValid()) return ''

  const durationDays = Math.max(endDate.diff(startDate, 'day') + 1, 1)
  if (durationDays >= 30) {
    const months = Math.floor(durationDays / 30)
    const days = durationDays % 30
    return days > 0 ? `${months}个月${days}天` : `${months}个月`
  }
  return `${durationDays}天`
}
