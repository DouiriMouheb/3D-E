// src/pages/Hotspot.jsx
import { useState } from "react";
import { Html } from "@react-three/drei";

export default function Hotspot({ position, onClick, label }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Clickable sphere */}
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={hovered ? "#ff4500" : "#2196f3"}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Label that appears on hover */}
    </group>
  );
}
