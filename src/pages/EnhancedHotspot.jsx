// src/pages/Hotspot.jsx
import { useState, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function Hotspot({ position, onClick, label }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  // Add subtle pulsing animation to make hotspots more noticeable
  useFrame(() => {
    if (meshRef.current) {
      // Gentle pulsing effect
      const pulse = 1 + 0.1 * Math.sin(Date.now() * 0.003);
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={position}>
      {/* Clickable sphere */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={hovered ? "#ff4500" : "#2196f3"}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Ring around the sphere */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.7, 32]} />
        <meshBasicMaterial
          color={hovered ? "#ff7d4d" : "#64b5f6"}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Label that appears on hover */}
    </group>
  );
}
