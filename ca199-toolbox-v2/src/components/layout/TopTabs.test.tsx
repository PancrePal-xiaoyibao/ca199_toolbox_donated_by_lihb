import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import AppShell from './AppShell'

describe('AppShell tabs', () => {
  it('switches to details tab', async () => {
    const user = userEvent.setup()
    render(<AppShell />)

    await user.click(screen.getByRole('tab', { name: /病情详情/i }))

    expect(screen.getByRole('tab', { name: /病情详情/i })).toHaveAttribute('aria-selected', 'true')
  })
})
