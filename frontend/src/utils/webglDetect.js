/**
 * webglDetect.js
 *
 * Safe, one-shot WebGL availability check.
 * Result is cached after first call so we never create
 * more than one test canvas per session.
 *
 * Returns true if at least webgl or webgl2 is available.
 * Never throws.
 */

let _cachedResult = null;

/**
 * @returns {boolean} true if WebGL is available in this browser/environment
 */
export function isWebGLAvailable() {
  if (_cachedResult !== null) return _cachedResult;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    // gl is valid if it exists and has a WebGL-like API
    _cachedResult = !!(gl && typeof gl.drawArrays === 'function');

    if (_cachedResult) {
      // Immediately lose the context on the test canvas to free GPU resources
      const ext = gl.getExtension && gl.getExtension('WEBGL_lose_context');
      if (ext) {
        try { ext.loseContext(); } catch (_) { /* ignore */ }
      }
    }

    return _cachedResult;
  } catch (e) {
    console.warn('[WebGL] Detection failed:', e);
    _cachedResult = false;
    return false;
  }
}
