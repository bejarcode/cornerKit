/**
 * Unit Tests: Border CSS Custom Property Hooks
 * GitHub issue #4: border hover effects via plain CSS
 *
 * The border stroke and background fill resolve through CSS custom
 * properties (--ck-border-color, --ck-background) with the configured
 * values as var() fallbacks, so consumers can restyle them from CSS:
 *   .btn:hover { --ck-border-color: hotpink; --ck-background: #1e293b }
 */

import { describe, it, expect } from 'vitest'
import { createBorderSVG } from '../../src/renderers/border'
import type { BorderRenderOptions } from '../../src/core/types'

const baseOptions: BorderRenderOptions = {
  width: 100,
  height: 100,
  radius: 20,
  smoothing: 0.8,
  border: {
    width: 2,
    color: '#3b82f6',
  },
  backgroundColor: '#ffffff',
}

describe('border CSS custom property hooks (issue #4)', () => {
  it('border stroke resolves through --ck-border-color with the configured color as fallback', () => {
    const svg = createBorderSVG(baseOptions)
    const borderPath = svg?.querySelector('path[fill="none"]') as SVGPathElement | null

    expect(borderPath).not.toBeNull()
    expect(borderPath!.style.stroke).toContain('var(--ck-border-color')
    expect(borderPath!.style.stroke).toContain('#3b82f6')
    // The resolved value stays on the presentation attribute (cascade fallback + debugging)
    expect(borderPath!.getAttribute('stroke')).toBe('#3b82f6')
  })

  it('gradient borders keep the gradient url as the var() fallback', () => {
    const svg = createBorderSVG({
      ...baseOptions,
      border: {
        width: 2,
        gradient: [
          { offset: '0%', color: '#3b82f6' },
          { offset: '100%', color: '#8b5cf6' },
        ],
      },
    })
    const borderPath = svg?.querySelector('path[fill="none"]') as SVGPathElement | null

    expect(borderPath).not.toBeNull()
    expect(borderPath!.style.stroke).toContain('var(--ck-border-color')
    expect(borderPath!.style.stroke).toContain('url(#ck-grad-')
  })

  it('dotted borders get the same stroke hook', () => {
    const svg = createBorderSVG({
      ...baseOptions,
      border: { width: 2, color: '#ef4444', style: 'dotted' },
    })
    const borderPath = svg?.querySelector('path[fill="none"]') as SVGPathElement | null

    expect(borderPath).not.toBeNull()
    expect(borderPath!.style.stroke).toContain('var(--ck-border-color')
    expect(borderPath!.style.stroke).toContain('#ef4444')
  })

  it('background fill and its anti-aliasing stroke resolve through --ck-background', () => {
    const svg = createBorderSVG(baseOptions)
    const bgPath = svg?.querySelector('path[fill="#ffffff"]') as SVGPathElement | null

    expect(bgPath).not.toBeNull()
    expect(bgPath!.style.fill).toContain('var(--ck-background')
    expect(bgPath!.style.fill).toContain('#ffffff')
    expect(bgPath!.style.stroke).toContain('var(--ck-background')
  })

  it('omits the background hook when there is no background path', () => {
    const svg = createBorderSVG({ ...baseOptions, backgroundColor: 'transparent' })
    const paths = svg?.querySelectorAll('path')

    // Only the border stroke path exists (plus clip path inside defs)
    const withBgVar = Array.from(paths ?? []).filter((p) =>
      (p as SVGPathElement).style.fill.includes('--ck-background')
    )
    expect(withBgVar).toHaveLength(0)
  })
})
