import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export default function TelemetryMarkers() {
  const markerRef1 = useRef();
  const markerRef2 = useRef();
  const markerRef3 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (markerRef1.current) markerRef1.current.position.y = Math.sin(t * 1.5) * 0.2 + 0.5;
    if (markerRef2.current) markerRef2.current.position.y = Math.sin(t * 1.5 + 1) * 0.2 + 1.2;
    if (markerRef3.current) markerRef3.current.position.y = Math.sin(t * 1.5 + 2) * 0.2 + 0.8;
  });

  return (
    <group>
      {/* Marker 1: Sector Apex */}
      <group ref={markerRef1} position={[-10, 0.5, -4]}>
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
        <Html distanceFactor={15} center>
          <div className="telemetry-card px-2.5 py-1 rounded bg-slate-950/90 border border-cyan-500/50 text-[10px] font-mono text-cyan-300 font-bold whitespace-nowrap shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            SECTOR 01 :: DRIEST LINE
          </div>
        </Html>
      </group>

      {/* Marker 2: Moisture Apex */}
      <group ref={markerRef2} position={[-2, 1.2, 2]}>
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <Html distanceFactor={15} center>
          <div className="telemetry-card px-2.5 py-1 rounded bg-slate-950/90 border border-amber-500/50 text-[10px] font-mono text-amber-300 font-bold whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            APEX INTEL :: TRANSITION ZONE
          </div>
        </Html>
      </group>

      {/* Marker 3: Aqua Risk Node */}
      <group ref={markerRef3} position={[14, 0.8, 6]}>
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <Html distanceFactor={15} center>
          <div className="telemetry-card px-2.5 py-1 rounded bg-slate-950/90 border border-rose-500/50 text-[10px] font-mono text-rose-300 font-bold whitespace-nowrap shadow-[0_0_12px_rgba(239,68,68,0.4)]">
            CROSSOVER :: SLICK TIRE WINDOW
          </div>
        </Html>
      </group>
    </group>
  );
}
