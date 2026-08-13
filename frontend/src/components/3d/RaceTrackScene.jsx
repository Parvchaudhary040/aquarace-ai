import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { isWebGLAvailable } from '../../utils/webglDetect';

/**
 * RaceTrackScene — Three.js 3D race track background.
 *
 * Fault-tolerant:
 *  - Checks WebGL availability before creating the renderer.
 *  - Wraps renderer creation in try/catch.
 *  - Calls onWebGLFailed() if anything goes wrong.
 *  - Fully cleans up on unmount (renderer, geometries, materials,
 *    animation frame, event listeners).
 *
 * @param {Function} [onWebGLFailed] - called when WebGL is unavailable or fails
 */
export default function RaceTrackScene({ onWebGLFailed }) {
  const containerRef = useRef(null);
  // StrictMode double-invocation guard
  const initDoneRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. Pre-flight WebGL detection ──────────────────────────
    if (!isWebGLAvailable()) {
      console.warn('[RaceTrackScene] WebGL unavailable — activating CSS fallback.');
      if (onWebGLFailed) onWebGLFailed();
      return;
    }

    // ── 2. StrictMode guard ────────────────────────────────────
    if (initDoneRef.current) return;
    initDoneRef.current = true;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');
    scene.fog = new THREE.FogExp2('#020617', 0.035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 7, 16);

    // ── 3. WebGL Renderer — wrapped in try/catch ───────────────
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('[RaceTrackScene] THREE.WebGLRenderer failed:', err);
      if (onWebGLFailed) onWebGLFailed();
      return;
    }

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 1.5, 30);
    cyanPointLight.position.set(-8, 3, -2);
    scene.add(cyanPointLight);

    const amberPointLight = new THREE.PointLight(0xf59e0b, 1.5, 30);
    amberPointLight.position.set(10, 3, 6);
    scene.add(amberPointLight);

    // 5. Curved Track Ribbon
    const points = [
      new THREE.Vector3(-18, -4, -10),
      new THREE.Vector3(-10, -2, -4),
      new THREE.Vector3(-2, 0, 2),
      new THREE.Vector3(6, 1, -2),
      new THREE.Vector3(14, -1, 6),
      new THREE.Vector3(22, -3, 14),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const trackGeometry = new THREE.TubeGeometry(curve, 120, 1.8, 12, false);
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.7,
    });
    const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
    scene.add(trackMesh);

    // 6. Edge Curb Lines & Trajectory Line
    const curvePoints = curve.getPoints(120);
    const leftPoints = [];
    const rightPoints = [];

    curvePoints.forEach((pt, i) => {
      const tangent = curve.getTangent(i / 120).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();
      leftPoints.push(pt.clone().addScaledVector(side, 1.85));
      rightPoints.push(pt.clone().addScaledVector(side, -1.85));
    });

    const leftGeom = new THREE.BufferGeometry().setFromPoints(leftPoints);
    const rightGeom = new THREE.BufferGeometry().setFromPoints(rightPoints);

    const leftLine = new THREE.Line(leftGeom, new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 }));
    const rightLine = new THREE.Line(rightGeom, new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 }));
    scene.add(leftLine);
    scene.add(rightLine);

    // Center Trajectory Line
    const centerGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const centerLine = new THREE.Line(centerGeom, new THREE.LineDashedMaterial({
      color: 0x22d3ee,
      dashSize: 0.8,
      gapSize: 0.6,
      linewidth: 2,
    }));
    centerLine.computeLineDistances();
    scene.add(centerLine);

    // 7. Floating 3D Telemetry Spheres
    const markerMatCyan = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const markerMatAmber = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const sphereGeom = new THREE.SphereGeometry(0.3, 16, 16);

    const marker1 = new THREE.Mesh(sphereGeom, markerMatCyan);
    marker1.position.set(-10, 0.5, -4);
    scene.add(marker1);

    const marker2 = new THREE.Mesh(sphereGeom, markerMatAmber);
    marker2.position.set(-2, 1.2, 2);
    scene.add(marker2);

    // 8. Mouse Parallax & Animation Loop
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = performance.now() * 0.0005;

      // Orbit camera slowly & add mouse lerp
      const targetX = Math.sin(time) * 3 + mouseX * 1.5;
      const targetY = 6 + mouseY * 1.0;
      const targetZ = 16 + Math.cos(time) * 2;

      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (targetY - camera.position.y) * 0.03;
      camera.position.z += (targetZ - camera.position.z) * 0.03;
      camera.lookAt(0, 0, 0);

      // Float telemetry spheres
      marker1.position.y = Math.sin(time * 3) * 0.25 + 0.5;
      marker2.position.y = Math.sin(time * 3 + 1) * 0.25 + 1.2;

      try {
        renderer.render(scene, camera);
      } catch (err) {
        console.warn('[RaceTrackScene] Render error — stopping animation:', err);
        cancelAnimationFrame(animationFrameId);
        if (onWebGLFailed) onWebGLFailed();
      }
    };
    animate();

    return () => {
      initDoneRef.current = false;

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose geometries & materials
      trackGeometry.dispose();
      trackMaterial.dispose();
      leftGeom.dispose();
      rightGeom.dispose();
      centerGeom.dispose();
      sphereGeom.dispose();
      markerMatCyan.dispose();
      markerMatAmber.dispose();
      leftLine.material.dispose();
      rightLine.material.dispose();
      centerLine.material.dispose();
      scene.clear();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden pointer-events-auto">
      {/* Grid Radial Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#020617_85%)] z-10" />
    </div>
  );
}
