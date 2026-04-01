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
