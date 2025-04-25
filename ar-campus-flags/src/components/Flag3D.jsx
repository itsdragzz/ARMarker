// src/components/Flag3D.jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const Flag3D = ({ position, message, color = '#3498db', onClick }) => {
  const flagRef = useRef();
  const poleRef = useRef();
  
  // Animate the flag slightly
  useFrame(({ clock }) => {
    if (flagRef.current) {
      // Gentle wave animation
      flagRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.05 + position[1] + 0.5;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Flag pole */}
      <mesh ref={poleRef}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Flag */}
      <mesh 
        ref={flagRef} 
        position={[0.25, position[1] + 0.5, 0]}
      >
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>
      
      {/* Flag text preview (shows only a short preview) */}
      <Text
        position={[0.25, position[1] + 0.5, 0.01]}
        fontSize={0.04}
        maxWidth={0.45}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {message.length > 20 ? message.substring(0, 20) + "..." : message}
      </Text>
    </group>
  );
};

export default Flag3D;