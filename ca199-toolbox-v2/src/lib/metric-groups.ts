import type { IndicatorPoint } from './models'

export interface MetricGroup {
  key: string
  title: string
  metrics: string[]
  summaryMetrics: string[]
}

const GROUP_RULES: Array<{ key: string; title: string; match: RegExp[]; summarySize: number }> = [
  {
    key: 'tumor',
    title: '肿瘤标志物',
    match: [/CA ?19/i, /^CA199$/i, /^CA50$/i, /^CA125$/i, /^CA724$/i, /^CEA$/i, /^AFP$/i, /^CA242$/i],
    summarySize: 2,
  },
  {
    key: 'cbc',
    title: '血常规',
    match: [/白细胞/, /中性粒/, /淋巴/, /血红蛋白/, /血小板/, /红细胞/, /单核细胞/, /嗜酸/, /嗜碱/],
    summarySize: 2,
  },
  {
    key: 'hepatic',
    title: '肝肾功能',
    match: [/ALT/i, /AST/i, /ALP/i, /总胆红素/, /直接胆红素/, /白蛋白/, /肌酐/, /尿素/, /尿酸/, /总蛋白/],
    summarySize: 2,
  },
  {
    key: 'coag',
    title: '凝血',
    match: [/凝血/, /D-二聚体/, /PT$/i, /APTT/i, /INR/i, /纤维蛋白/, /凝血酶原/],
    summarySize: 2,
  },
  {
    key: 'inflammation',
    title: '炎症指标',
    match: [/CRP/i, /C反应蛋白/, /降钙素原/, /ESR/i, /白介素/, /IL-?\d+/i],
    summarySize: 2,
  },
  {
    key: 'fluid',
    title: '体液检查',
    match: [/尿/, /便/, /潜血/, /蛋白尿/, /尿常规/, /便常规/],
    summarySize: 2,
  },
]

export function classifyMetric(name: string): MetricGroup['key'] {
  const match = GROUP_RULES.find((rule) => rule.match.some((pattern) => pattern.test(name)))
  return match?.key ?? 'other'
}

export function buildMetricGroups(points: IndicatorPoint[]): MetricGroup[] {
  const names = [...new Set(points.map((point) => point.name))]
  const grouped = new Map<string, string[]>()

  names.forEach((name) => {
    const bucket = classifyMetric(name)
    grouped.set(bucket, [...(grouped.get(bucket) ?? []), name])
  })

  const built = GROUP_RULES.map((rule) => {
    const metrics = (grouped.get(rule.key) ?? []).sort((left, right) => left.localeCompare(right))
    return {
      key: rule.key,
      title: rule.title,
      metrics,
      summaryMetrics: metrics.slice(0, rule.summarySize),
    }
  }).filter((group) => group.metrics.length > 0)

  const others = (grouped.get('other') ?? []).sort((left, right) => left.localeCompare(right))
  if (others.length) {
    built.push({
      key: 'other',
      title: '其他检验',
      metrics: others,
      summaryMetrics: others.slice(0, 2),
    })
  }

  return built
}
