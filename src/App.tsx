import { Canvas } from '@react-three/fiber';
import { GameScene } from './components/GameScene';
import { UI } from './components/UI';
import { Suspense } from 'react';
import { Loader } from '@react-three/drei';

export default function App() {
  return (
    <div className="w-full h-screen bg-[#050505] overflow-hidden relative font-sans">
      <Suspense fallback={null}>
        <Canvas shadows dpr={[1, 2]}>
          <GameScene />
        </Canvas>
      </Suspense>
      <Loader />
      <UI />
    </div>
  );
}
