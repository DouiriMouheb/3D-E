// src/App.jsx
import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import HouseModel from "./pages/HouseModel";
import TourCamera from "./pages/TourCamera";
import Hotspot from "./pages/Hotspot";
import WaypointEditor from "./pages/WaypointEditor";
// Import the CollisionHandler
import CollisionHandler from "./pages/CollisionHandler";

export default function App() {
  // State for the tour
  const [showModal, setShowModal] = useState(false);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);

  // Add tempWaypoint state for custom hotspot navigation
  const [tempWaypoint, setTempWaypoint] = useState(null);

  // Add state for collision detection
  const [collisionEnabled, setCollisionEnabled] = useState(true);

  // State for editor
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [waypoints, setWaypoints] = useState([
    {
      position: [-12.8, 3.6, -25.7],
      lookAt: [-13.05, 3.51, -20.67],
      name: "Back",
    },
    {
      position: [42.67, 2.59, 20.21],
      lookAt: [37.64, 2.57, 20.35],
      name: "right",
    },
    {
      position: [-16.51, 4.81, 78.08],
      lookAt: [-16.02, 3.97, 68.11],
      name: "Front",
    },
    {
      position: [-78.48, 3.32, 28.31],
      lookAt: [-57.95, 3.83, 28.68],
      name: "Left ",
    },
    {
      position: [-28.04, 5.46, 30.67],
      lookAt: [-28.04, 5.42, 30.58],
      name: "Picina",
    },
  ]);

  // Define hotspots with both position and lookAt values
  const [hotspots, setHotspots] = useState([
    // Front view hotspot
    {
      position: [-16.51, 3.0, 60.0], // Positioned in front of the house
      lookAt: [-16.02, 3.97, 50.0], // Looking directly at the front of the house
      label: "Go to Front View",
      name: "Front View Hotspot",
    },
    {
      position: [-16.09, 3.75, 46.56], // Positioned in front of the house
      lookAt: [-16.63, 4.61, 42.53], // Looking directly at the front of the house
      label: "Go to Front View 2",
      name: "Front View Hotspot",
    },
    {
      position: [-16.78, 1.65, 36.72], // Positioned in front of the house
      lookAt: [-16.63, 1.25, 32.58], // Looking directly at the front of the house
      label: "Go to Front View 3",
      name: "Front View Hotspot",
    },
    {
      position: [-19.42, 2.12, 24], // Positioned in front of the house
      lookAt: [-15.27, 1.92, 24.22], // Looking directly at the front of the house
      label: "Go to Front View 4",
      name: "Front View Hotspot",
    },
    // Back view hotspot
    {
      position: [-12.8, 2.5, -15.0], // Positioned at the back of the house
      lookAt: [-13.05, 3.51, -10.0], // Looking at the back of the house
      label: "Go to Back View",
      name: "Back View Hotspot",
    },
    // Right view hotspot
    {
      position: [30.0, 2.0, 20.21], // Positioned to the right of the house
      lookAt: [20.0, 2.57, 20.35], // Looking toward the right side
      label: "Go to Right View",
      name: "Right View Hotspot",
    },
    // Left view hotspot
    {
      position: [-60.0, 2.5, 28.31], // Positioned to the left of the house
      lookAt: [-50.0, 3.0, 28.68], // Looking toward the left side
      label: "Go to Left View",
      name: "Left View Hotspot",
    },
    // Picina hotspot
    {
      position: [-28.04, 3.0, 20.0], // Positioned near the pool
      lookAt: [-28.04, 3.0, 25.0], // Looking at the pool
      label: "Go to Pool",
      name: "Pool Hotspot",
    },
  ]);

  // Handle hotspot click with custom position and lookAt
  const handleHotspotClick = (hotspot) => {
    // Create a custom waypoint using the hotspot's position and lookAt values
    const customWaypoint = {
      position: hotspot.position,
      lookAt: hotspot.lookAt,
      name: hotspot.name || hotspot.label,
    };

    // Set the temporary waypoint (this will be used by TourCamera)
    setTempWaypoint(customWaypoint);
  };

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

  // Toggle collision detection
  const toggleCollision = () => {
    setCollisionEnabled(!collisionEnabled);
  };

  // Navigation functions
  const nextWaypoint = () => {
    setTempWaypoint(null); // Clear any temp waypoint
    setCurrentWaypoint((prev) => (prev + 1) % waypoints.length);
  };

  const prevWaypoint = () => {
    setTempWaypoint(null); // Clear any temp waypoint
    setCurrentWaypoint(
      (prev) => (prev - 1 + waypoints.length) % waypoints.length
    );
  };

  const toggleAutoPlay = () => {
    setTempWaypoint(null); // Clear any temp waypoint when toggling autoplay
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
    setTempWaypoint(null); // Clear temp waypoint when entering/exiting editor mode
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

  // Export hotspots as JSON
  const exportHotspots = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(hotspots, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tour-hotspots.json");
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
            {!isEditorMode && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="px-4 py-2 bg-gray-800 bg-opacity-80 text-white rounded-md">
                  {tempWaypoint
                    ? tempWaypoint.name
                    : waypoints[currentWaypoint].name}
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
                {/* Add collision toggle button */}
                <button
                  className={`px-4 py-2 ${
                    collisionEnabled ? "bg-green-600" : "bg-red-600"
                  } text-white rounded-md hover:${
                    collisionEnabled ? "bg-green-700" : "bg-red-700"
                  }`}
                  onClick={toggleCollision}
                >
                  Collision: {collisionEnabled ? "On" : "Off"}
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
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  onClick={exportHotspots}
                >
                  Export Hotspots
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
                    currentWaypoint === index && !tempWaypoint
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-200"
                  } flex items-center`}
                >
                  <button
                    className="flex-1 p-2 text-left truncate"
                    onClick={() => {
                      setCurrentWaypoint(index);
                      setTempWaypoint(null); // Clear temp waypoint when selecting from list
                    }}
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
                {/* Use the ultra-strict CollisionHandler with extreme settings */}
                <CollisionHandler
                  active={collisionEnabled && !isEditorMode}
                  collisionDistance={7.0} // Ultra-high collision distance
                  floorClippingPrevention={true}
                >
                  <TourCamera
                    waypoint={
                      tempWaypoint ||
                      waypoints[currentWaypoint] || {
                        position: [0, 1.6, 5],
                        lookAt: [0, 1, 0],
                      }
                    }
                    controlsEnabled={isEditorMode || controlsEnabled}
                    onWaypointReached={() => {
                      if (autoPlayEnabled) {
                        // Clear temp waypoint after reaching it if in autoplay
                        if (tempWaypoint) {
                          setTempWaypoint(null);
                        }
                        setTimeout(nextWaypoint, 3000); // Auto advance after 3s
                      }
                    }}
                  />

                  {/* Rest of your existing components */}
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
                        onClick={() => handleHotspotClick(hotspot)}
                      />
                    ))}

                  {/* Waypoint Editor */}
                  <WaypointEditor
                    isActive={isEditorMode && editorVisible}
                    onSaveWaypoint={handleSaveWaypoint}
                    onCancel={() => setEditorVisible(false)}
                  />
                </CollisionHandler>
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
                  <div>Mouse wheel (Editor mode only)</div>

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
