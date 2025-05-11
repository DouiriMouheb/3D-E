// src/pages/HouseModelInspector.jsx
import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";

export default function HouseModelInspector({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  const { scene } = useGLTF("/models/house.glb");
  const [modelInfo, setModelInfo] = useState({});
  const [showDebug, setShowDebug] = useState(true);

  // Analyze the 3D model structure
  useEffect(() => {
    const objectTypes = {};
    const allObjects = [];

    // Traverse the entire scene to collect object information
    scene.traverse((object) => {
      if (object.isMesh) {
        // Store object names
        const name = object.name || "unnamed";
        allObjects.push({
          name: name,
          type: object.type,
          geometry: object.geometry ? object.geometry.type : "unknown",
          position: [
            parseFloat(object.position.x.toFixed(2)),
            parseFloat(object.position.y.toFixed(2)),
            parseFloat(object.position.z.toFixed(2)),
          ],
        });

        // Categorize objects by their name patterns
        if (
          name.toLowerCase().includes("wall") ||
          name.toLowerCase().includes("mur")
        ) {
          objectTypes.walls = objectTypes.walls || [];
          objectTypes.walls.push(name);
        } else if (
          name.toLowerCase().includes("floor") ||
          name.toLowerCase().includes("sol")
        ) {
          objectTypes.floors = objectTypes.floors || [];
          objectTypes.floors.push(name);
        } else if (
          name.toLowerCase().includes("ceiling") ||
          name.toLowerCase().includes("plafond")
        ) {
          objectTypes.ceilings = objectTypes.ceilings || [];
          objectTypes.ceilings.push(name);
        } else if (
          name.toLowerCase().includes("door") ||
          name.toLowerCase().includes("porte")
        ) {
          objectTypes.doors = objectTypes.doors || [];
          objectTypes.doors.push(name);
        } else {
          objectTypes.other = objectTypes.other || [];
          objectTypes.other.push(name);
        }

        // Enable geometry calculations for collisions
        if (object.geometry) {
          object.geometry.computeBoundingBox();
        }
      }
    });

    console.log("3D Model Structure Analysis:");
    console.log("Total objects:", allObjects.length);
    console.log("Object types found:", objectTypes);
    console.log("All objects:", allObjects);

    setModelInfo({
      objectCount: allObjects.length,
      types: objectTypes,
      allObjects: allObjects,
    });
  }, [scene]);

  // Clone and return the scene with your specified transforms
  return (
    <>
      <primitive
        object={scene.clone()}
        position={position}
        rotation={rotation}
        scale={scale}
      />

      {/* Debug overlay to display model info */}
      {showDebug && Object.keys(modelInfo).length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            maxWidth: "500px",
            maxHeight: "300px",
            overflow: "auto",
            fontSize: "12px",
            zIndex: 1000,
          }}
        >
          <h3>Model Structure Analysis</h3>
          <p>Total objects: {modelInfo.objectCount}</p>

          <h4>Walls ({modelInfo.types?.walls?.length || 0}):</h4>
          <ul>
            {modelInfo.types?.walls?.map((name, i) => (
              <li key={`wall-${i}`}>{name}</li>
            ))}
          </ul>

          <h4>Floors ({modelInfo.types?.floors?.length || 0}):</h4>
          <ul>
            {modelInfo.types?.floors?.map((name, i) => (
              <li key={`floor-${i}`}>{name}</li>
            ))}
          </ul>

          <h4>Ceilings ({modelInfo.types?.ceilings?.length || 0}):</h4>
          <ul>
            {modelInfo.types?.ceilings?.map((name, i) => (
              <li key={`ceiling-${i}`}>{name}</li>
            ))}
          </ul>

          <h4>Doors ({modelInfo.types?.doors?.length || 0}):</h4>
          <ul>
            {modelInfo.types?.doors?.map((name, i) => (
              <li key={`door-${i}`}>{name}</li>
            ))}
          </ul>

          <button
            onClick={() => setShowDebug(false)}
            style={{
              background: "#f44336",
              border: "none",
              color: "white",
              padding: "5px 10px",
              borderRadius: "3px",
              marginTop: "10px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
