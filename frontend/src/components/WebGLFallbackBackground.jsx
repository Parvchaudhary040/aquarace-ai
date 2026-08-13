/**
 * WebGLFallbackBackground.jsx
 *
 * Premium CSS-animated background shown when WebGL / Three.js is unavailable.
 * Preserves the AquaRace AI visual identity:
 *   - Deep navy/black base (#020617 = slate-950)
 *   - Cyan / blue atmospheric gradients
 *   - Animated perspective grid
 *   - Floating particle dots (pure CSS)
 *   - Radial centre glow
 *
 * Zero canvas, zero images, zero external dependencies.
 * Intentionally premium — NOT an error state.
 */

import React from 'react';
import './WebGLFallbackBackground.css';

export default function WebGLFallbackBackground() {
  return (
    <div className="webgl-fallback" aria-hidden="true">
      {/* Deep radial glow at centre */}
      <div className="wf-glow-center" />

      {/* Secondary off-centre cyan glow */}
      <div className="wf-glow-left" />

      {/* Perspective grid floor */}
      <div className="wf-grid" />

      {/* Horizontal scan line */}
      <div className="wf-scanline" />

      {/* Floating particle field — pure CSS */}
      <div className="wf-particles">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className="wf-particle" style={{ '--i': i }} />
        ))}
      </div>

      {/* Bottom vignette */}
      <div className="wf-vignette" />
    </div>
  );
}
