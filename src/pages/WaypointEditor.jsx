// src/pages/WaypointEditor.jsx
import { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export default function WaypointEditor({
  onSaveWaypoint,
  onCancel,
  isActive = false,
}) {
  const { camera, controls } = useThree();
  const [waypointName, setWaypointName] = useState("");

  // Get current camera position and target
  const getCurrentPosition = () => {
    return {
      position: [
        parseFloat(camera.position.x.toFixed(2)),
        parseFloat(camera.position.y.toFixed(2)),
        parseFloat(camera.position.z.toFixed(2)),
      ],
      lookAt: [
        parseFloat(controls.target.x.toFixed(2)),
        parseFloat(controls.target.y.toFixed(2)),
        parseFloat(controls.target.z.toFixed(2)),
      ],
      name: waypointName || "New Waypoint",
    };
  };

  const handleSave = () => {
    const waypoint = getCurrentPosition();
    onSaveWaypoint(waypoint);
    setWaypointName("");
  };

  if (!isActive) return null;

  return (
    <Html position={[0, 0, -5]} center>
      <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg w-64">
        <h3 className="text-lg font-bold mb-2">Create Waypoint</h3>
        <p className="text-xs mb-3">
          Position your camera, then save this view as a waypoint.
        </p>

        <div className="mb-3">
          <label className="block text-sm mb-1">Waypoint Name:</label>
          <input
            type="text"
            value={waypointName}
            onChange={(e) => setWaypointName(e.target.value)}
            placeholder="Enter waypoint name"
            className="w-full px-2 py-1 text-black rounded"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex-1"
          >
            Save Waypoint
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </Html>
  );
}
