import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function TrackSurface() {
  const trackLineRef = useRef();

  // Define a smooth 3D curved racing track path
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(-18, -4, -10),
      new THREE.Vector3(-10, -2, -4),
      new THREE.Vector3(-2, 0, 2),
      new THREE.Vector3(6, 1, -2),
      new THREE.Vector3(14, -1, 6),
      new THREE.Vector3(22, -3, 14),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, []);

  // Generate Extruded Track Tube Ribbon
  const { trackGeometry, edgeLeftPoints, edgeRightPoints } = useMemo(() => {
    const geom = new THREE.TubeGeometry(curve, 100, 1.8, 12, false);
    
    // Generate curb edge lines
    const points = curve.getPoints(100);
    const leftPoints = [];
    const rightPoints = [];

    points.forEach((pt, i) => {
      const tangent = curve.getTangent(i / 100).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      leftPoints.push(pt.clone().addScaledVector(side, 1.85));
      rightPoints.push(pt.clone().addScaledVector(side, -1.85));
    });

    return {
      trackGeometry: geom,
      edgeLeftPoints: new THREE.BufferGeometry().setFromPoints(leftPoints),
      edgeRightPoints: new THREE.BufferGeometry().setFromPoints(rightPoints),
    };
  }, [curve]);

  // Animate glowing trajectory line along the path
  useFrame(({ clock }) => {
    if (trackLineRef.current) {
      trackLineRef.current.material.dashOffset = -clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <group>
      {/* Dark Asphalt Track Mesh */}
      <mesh geometry={trackGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.4}
          metalness={0.7}
          wireframe={false}
        />
      </mesh>

      {/* Left Edge Curb */}
      <line geometry={edgeLeftPoints}>
        <lineBasicMaterial color="#06b6d4" linewidth={2} opacity={0.6} transparent />
      </line>

      {/* Right Edge Curb */}
      <line geometry={edgeRightPoints}>
        <lineBasicMaterial color="#f59e0b" linewidth={2} opacity={0.6} transparent />
      </line>

      {/* Center Animated Trajectory Line */}
      <line ref={trackLineRef} geometry={edgeLeftPoints}>
        <lineDashedMaterial
          color="#22d3ee"
          dashSize={0.8}
          gapSize={0.6}
          linewidth={3}
          transparent
          opacity={0.85}
        />
      </line>
    </group>
  );
}
