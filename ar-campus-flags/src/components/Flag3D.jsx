// src/components/Flag3D.jsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const Flag3D = ({ position, message, color = '#3498db', onClick }) => {
  const flagRef = useRef();
  const poleRef = useRef();
  const groupRef = useRef();
  
  // Calculate distance from origin (camera)
  const distance = useMemo(() => {
    return Math.sqrt(position[0] * position[0] + position[1] * position[1] + position[2] * position[2]);
  }, [position]);
  
  // Scale based on distance (closer = bigger)
  const scale = useMemo(() => {
    // Base scale with minimum and maximum limits
    return Math.max(0.5, Math.min(2, 2 / Math.max(1, distance * 0.2)));
  }, [distance]);
  
  // Animate the flag slightly and keep it upright
  useFrame(({ clock }) => {
    if (flagRef.current && groupRef.current) {
      // Gentle wave animation
      flagRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.05 + 0.5;
      
      // Always face the camera (billboarding) but keep Y-axis upright
      groupRef.current.lookAt(0, groupRef.current.position.y, 0);
      
      // Force the group to stay upright
      groupRef.current.rotation.x = 0;
      groupRef.current.rotation.z = 0;
    }
  });

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={onClick}
      scale={[scale, scale, scale]}
    >
      {/* Flag pole */}
      <mesh ref={poleRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Flag */}
      <mesh 
        ref={flagRef} 
        position={[0.25, 0.5, 0]}
      >
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>
      
      {/* Flag text preview (shows only a short preview) */}
      <Text
        position={[0.25, 0.5, 0.01]}
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