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
    // Increased base scale with minimum and maximum limits for better visibility
    return Math.max(0.8, Math.min(2.5, 2.5 / Math.max(1, distance * 0.2)));
  }, [distance]);
  
  // Animate the flag slightly and keep it upright
  useFrame(({ clock }) => {
    if (flagRef.current && groupRef.current) {
      // Gentle wave animation
      flagRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.05 + 0.5;
      
      // Add a slight bobbing motion for visibility
      groupRef.current.position.y += Math.sin(clock.getElapsedTime() * 1.5) * 0.0015;
      
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
      
      {/* Flag - Made larger and more vibrant */}
      <mesh 
        ref={flagRef} 
        position={[0.3, 0.5, 0]}
      >
        <planeGeometry args={[0.7, 0.4]} />
        <meshStandardMaterial color={color} side={2} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      
      {/* Add glowing outline for better visibility */}
      <mesh position={[0.3, 0.5, -0.01]} scale={[1.05, 1.05, 1]}>
        <planeGeometry args={[0.7, 0.4]} />
        <meshBasicMaterial color="white" transparent opacity={0.3} />
      </mesh>
      
      {/* Flag text preview (shows only a short preview) */}
      <Text
        position={[0.3, 0.5, 0.01]}
        fontSize={0.05} // Increased font size
        maxWidth={0.6}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005} // Added outline for better visibility
        outlineColor="black"
      >
        {message.length > 20 ? message.substring(0, 20) + "..." : message}
      </Text>
      
      {/* Add a floating indicator arrow above the flag */}
      <mesh position={[0.3, 1.0, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.07, 0.15, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

export default Flag3D;