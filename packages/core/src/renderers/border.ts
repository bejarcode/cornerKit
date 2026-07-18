/**
 * SVG Border Renderer
 * Feature 006: Creates SVG-based borders that follow squircle curves
 *
 * Architecture:
 * - SVG contains: background fill path + border stroke path
 * - SVG positioned with z-index: -1
 * - Parent uses isolation: isolate
 * - NO CSS clip-path on element (causes anti-aliasing fringe)
 */

import { generateSquirclePath } from '../math/path-generator'
import type { BorderConfig, GradientStop, BorderRenderOptions } from '../core/types'
import { warn } from '../utils/logger'

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Minimum border width allowed */
const MIN_BORDER_WIDTH = 1

/** Maximum border width allowed */
const MAX_BORDER_WIDTH = 8

/** Default border color when invalid color provided */
const DEFAULT_BORDER_COLOR = 'transparent'

/**
 * T010b: Validate and clamp border width to 1-8px range
 * Also clamps based on element dimensions per spec: min(8px, min(width, height) / 4)
 * @param width - Input border width
 * @param elementWidth - Optional element width for dimension-based clamping
 * @param elementHeight - Optional element height for dimension-based clamping
 * @returns Clamped border width
 */
export function validateBorderWidth(width: number, elementWidth?: number, elementHeight?: number): number {
  if (typeof width !== 'number' || isNaN(width)) {
    return MIN_BORDER_WIDTH
  }

  let maxWidth = MAX_BORDER_WIDTH

  // Apply dimension-based clamping if dimensions provided
  if (elementWidth !== undefined && elementHeight !== undefined && elementWidth > 0 && elementHeight > 0) {
    const dimensionMax = Math.min(elementWidth, elementHeight) / 4
    maxWidth = Math.min(maxWidth, dimensionMax)
  }

  return Math.max(MIN_BORDER_WIDTH, Math.min(maxWidth, width))
}

/**
 * T010c: Validate border color
 * Returns fallback if color is invalid or empty
 * @param color - Input color string
 * @returns Valid color or transparent fallback
 */
export function validateBorderColor(color: string | undefined): string {
  if (!color || typeof color !== 'string' || color.trim() === '') {
    return DEFAULT_BORDER_COLOR
  }
  return color.trim()
}

/**
 * T010d: Check if border should be skipped (zero width)
 * @param border - Border config
 * @returns true if border should be skipped
 */
export function shouldSkipBorder(border: BorderConfig | undefined): boolean {
  if (!border) return true
  if (border.width <= 0) return true
  // Need either color or gradient
  if (!border.color && (!border.gradient || border.gradient.length === 0)) return true
  return false
}

/**
 * T010e: Check if background fill should be omitted
 * @param backgroundColor - Computed background color
 * @returns true if background should be omitted from SVG
 */
export function shouldOmitBackground(backgroundColor: string | undefined): boolean {
  if (!backgroundColor) return true
  const lowerColor = backgroundColor.toLowerCase().trim()
  if (lowerColor === 'transparent') return true
  if (lowerColor === 'rgba(0, 0, 0, 0)') return true
  if (lowerColor === 'rgba(0,0,0,0)') return true
  return false
}

/**
 * T006: Create SVG element for border rendering
 * Returns SVG that should be inserted as first child of element
 *
 * @param options - Border render options
 * @returns SVGSVGElement to insert into DOM, or null if border should be skipped
 */
