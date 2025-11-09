/**
 * Browser Capability Detector
 * Detects support for different rendering tiers using feature detection
 * Implements singleton pattern with cached results (FR-013)
 */

export enum RendererTier {
  NATIVE = 'native',
  HOUDINI = 'houdini',
  CLIPPATH = 'clippath',
  FALLBACK = 'fallback',
}

export interface BrowserSupport {
  native: boolean;
  houdini: boolean;
  clippath: boolean;
  fallback: boolean;
}

/**
 * Capability Detector Singleton
 * Runs feature detection once and caches results
 */
export class CapabilityDetector {
  private static instance: CapabilityDetector | null = null;
  private cachedSupport: BrowserSupport | null = null;

  private constructor() {
    // Private constructor enforces singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CapabilityDetector {
    if (!CapabilityDetector.instance) {
      CapabilityDetector.instance = new CapabilityDetector();
    }
    return CapabilityDetector.instance;
  }

  /**
   * Detect all browser capabilities (FR-009 to FR-013)
   * Results are cached after first call
   */
  public supports(): BrowserSupport {
    // Return cached results if available (FR-013)
    if (this.cachedSupport) {
      return this.cachedSupport;
    }

    // Run feature detection
    this.cachedSupport = {
      native: this.detectNative(), // FR-009
      houdini: this.detectHoudini(), // FR-010
      clippath: this.detectClipPath(), // FR-011
      fallback: true, // FR-012: Always available
    };

    return this.cachedSupport;
  }

  /**
   * Detect best available tier for rendering
   * Returns highest tier supported by browser
   */
  public detectTier(): RendererTier {
    const support = this.supports();

    if (support.native) {
      return RendererTier.NATIVE;
    }

    if (support.houdini) {
      return RendererTier.HOUDINI;
    }

    if (support.clippath) {
      return RendererTier.CLIPPATH;
    }

    return RendererTier.FALLBACK;
  }

  /**
   * FR-009: Detect Native CSS corner-shape: squircle support
   * Chrome 139+ (when available)
   */
  private detectNative(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) {
      return false;
    }

    try {
      return CSS.supports('corner-shape', 'squircle');
    } catch {
      return false;
    }
  }

  /**
   * FR-010: Detect CSS Houdini Paint API support
   * Chrome 65+, Edge 79+
   */
  private detectHoudini(): boolean {
    if (typeof CSS === 'undefined') {
      return false;
    }

    try {
      return 'paintWorklet' in CSS;
    } catch {
      return false;
    }
  }

  /**
   * FR-011: Detect SVG clip-path support
   * All modern browsers
   */
  private detectClipPath(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) {
      return false;
    }

    try {
      return CSS.supports('clip-path', 'path("")');
    } catch {
      return false;
    }
  }

  /**
   * Static method for convenient access without instantiation
   */
  public static supports(): BrowserSupport {
    return CapabilityDetector.getInstance().supports();
  }
}
