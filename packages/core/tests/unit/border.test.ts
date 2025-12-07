/**
 * Unit Tests: SVG Border Renderer
 * Feature 006: SVG-Based Border Rendering
 * Tests for border.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createBorderSVG,
  removeBorderSVG,
  injectBorderStyles,
  resetBorderStylesInjection,
  validateBorderWidth,
  validateBorderColor,
  shouldSkipBorder,
  shouldOmitBackground
} from '../../src/renderers/border'
import type { BorderConfig, BorderRenderOptions } from '../../src/core/types'

// T011: Unit tests for createBorderSVG()
describe('createBorderSVG', () => {
  const baseOptions: BorderRenderOptions = {
    width: 100,
    height: 100,
    radius: 20,
    smoothing: 0.8,
    border: {
      width: 2,
      color: '#3b82f6'
    },
    backgroundColor: '#ffffff'
  }

  it('should create SVG element with correct attributes', () => {
    const svg = createBorderSVG(baseOptions)

    expect(svg).not.toBeNull()
    expect(svg?.tagName.toLowerCase()).toBe('svg')
    expect(svg?.getAttribute('class')).toBe('cornerkit-border')
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })

  it('should include defs with clip-path', () => {
    const svg = createBorderSVG(baseOptions)

    const defs = svg?.querySelector('defs')
    expect(defs).not.toBeNull()

    const clipPath = defs?.querySelector('clipPath')
    expect(clipPath).not.toBeNull()
    expect(clipPath?.getAttribute('id')).toMatch(/^ck-clip-/)
  })

  it('should create background fill path when backgroundColor is provided', () => {
    const svg = createBorderSVG(baseOptions)

    const paths = svg?.querySelectorAll('path')
    // Should have at least 2 paths: background fill and border stroke
    expect(paths?.length).toBeGreaterThanOrEqual(2)

    // First non-clip path should be the background fill
    const bgPath = svg?.querySelector('path[fill="#ffffff"]')
    expect(bgPath).not.toBeNull()
  })

  it('should create border stroke path', () => {
    const svg = createBorderSVG(baseOptions)

    // Border path has fill="none" and stroke
    const borderPath = svg?.querySelector('path[fill="none"]')
    expect(borderPath).not.toBeNull()
    expect(borderPath?.getAttribute('stroke')).toBe('#3b82f6')
  })

  it('should apply solid style by default', () => {
    const svg = createBorderSVG(baseOptions)

    const borderPath = svg?.querySelector('path[fill="none"]')
    // Solid style should NOT have stroke-dasharray
    expect(borderPath?.getAttribute('stroke-dasharray')).toBeNull()
  })

  it('should apply dashed style when specified', () => {
    const options: BorderRenderOptions = {
      ...baseOptions,
      border: { width: 2, color: '#3b82f6', style: 'dashed' }
    }
    const svg = createBorderSVG(options)

    const borderPath = svg?.querySelector('path[fill="none"]')
    expect(borderPath?.getAttribute('stroke-dasharray')).toBe('8 4')
  })

  it('should apply dotted style with inset path', () => {
    const options: BorderRenderOptions = {
      ...baseOptions,
      border: { width: 2, color: '#10b981', style: 'dotted' }
    }
    const svg = createBorderSVG(options)

    const borderPath = svg?.querySelector('path[fill="none"]')
    expect(borderPath?.getAttribute('stroke-dasharray')).toBe('0 6')
    expect(borderPath?.getAttribute('stroke-linecap')).toBe('round')
    // Dotted should NOT use clip-path (to avoid artifacts)
    expect(borderPath?.getAttribute('clip-path')).toBeNull()
  })

  it('should apply custom dashArray when specified', () => {
    const options: BorderRenderOptions = {
      ...baseOptions,
      border: { width: 2, color: '#3b82f6', dashArray: '12 6' }
    }
    const svg = createBorderSVG(options)

    const borderPath = svg?.querySelector('path[fill="none"]')
    expect(borderPath?.getAttribute('stroke-dasharray')).toBe('12 6')
  })

  it('should use custom dashArray over style preset when both are specified', () => {
    // When both style: 'dashed' and dashArray are provided, dashArray should win
    const options: BorderRenderOptions = {
      ...baseOptions,
      border: { width: 2, color: '#3b82f6', style: 'dashed', dashArray: '12 6' }
    }
    const svg = createBorderSVG(options)

    const borderPath = svg?.querySelector('path[fill="none"]')
    // Should be '12 6' (custom), NOT '8 4' (dashed preset)
    expect(borderPath?.getAttribute('stroke-dasharray')).toBe('12 6')
  })

  it('should create gradient when gradient stops provided', () => {
    const options: BorderRenderOptions = {
      ...baseOptions,
      border: {
        width: 3,
        gradient: [
          { offset: '0%', color: '#3b82f6' },
          { offset: '100%', color: '#8b5cf6' }
        ]
      }
    }
    const svg = createBorderSVG(options)

    const gradient = svg?.querySelector('linearGradient')
    expect(gradient).not.toBeNull()
    expect(gradient?.getAttribute('id')).toMatch(/^ck-grad-/)

    const stops = gradient?.querySelectorAll('stop')
    expect(stops?.length).toBe(2)
  })

  it('should use gradient for stroke when gradient provided', () => {
    const options: BorderRenderOptions = {
      ...baseOptions,
      border: {
        width: 3,
        gradient: [
          { offset: '0%', color: '#3b82f6' },
          { offset: '100%', color: '#8b5cf6' }
        ]
      }
    }
    const svg = createBorderSVG(options)

    const borderPath = svg?.querySelector('path[fill="none"]')
    expect(borderPath?.getAttribute('stroke')).toMatch(/^url\(#ck-grad-/)
  })

  it('should handle numeric gradient offsets', () => {
    const options: BorderRenderOptions = {
      ...baseOptions,
      border: {
        width: 3,
        gradient: [
          { offset: 0, color: '#3b82f6' },
          { offset: 0.5, color: '#8b5cf6' },
          { offset: 1, color: '#ec4899' }
        ]
      }
    }
    const svg = createBorderSVG(options)

    const stops = svg?.querySelectorAll('linearGradient stop')
    expect(stops?.length).toBe(3)
    expect(stops?.[0].getAttribute('offset')).toBe('0%')
    expect(stops?.[1].getAttribute('offset')).toBe('50%')
    expect(stops?.[2].getAttribute('offset')).toBe('100%')
  })

  it('should fall back to solid color when gradient has only 1 stop', () => {
    const options: BorderRenderOptions = {
      ...baseOptions,
      border: {
        width: 2,
        color: '#3b82f6', // fallback color
        gradient: [
          { offset: '0%', color: '#8b5cf6' } // only 1 stop - invalid
        ]
      }
    }
    const svg = createBorderSVG(options)

    // Should NOT create linearGradient (requires 2+ stops)
    const gradient = svg?.querySelector('linearGradient')
    expect(gradient).toBeNull()

    // Should use fallback solid color
    const borderPath = svg?.querySelector('path[fill="none"]')
    expect(borderPath?.getAttribute('stroke')).toBe('#3b82f6')
  })

  it('should fall back to solid color when gradient is empty array', () => {
    const options: BorderRenderOptions = {
      ...baseOptions,
      border: {
        width: 2,
        color: '#ef4444',
        gradient: [] // empty array
      }
    }
    const svg = createBorderSVG(options)

    // Should NOT create linearGradient
    const gradient = svg?.querySelector('linearGradient')
    expect(gradient).toBeNull()

    // Should use fallback solid color
    const borderPath = svg?.querySelector('path[fill="none"]')
    expect(borderPath?.getAttribute('stroke')).toBe('#ef4444')
  })
})

// T011b: Unit tests for edge cases
describe('border edge cases', () => {
  describe('validateBorderWidth', () => {
    it('should clamp width below minimum to 1', () => {
      expect(validateBorderWidth(0)).toBe(1)
      expect(validateBorderWidth(-5)).toBe(1)
    })

    it('should clamp width above maximum to 8', () => {
      expect(validateBorderWidth(10)).toBe(8)
      expect(validateBorderWidth(100)).toBe(8)
    })

    it('should pass through valid widths', () => {
      expect(validateBorderWidth(2)).toBe(2)
      expect(validateBorderWidth(5)).toBe(5)
      expect(validateBorderWidth(8)).toBe(8)
    })

    it('should handle NaN as minimum width', () => {
      expect(validateBorderWidth(NaN)).toBe(1)
    })
  })

  describe('validateBorderColor', () => {
    it('should return transparent for undefined', () => {
      expect(validateBorderColor(undefined)).toBe('transparent')
    })

    it('should return transparent for empty string', () => {
      expect(validateBorderColor('')).toBe('transparent')
      expect(validateBorderColor('   ')).toBe('transparent')
    })

    it('should pass through valid colors', () => {
      expect(validateBorderColor('#3b82f6')).toBe('#3b82f6')
      expect(validateBorderColor('rgb(59, 130, 246)')).toBe('rgb(59, 130, 246)')
      expect(validateBorderColor('blue')).toBe('blue')
    })

    it('should trim whitespace from colors', () => {
      expect(validateBorderColor('  #3b82f6  ')).toBe('#3b82f6')
    })
  })

  describe('shouldSkipBorder', () => {
    it('should return true for undefined border', () => {
      expect(shouldSkipBorder(undefined)).toBe(true)
    })

    it('should return true for zero width', () => {
      expect(shouldSkipBorder({ width: 0, color: '#000' })).toBe(true)
    })

    it('should return true for negative width', () => {
      expect(shouldSkipBorder({ width: -1, color: '#000' })).toBe(true)
    })

    it('should return true for no color and no gradient', () => {
      expect(shouldSkipBorder({ width: 2 })).toBe(true)
    })

    it('should return false for valid border config', () => {
      expect(shouldSkipBorder({ width: 2, color: '#000' })).toBe(false)
    })

    it('should return false for gradient border without color', () => {
      expect(shouldSkipBorder({
        width: 2,
        gradient: [{ offset: 0, color: '#000' }, { offset: 1, color: '#fff' }]
      })).toBe(false)
    })
  })

  describe('shouldOmitBackground', () => {
    it('should return true for undefined', () => {
      expect(shouldOmitBackground(undefined)).toBe(true)
    })

    it('should return true for transparent', () => {
      expect(shouldOmitBackground('transparent')).toBe(true)
      expect(shouldOmitBackground('TRANSPARENT')).toBe(true)
    })

    it('should return true for rgba(0,0,0,0)', () => {
      expect(shouldOmitBackground('rgba(0, 0, 0, 0)')).toBe(true)
      expect(shouldOmitBackground('rgba(0,0,0,0)')).toBe(true)
    })

    it('should return false for solid colors', () => {
      expect(shouldOmitBackground('#ffffff')).toBe(false)
      expect(shouldOmitBackground('rgb(255, 255, 255)')).toBe(false)
      expect(shouldOmitBackground('white')).toBe(false)
    })
  })

  describe('createBorderSVG edge cases', () => {
    it('should return null for zero border width', () => {
      const svg = createBorderSVG({
        width: 100,
        height: 100,
        radius: 20,
        smoothing: 0.8,
        border: { width: 0, color: '#000' }
      })
      expect(svg).toBeNull()
    })

    it('should return null for undefined border', () => {
      const svg = createBorderSVG({
        width: 100,
        height: 100,
        radius: 20,
        smoothing: 0.8,
        border: undefined as unknown as BorderConfig
      })
      expect(svg).toBeNull()
    })

    it('should omit background path for transparent background', () => {
      const svg = createBorderSVG({
        width: 100,
        height: 100,
        radius: 20,
        smoothing: 0.8,
        border: { width: 2, color: '#000' },
        backgroundColor: 'transparent'
      })

      // Should only have the border path (plus defs/clipPath)
      const fillPaths = svg?.querySelectorAll('path[fill]:not([fill="none"])')
      expect(fillPaths?.length).toBe(0)
    })

    it('should clamp excessive border width', () => {
      const svg = createBorderSVG({
        width: 100,
        height: 100,
        radius: 20,
        smoothing: 0.8,
        border: { width: 20, color: '#000' }, // Exceeds 8px max
        backgroundColor: '#fff'
      })

      const borderPath = svg?.querySelector('path[fill="none"]')
      // Stroke width should be 16 (8 * 2 for clipping approach)
      expect(borderPath?.getAttribute('stroke-width')).toBe('16')
    })
  })
})

// T012: Unit tests for removeBorderSVG()
describe('removeBorderSVG', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  it('should remove existing border SVG', () => {
    // Add a mock border SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', 'cornerkit-border')
    container.appendChild(svg)

    expect(container.querySelector('.cornerkit-border')).not.toBeNull()

    removeBorderSVG(container)

    expect(container.querySelector('.cornerkit-border')).toBeNull()
  })

  it('should not throw when no border SVG exists', () => {
    expect(() => removeBorderSVG(container)).not.toThrow()
  })

  it('should only remove cornerkit-border class SVG', () => {
    // Add a different SVG that should not be removed
    const otherSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    otherSvg.setAttribute('class', 'other-svg')
    container.appendChild(otherSvg)

    // Add the border SVG
    const borderSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    borderSvg.setAttribute('class', 'cornerkit-border')
    container.appendChild(borderSvg)

    removeBorderSVG(container)

    expect(container.querySelector('.other-svg')).not.toBeNull()
    expect(container.querySelector('.cornerkit-border')).toBeNull()
  })
})

// T037: Unit tests for border update/re-render scenarios
describe('Border Dynamic Updates (T037)', () => {
  const baseOptions: BorderRenderOptions = {
    width: 100,
    height: 100,
    radius: 20,
    smoothing: 0.8,
    border: {
      width: 2,
      color: '#3b82f6'
    },
    backgroundColor: '#ffffff'
  }

  it('should create new SVG with updated border color', () => {
    const svg1 = createBorderSVG(baseOptions)
    const borderPath1 = svg1?.querySelector('path[fill="none"]')
    expect(borderPath1?.getAttribute('stroke')).toBe('#3b82f6')

    // Update color
    const updatedOptions = {
      ...baseOptions,
      border: { width: 2, color: '#ef4444' }
    }
    const svg2 = createBorderSVG(updatedOptions)
    const borderPath2 = svg2?.querySelector('path[fill="none"]')
    expect(borderPath2?.getAttribute('stroke')).toBe('#ef4444')
  })

  it('should create new SVG with updated border width', () => {
    const svg1 = createBorderSVG(baseOptions)
    const borderPath1 = svg1?.querySelector('path[fill="none"]')
    // Width 2 * 2 = 4 (doubled for clip approach)
    expect(borderPath1?.getAttribute('stroke-width')).toBe('4')

    // Update width
    const updatedOptions = {
      ...baseOptions,
      border: { width: 4, color: '#3b82f6' }
    }
    const svg2 = createBorderSVG(updatedOptions)
    const borderPath2 = svg2?.querySelector('path[fill="none"]')
    // Width 4 * 2 = 8 (doubled for clip approach)
    expect(borderPath2?.getAttribute('stroke-width')).toBe('8')
  })

  it('should create new SVG with updated border style', () => {
    // Start with solid
    const svg1 = createBorderSVG(baseOptions)
    const borderPath1 = svg1?.querySelector('path[fill="none"]')
    expect(borderPath1?.getAttribute('stroke-dasharray')).toBeNull()

    // Update to dashed
    const dashedOptions = {
      ...baseOptions,
      border: { width: 2, color: '#3b82f6', style: 'dashed' as const }
    }
    const svg2 = createBorderSVG(dashedOptions)
    const borderPath2 = svg2?.querySelector('path[fill="none"]')
    expect(borderPath2?.getAttribute('stroke-dasharray')).toBe('8 4')

    // Update to dotted
    const dottedOptions = {
      ...baseOptions,
      border: { width: 2, color: '#3b82f6', style: 'dotted' as const }
    }
    const svg3 = createBorderSVG(dottedOptions)
    const borderPath3 = svg3?.querySelector('path[fill="none"]')
    expect(borderPath3?.getAttribute('stroke-dasharray')).toBe('0 6')
    expect(borderPath3?.getAttribute('stroke-linecap')).toBe('round')
  })

  it('should create new SVG with updated dimensions for resize', () => {
    const svg1 = createBorderSVG(baseOptions)
    expect(svg1?.getAttribute('viewBox')).toBe('0 0 100 100')

    // Simulate resize
    const resizedOptions = {
      ...baseOptions,
      width: 200,
      height: 150
    }
    const svg2 = createBorderSVG(resizedOptions)
    expect(svg2?.getAttribute('viewBox')).toBe('0 0 200 150')
    expect(svg2?.getAttribute('width')).toBe('200')
    expect(svg2?.getAttribute('height')).toBe('150')
  })

  it('should update gradient when gradient stops change', () => {
    const gradientOptions = {
      ...baseOptions,
      border: {
        width: 2,
        gradient: [
          { offset: '0%', color: '#3b82f6' },
          { offset: '100%', color: '#8b5cf6' }
        ]
      }
    }
    const svg1 = createBorderSVG(gradientOptions)
    const stops1 = svg1?.querySelectorAll('linearGradient stop')
    expect(stops1?.length).toBe(2)
    expect(stops1?.[0].getAttribute('stop-color')).toBe('#3b82f6')

    // Update gradient
    const updatedGradientOptions = {
      ...baseOptions,
      border: {
        width: 2,
        gradient: [
          { offset: '0%', color: '#ef4444' },
          { offset: '50%', color: '#f59e0b' },
          { offset: '100%', color: '#10b981' }
        ]
      }
    }
    const svg2 = createBorderSVG(updatedGradientOptions)
    const stops2 = svg2?.querySelectorAll('linearGradient stop')
    expect(stops2?.length).toBe(3)
    expect(stops2?.[0].getAttribute('stop-color')).toBe('#ef4444')
    expect(stops2?.[1].getAttribute('stop-color')).toBe('#f59e0b')
    expect(stops2?.[2].getAttribute('stop-color')).toBe('#10b981')
  })

  it('should switch from solid to gradient', () => {
    // Start with solid
    const svg1 = createBorderSVG(baseOptions)
    expect(svg1?.querySelector('linearGradient')).toBeNull()
    const borderPath1 = svg1?.querySelector('path[fill="none"]')
    expect(borderPath1?.getAttribute('stroke')).toBe('#3b82f6')

    // Switch to gradient
    const gradientOptions = {
      ...baseOptions,
      border: {
        width: 2,
        gradient: [
          { offset: '0%', color: '#3b82f6' },
          { offset: '100%', color: '#8b5cf6' }
        ]
      }
    }
    const svg2 = createBorderSVG(gradientOptions)
    expect(svg2?.querySelector('linearGradient')).not.toBeNull()
    const borderPath2 = svg2?.querySelector('path[fill="none"]')
    expect(borderPath2?.getAttribute('stroke')).toMatch(/^url\(#ck-grad-/)
  })

  it('should switch from gradient to solid', () => {
    // Start with gradient
    const gradientOptions = {
      ...baseOptions,
      border: {
        width: 2,
        gradient: [
          { offset: '0%', color: '#3b82f6' },
          { offset: '100%', color: '#8b5cf6' }
        ]
      }
    }
    const svg1 = createBorderSVG(gradientOptions)
    expect(svg1?.querySelector('linearGradient')).not.toBeNull()

    // Switch to solid
    const svg2 = createBorderSVG(baseOptions)
    expect(svg2?.querySelector('linearGradient')).toBeNull()
    const borderPath2 = svg2?.querySelector('path[fill="none"]')
    expect(borderPath2?.getAttribute('stroke')).toBe('#3b82f6')
  })
})

// Tests for injectBorderStyles
describe('injectBorderStyles', () => {
  afterEach(() => {
    resetBorderStylesInjection()
  })

  it('should inject styles into document head', () => {
    injectBorderStyles()

    const styleEl = document.getElementById('cornerkit-svg-border-styles')
    expect(styleEl).not.toBeNull()
    expect(styleEl?.textContent).toContain('.cornerkit-border')
  })

  it('should only inject styles once', () => {
    injectBorderStyles()
    injectBorderStyles()
    injectBorderStyles()

    const styleEls = document.querySelectorAll('#cornerkit-svg-border-styles')
    expect(styleEls.length).toBe(1)
  })

  it('should include z-index: -1 for proper stacking', () => {
    injectBorderStyles()

    const styleEl = document.getElementById('cornerkit-svg-border-styles')
    expect(styleEl?.textContent).toContain('z-index: -1')
  })

  it('should include pointer-events: none', () => {
    injectBorderStyles()

    const styleEl = document.getElementById('cornerkit-svg-border-styles')
    expect(styleEl?.textContent).toContain('pointer-events: none')
  })
})
