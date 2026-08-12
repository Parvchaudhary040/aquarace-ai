import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraRig() {
  useFrame(({ camera, mouse, clock }) => {
    const time = clock.getElapsedTime() * 0.2;
    
    // Slow orbiting movement + subtle mouse parallax
    const targetX = Math.sin(time) * 4 + mouse.x * 2;
    const targetY = 6 + mouse.y * 1.5;
    const targetZ = 16 + Math.cos(time) * 3;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.03);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.03);

    camera.lookAt(0, 0, 0);
  });

  return null;
}
