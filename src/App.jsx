// src/App.jsx
import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import HouseModel from "./pages/HouseModel";
import TourCamera from "./pages/TourCamera";
import Hotspot from "./pages/Hotspot";
import WaypointEditor from "./pages/WaypointEditor";

export default function App() {
  // State for the tour
  const [showModal, setShowModal] = useState(false);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);

  // State for editor
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [waypoints, setWaypoints] = useState([
    {
      position: [12.36, 5.34, -14.79],
      lookAt: [-9.04, -0.63, -13.08],
      name: "Exterior View",
    },
    {
      position: [-10.54, 3.76, -29.27],
      lookAt: [-9.29, 0.03, -3.57],
      name: "Back",
    },
    {
      position: [-11.79, 2.01, 27],
      lookAt: [-11.78, 1.99, 26.61],
      name: "Kitchen",
    },
    {
      position: [0, 1.6, -10],
      lookAt: [0, 1, 0],
      name: "Dining Room",
    },

    {
      position: [-15.19, 5.98, 83.66],
      lookAt: [0, 1, 0],
      name: "Front Door",
    },
    {
      position: [0, 1.6, 2],
      lookAt: [0, 1.6, 0],
      name: "Entrance Hall",
    },
    {
      position: [-28.04, 5.46, 30.67],
      lookAt: [-28.04, 5.42, 30.58],
      name: "Picina",
    },
  ]);

  // Define hotspots (clickable points in your 3D scene)
  const [hotspots, setHotspots] = useState([
    {
      position: [-0.72, 2.12, -19.96],
      label: "Go to Front Door",
      waypointIndex: 1,
    },
    {
      position: [2, 1, 0],
      label: "Go to Living Room",
      waypointIndex: 3,
    },
  ]);

  // Save waypoints to localStorage
  useEffect(() => {
    if (waypoints.length > 0) {
      localStorage.setItem("tourWaypoints", JSON.stringify(waypoints));
    }
  }, [waypoints]);

  // Load waypoints from localStorage
  useEffect(() => {
    const savedWaypoints = localStorage.getItem("tourWaypoints");
    if (savedWaypoints) {
      try {
        setWaypoints(JSON.parse(savedWaypoints));
      } catch (e) {
        console.error("Error loading saved waypoints:", e);
      }
    }
  }, []);

  // Navigation functions
  const nextWaypoint = () => {
    setCurrentWaypoint((prev) => (prev + 1) % waypoints.length);
  };

  const prevWaypoint = () => {
    setCurrentWaypoint(
      (prev) => (prev - 1 + waypoints.length) % waypoints.length
    );
  };

  const toggleAutoPlay = () => {
    setAutoPlayEnabled(!autoPlayEnabled);
  };

  const toggleControls = () => {
    setControlsEnabled(!controlsEnabled);
  };

  // Editor functions
  const toggleEditorMode = () => {
    setIsEditorMode(!isEditorMode);
    setAutoPlayEnabled(false);
    setEditorVisible(false);
  };

  const handleSaveWaypoint = (newWaypoint) => {
    setWaypoints([...waypoints, newWaypoint]);
    setEditorVisible(false);
  };

  const removeWaypoint = (index) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
    if (currentWaypoint >= newWaypoints.length) {
      setCurrentWaypoint(Math.max(0, newWaypoints.length - 1));
    }
  };

  // Export waypoints as JSON
  const exportWaypoints = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(waypoints, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tour-waypoints.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="p-6 text-center">
      <div className="mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 mr-3"
        >
          Start Virtual Tour
        </button>

        <button
          onClick={() => {
            setShowModal(true);
            setIsEditorMode(true);
          }}
          className="px-5 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          Edit Tour Waypoints
        </button>
      </div>

      {waypoints.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          {waypoints.length} waypoints configured
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div
            className="relative bg-gray-900 rounded-lg w-4/5 max-w-5xl h-4/5 max-h-[700px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-white text-2xl z-10 hover:text-gray-300"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            {/* Mode indicator */}
            {isEditorMode && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-purple-600 text-white rounded-md">
                Editor Mode
              </div>
            )}

            {/* Waypoint name display */}
            {!isEditorMode && waypoints.length > 0 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="px-4 py-2 bg-gray-800 bg-opacity-80 text-white rounded-md">
                  {waypoints[currentWaypoint].name}
                </div>
              </div>
            )}

            {/* Tour controls */}
            {!isEditorMode && waypoints.length > 0 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-4">
                <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                  onClick={prevWaypoint}
                >
                  Previous
                </button>
                <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                  onClick={toggleAutoPlay}
                >
                  {autoPlayEnabled ? "Pause Tour" : "Auto Play"}
                </button>
                <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                  onClick={nextWaypoint}
                >
                  Next
                </button>
                <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                  onClick={toggleControls}
                >
                  {controlsEnabled ? "Lock Camera" : "Free Camera"}
                </button>
              </div>
            )}

            {/* Editor controls */}
            {isEditorMode && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-4">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  onClick={() => setEditorVisible(true)}
                >
                  Add Waypoint
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={exportWaypoints}
                >
                  Export Waypoints
                </button>
                <button
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  {showHelp ? "Hide Controls" : "Show Controls"}
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  onClick={toggleEditorMode}
                >
                  Exit Editor Mode
                </button>
              </div>
            )}

            {/* Waypoint thumbnails/editor */}
            <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 max-h-[calc(100%-2rem)] overflow-y-auto">
              {waypoints.map((waypoint, index) => (
                <div
                  key={index}
                  className={`w-44 rounded-md ${
                    currentWaypoint === index
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-200"
                  } flex items-center`}
                >
                  <button
                    className="flex-1 p-2 text-left truncate"
                    onClick={() => setCurrentWaypoint(index)}
                    title={waypoint.name}
                  >
                    {index + 1}. {waypoint.name}
                  </button>
                  {isEditorMode && (
                    <button
                      className="px-2 text-red-400 hover:text-red-300"
                      onClick={() => removeWaypoint(index)}
                      title="Remove waypoint"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 3D Scene */}
            <div className="w-full h-full">
              <Canvas>
                <TourCamera
                  waypoint={
                    waypoints[currentWaypoint] || {
                      position: [0, 1.6, 5],
                      lookAt: [0, 1, 0],
                    }
                  }
                  controlsEnabled={isEditorMode || controlsEnabled}
                  onWaypointReached={() => {
                    if (autoPlayEnabled) {
                      setTimeout(nextWaypoint, 3000); // Auto advance after 3s
                    }
                  }}
                />
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Environment preset="sunset" />

                {/* The house model */}
                <HouseModel
                  position={[0, 0, 0]}
                  scale={1.5}
                  rotation={[0, 0, 0]}
                />

                {/* Hotspots - only shown when not in auto-play and not in editor mode */}
                {!autoPlayEnabled &&
                  !isEditorMode &&
                  hotspots.map((hotspot, i) => (
                    <Hotspot
                      key={i}
                      position={hotspot.position}
                      label={hotspot.label}
                      onClick={() => setCurrentWaypoint(hotspot.waypointIndex)}
                    />
                  ))}

                {/* Waypoint Editor */}
                <WaypointEditor
                  isActive={isEditorMode && editorVisible}
                  onSaveWaypoint={handleSaveWaypoint}
                  onCancel={() => setEditorVisible(false)}
                />
              </Canvas>
            </div>

            {/* Keyboard Controls Help Panel */}
            {showHelp && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-80 text-white p-4 rounded-lg z-20">
                <h3 className="font-bold text-lg mb-2">Keyboard Controls</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Movement:</div>
                  <div>WASD or Arrow Keys</div>

                  <div>Up/Down:</div>
                  <div>Q / E keys</div>

                  <div>Look around:</div>
                  <div>Hold and drag mouse</div>

                  <div>Zoom:</div>
                  <div>Mouse wheel</div>

                  <div>Adjust speed:</div>
                  <div>+ / - keys</div>

                  <div>Toggle position mode:</div>
                  <div>Press M key</div>

                  <div>Log current position:</div>
                  <div>Press P key</div>
                </div>
                <div className="mt-3 text-xs">
                  <p>
                    Tip: Press 'M' to enable keyboard movement. Press 'P' to log
                    the current position to the console.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
