// src/pages/HouseModel.jsx
import { useGLTF } from "@react-three/drei";

export default function HouseModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  const { scene } = useGLTF("/models/house.glb");

  // Clone and return the scene with your specified transforms
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}
