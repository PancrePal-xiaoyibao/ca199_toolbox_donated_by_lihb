interface ScreenshotModeToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function ScreenshotModeToggle({ checked, onChange }: ScreenshotModeToggleProps) {
  return (
    <label className="switch-card">
      <span>
        <strong>截图模式</strong>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}
