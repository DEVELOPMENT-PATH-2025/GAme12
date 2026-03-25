import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Sky, Stars, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';

function Car({ position, color, opacity = 1 }: { position: [number, number, number], color: string, opacity?: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      // Slight tilt on movement
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Car Body - Larger */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[2, 0.8, 4]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>
      {/* Car Cabin - Larger */}
      <mesh position={[0, 1.4, -0.4]}>
        <boxGeometry args={[1.6, 0.8, 2]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>
      {/* Wheels - Larger */}
      {[[-1, 0.4, 1.2], [1, 0.4, 1.2], [-1, 0.4, -1.2], [1, 0.4, -1.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#111" transparent opacity={opacity} />
        </mesh>
      ))}
      {/* Headlights */}
      {[[0.7, 0.7, 2], [-0.7, 0.7, 2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

function Track() {
  const trackLength = 1000;
  const trackWidth = 10;

  return (
    <group>
      {/* Main Track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, trackLength / 2 - 10]}>
        <planeGeometry args={[trackWidth, trackLength]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      
      {/* Side Rails */}
      <mesh position={[-trackWidth / 2, 0.2, trackLength / 2 - 10]}>
        <boxGeometry args={[0.2, 0.5, trackLength]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[trackWidth / 2, 0.2, trackLength / 2 - 10]}>
        <boxGeometry args={[0.2, 0.5, trackLength]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Center Line Markings */}
      {Array.from({ length: 100 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, i * 10]}>
          <planeGeometry args={[0.2, 2]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      ))}
    </group>
  );
}

function CameraFollow() {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const { camera } = useThree();
  const vec = new THREE.Vector3();

  useFrame(() => {
    // Smoothly follow player car from behind
    const targetX = 0;
    const targetY = 5;
    const targetZ = playerPosition - 8;
    
    vec.set(targetX, targetY, targetZ);
    camera.position.lerp(vec, 0.1);
    camera.lookAt(0, 1, playerPosition + 5);
  });

  return null;
}

export function GameScene() {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const ghostPosition = useGameStore((state) => state.ghostPosition);
  const updatePositions = useGameStore((state) => state.updatePositions);
  const tick = useGameStore((state) => state.tick);

  useFrame((_, delta) => {
    updatePositions(delta);
    tick();
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 6, -12]} fov={60} />
      <CameraFollow />
      
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      <Sky sunPosition={[100, 20, 100]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Track />
      
      {/* Player Car - Blue */}
      <Car position={[0, 0, playerPosition]} color="#3b82f6" />
      
      {/* Ghost Car - Red (Semi-transparent) */}
      <Car position={[0, 0, ghostPosition]} color="#ef4444" opacity={0.4} />

      {/* Ground Grid for reference */}
      <gridHelper args={[200, 50, 0x444444, 0x222222]} position={[0, -0.05, 100]} />
    </>
  );
}
