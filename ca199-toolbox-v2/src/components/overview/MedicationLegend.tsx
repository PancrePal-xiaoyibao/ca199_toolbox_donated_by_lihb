import type { MedicationSpan } from '../../lib/models'

interface MedicationLegendProps {
  medications: MedicationSpan[]
}

const COLORS = ['#d96b6b', '#d9b84f', '#4f9a90', '#4f7fd9', '#8c6bd9', '#79a85a']

export default function MedicationLegend({ medications }: MedicationLegendProps) {
  const regimenNames = [...new Set(medications.map((item) => item.drugName))]

  if (!regimenNames.length) {
    return <p className="matrix-empty">暂无用药图例</p>
  }

  return (
    <div className="med-legend">
      {regimenNames.map((name, index) => (
        <div key={name} className="legend-chip">
          <span className="legend-swatch" style={{ background: COLORS[index % COLORS.length] }} />
          <span>{name}</span>
        </div>
      ))}
    </div>
  )
}