export function createBorderSVG(options: BorderRenderOptions): SVGSVGElement | null {
  // SSR safety: return null in non-browser environments
  if (typeof document === 'undefined') {
    return null
  }

  const { width, height, radius, smoothing, border, backgroundColor } = options

  // T010d: Skip if zero border width
  if (shouldSkipBorder(border)) {
    return null
  }

  // T010b: Validate and clamp border width (with dimension-based clamping)
  const borderWidth = validateBorderWidth(border.width, width, height)

  // T010c: Validate border color
  const borderColor = validateBorderColor(border.color)

  const { style = 'solid', dashArray, gradient } = border

  // Generate outer squircle path (for background and clip)
  const pathData = generateSquirclePath(width, height, radius, smoothing)

  // Create SVG container
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('class', 'cornerkit-border')
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  svg.setAttribute('aria-hidden', 'true')
  // Clip content to viewBox to prevent background stroke from bleeding outside
  svg.style.overflow = 'hidden'

  // Create defs for clip-path and optional gradient
  const defs = document.createElementNS(SVG_NS, 'defs')

  // Always create clip-path: needed for background stroke (all styles) and border stroke (solid/dashed)
  const clipId = 'ck-clip-' + Math.random().toString(36).substring(2, 11)
  const clipPathEl = document.createElementNS(SVG_NS, 'clipPath')
  clipPathEl.setAttribute('id', clipId)
  const clipPath = document.createElementNS(SVG_NS, 'path')
  clipPath.setAttribute('d', pathData)
  clipPathEl.appendChild(clipPath)
  defs.appendChild(clipPathEl)

  // Determine stroke value (gradient or solid color)
  let strokeValue = borderColor
  if (gradient && gradient.length > 0 && gradient.length < 2) {
    warn('Border gradient requires at least 2 color stops. Falling back to solid color.')
  }
  if (gradient && gradient.length >= 2) {
    const gradId = 'ck-grad-' + Math.random().toString(36).substring(2, 11)
    const gradEl = document.createElementNS(SVG_NS, 'linearGradient')
    gradEl.setAttribute('id', gradId)
    gradEl.setAttribute('x1', '0%')
    gradEl.setAttribute('y1', '0%')
    gradEl.setAttribute('x2', '100%')
    gradEl.setAttribute('y2', '100%')

    gradient.forEach((stop: GradientStop) => {
      const stopEl = document.createElementNS(SVG_NS, 'stop')
      // Handle offset as number or string
      const offsetValue = typeof stop.offset === 'number'
        ? `${stop.offset * 100}%`
        : String(stop.offset)
      stopEl.setAttribute('offset', offsetValue)
      stopEl.setAttribute('stop-color', stop.color)
      gradEl.appendChild(stopEl)
    })

    defs.appendChild(gradEl)
    strokeValue = `url(#${gradId})`
  }

  svg.appendChild(defs)

  // T010e: Background fill path (renders element background as squircle)
  if (backgroundColor && !shouldOmitBackground(backgroundColor)) {
    const bgPath = document.createElementNS(SVG_NS, 'path')
    bgPath.setAttribute('d', pathData)
    bgPath.setAttribute('fill', backgroundColor)

    // Extend background with stroke for dashed/dotted borders
    // This covers anti-aliased edges visible through gaps
    // CRITICAL: Clip the stroke to squircle shape to prevent corner bleeding
    if (style === 'dotted') {
      bgPath.setAttribute('stroke', backgroundColor)
      bgPath.setAttribute('stroke-width', String(borderWidth * 2))
      bgPath.setAttribute('clip-path', `url(#${clipId})`)
    } else if (style === 'dashed' || dashArray) {
      bgPath.setAttribute('stroke', backgroundColor)
      bgPath.setAttribute('stroke-width', String(borderWidth))
      bgPath.setAttribute('clip-path', `url(#${clipId})`)
    } else {
      // Solid: small stroke to cover anti-aliasing, clipped to shape
      bgPath.setAttribute('stroke', backgroundColor)
      bgPath.setAttribute('stroke-width', '0.5')
      bgPath.setAttribute('clip-path', `url(#${clipId})`)
    }

    // Same hover/theming hook for the background fill:
    //   .btn:hover { --ck-background: #1e293b }
    bgPath.style.fill = `var(--ck-background, ${backgroundColor})`
    bgPath.style.stroke = `var(--ck-background, ${backgroundColor})`

    svg.appendChild(bgPath)
  }

  // Border stroke path
  const borderPath = document.createElementNS(SVG_NS, 'path')
  borderPath.setAttribute('fill', 'none')
  borderPath.setAttribute('stroke', strokeValue)
  // Hover/theming hook (GitHub issue #4): the stroke resolves through a CSS
  // custom property inherited from the host element, so plain CSS can
  // restyle the border with no JavaScript:
  //   .btn:hover { --ck-border-color: hotpink }
  // The configured color/gradient is the var() fallback. The inline style
  // wins the cascade; the attribute above stays as the resolved value.
  borderPath.style.stroke = `var(--ck-border-color, ${strokeValue})`

  // CRITICAL: Dotted borders use INSET PATH (no clip-path)
  // to avoid clip-path anti-aliasing artifacts through gaps
  if (style === 'dotted') {
    const insetPath = generateSquirclePath(width, height, radius, smoothing, borderWidth / 2)
    borderPath.setAttribute('d', insetPath)
    borderPath.setAttribute('stroke-width', String(borderWidth)) // 1× (not doubled)
    borderPath.setAttribute('stroke-dasharray', '0 6')
    borderPath.setAttribute('stroke-linecap', 'round')
    // NO clip-path for dotted!
  } else {
    // Solid/dashed: use clip-path approach
    borderPath.setAttribute('d', pathData)
    borderPath.setAttribute('stroke-width', String(borderWidth * 2)) // 2× for clipping
    borderPath.setAttribute('clip-path', `url(#${clipId})`)

    // Custom dashArray takes precedence over style preset
    if (dashArray) {
      borderPath.setAttribute('stroke-dasharray', dashArray)
    } else if (style === 'dashed') {
      borderPath.setAttribute('stroke-dasharray', '8 4')
    }
    // solid: no dasharray needed
  }

  borderPath.setAttribute('vector-effect', 'non-scaling-stroke')
  borderPath.setAttribute('shape-rendering', 'geometricPrecision')

  svg.appendChild(borderPath)

  return svg
}

/**
 * T007: Remove existing border SVG from element
 * @param element - Target HTMLElement
 */
export function removeBorderSVG(element: HTMLElement): void {
  const existing = element.querySelector('.cornerkit-border')
  if (existing) {
    existing.remove()
  }
}

/**
 * T008: Global CSS styles for SVG borders (injected once per page)
 */
let borderStylesInjected = false

export function injectBorderStyles(): void {
  if (borderStylesInjected || typeof document === 'undefined') {
    return
  }

  const style = document.createElement('style')
  style.id = 'cornerkit-svg-border-styles'
  style.textContent = `
    .cornerkit-border {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: -1;
    }
  `
  document.head.appendChild(style)
  borderStylesInjected = true
}

/**
 * Reset border styles injection flag (for testing)
 */
export function resetBorderStylesInjection(): void {
  borderStylesInjected = false
  const existing = document.getElementById('cornerkit-svg-border-styles')
  if (existing) {
    existing.remove()
  }
}
