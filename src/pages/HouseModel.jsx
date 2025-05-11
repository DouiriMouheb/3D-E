// src/pages/HouseModel.jsx
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

export default function HouseModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  const { scene } = useGLTF("/models/house.glb");

  // Prepare model for collision detection
  useEffect(() => {
    // Compute bounding boxes for all meshes for collision detection
    scene.traverse((object) => {
      if (object.isMesh && object.geometry) {
        // Compute bounding box for each geometry
        object.geometry.computeBoundingBox();

        // This helps with raycasting later
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    console.log("House model prepared for collision detection");
  }, [scene]);

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

// Preload the model
useGLTF.preload("/models/house.glb");
