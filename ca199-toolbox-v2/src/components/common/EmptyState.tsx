interface EmptyStateProps {
  title: string
  body: string
}

export default function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <section className="paper-panel empty-state">
      <p className="eyebrow">等待导入</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  )
}
