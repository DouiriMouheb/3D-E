// src/pages/TourCamera.jsx
import { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls, Html } from "@react-three/drei";
import { Vector3 } from "three";
import gsap from "gsap";

export default function TourCamera({
  waypoint,
  controlsEnabled = true,
  onWaypointReached,
}) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const animationRef = useRef(null);
  const [isPositionMode, setIsPositionMode] = useState(false);

  // Movement state
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const [moveUp, setMoveUp] = useState(false);
  const [moveDown, setMoveDown] = useState(false);
  const [moveSpeed, setMoveSpeed] = useState(0.5);

  // Mark orbit controls for identification by CollisionHandler - run every frame
  useFrame(() => {
    // Safe check to ensure controls are initialized
    if (controlsRef.current && !controlsRef.current.userData) {
      controlsRef.current.userData = {};
    }

    if (controlsRef.current && !controlsRef.current.userData.isOrbitControls) {
      controlsRef.current.userData.isOrbitControls = true;
    }
  });

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Movement keys
      if (e.key === "w" || e.key === "ArrowUp") setMoveForward(true);
      if (e.key === "s" || e.key === "ArrowDown") setMoveBackward(true);
      if (e.key === "a" || e.key === "ArrowLeft") setMoveLeft(true);
      if (e.key === "d" || e.key === "ArrowRight") setMoveRight(true);
      if (e.key === "e") setMoveUp(true);
      if (e.key === "q") setMoveDown(true);

      // Toggle position mode with 'm'
      if (e.key === "m") {
        setIsPositionMode((prev) => !prev);
        console.log("Position mode toggled:", !isPositionMode);
      }

      // Log position with 'p'
      if (e.key === "p") {
        logCameraPosition();
      }

      // Speed adjustments
      if (e.key === "+") {
        setMoveSpeed((prev) => Math.min(prev + 0.1, 2.0));
        console.log("Speed increased:", moveSpeed.toFixed(1));
      }
      if (e.key === "-") {
        setMoveSpeed((prev) => Math.max(prev - 0.1, 0.1));
        console.log("Speed decreased:", moveSpeed.toFixed(1));
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "w" || e.key === "ArrowUp") setMoveForward(false);
      if (e.key === "s" || e.key === "ArrowDown") setMoveBackward(false);
      if (e.key === "a" || e.key === "ArrowLeft") setMoveLeft(false);
      if (e.key === "d" || e.key === "ArrowRight") setMoveRight(false);
      if (e.key === "e") setMoveUp(false);
      if (e.key === "q") setMoveDown(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPositionMode, moveSpeed]);

  // Process movement each frame
  useFrame(() => {
    if (!isPositionMode || !controlsRef.current) return;

    const forward = new Vector3();
    const right = new Vector3();
    const moveAmount = moveSpeed;

    // Calculate forward direction (from camera to target)
    forward.subVectors(controlsRef.current.target, camera.position).normalize();

    // Calculate right direction
    right.crossVectors(new Vector3(0, 1, 0), forward).normalize();

    // Apply movements - allow collision handler to revert if needed
    if (moveForward) {
      // Move both camera and target forward
      camera.position.addScaledVector(forward, moveAmount);
      controlsRef.current.target.addScaledVector(forward, moveAmount);
    }

    if (moveBackward) {
      camera.position.addScaledVector(forward, -moveAmount);
      controlsRef.current.target.addScaledVector(forward, -moveAmount);
    }

    if (moveLeft) {
      camera.position.addScaledVector(right, -moveAmount);
      controlsRef.current.target.addScaledVector(right, -moveAmount);
    }

    if (moveRight) {
      camera.position.addScaledVector(right, moveAmount);
      controlsRef.current.target.addScaledVector(right, moveAmount);
    }

    if (moveUp) {
      camera.position.y += moveAmount;
      controlsRef.current.target.y += moveAmount;
    }

    if (moveDown) {
      camera.position.y -= moveAmount;
      controlsRef.current.target.y -= moveAmount;
    }

    // Update controls
    controlsRef.current.update();
  });

  const logCameraPosition = () => {
    if (!controlsRef.current) return;

    console.log("Camera position:", [
      parseFloat(camera.position.x.toFixed(2)),
      parseFloat(camera.position.y.toFixed(2)),
      parseFloat(camera.position.z.toFixed(2)),
    ]);
    console.log("Look at target:", [
      parseFloat(controlsRef.current.target.x.toFixed(2)),
      parseFloat(controlsRef.current.target.y.toFixed(2)),
      parseFloat(controlsRef.current.target.z.toFixed(2)),
    ]);
  };

  // Regular camera tracking useEffect
  useEffect(() => {
    if (!controlsRef.current) return;

    // If in position mode, enable controls and return
    if (isPositionMode) {
      controlsRef.current.enabled = true;
      controlsRef.current.enableZoom = true; // Enable zoom in position mode
      return;
    }

    // Update controls enabled state
    controlsRef.current.enabled = controlsEnabled;
    controlsRef.current.enableZoom = false; // Disable zoom in viewing mode

    // Create vectors from waypoint data
    const targetPosition = new Vector3(...waypoint.position);
    const targetLookAt = new Vector3(...waypoint.lookAt);

    // Kill any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }

    // Create animation timeline
    animationRef.current = gsap.timeline({
      onComplete: () => {
        if (onWaypointReached) onWaypointReached();
      },
    });

    // Animate camera position
    animationRef.current.to(
      camera.position,
      {
        duration: 1.5,
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        ease: "power2.inOut",
      },
      0
    );

    // Animate orbit controls target (where camera looks)
    animationRef.current.to(
      controlsRef.current.target,
      {
        duration: 1.5,
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        ease: "power2.inOut",
        onUpdate: () => controlsRef.current.update(),
      },
      0
    );

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [waypoint, camera, controlsEnabled, onWaypointReached, isPositionMode]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 10]} fov={60} />
      <OrbitControls
        ref={controlsRef}
        target={[0, 1.6, 0]}
        enableDamping
        dampingFactor={0.1}
        enableZoom={isPositionMode} // Enable zoom only in position mode
        minDistance={0.5}
        maxDistance={100}
        // Add stronger constraints
        maxPolarAngle={Math.PI - 0.2} // More limited looking down
        minPolarAngle={0.1} // Prevent looking straight up
        screenSpacePanning={true} // More natural panning
      />

      {/* Position mode indicator */}
      {isPositionMode && (
        <Html position={[0, 0, -5]} center>
          <div className="bg-red-500 text-white px-3 py-1 rounded-lg opacity-80">
            <div className="mb-1">Position Mode: ON (Free Navigation)</div>
            <div className="text-xs mb-2">
              WASD/Arrows: Move • Q/E: Up/Down • +/-: Speed • Mouse: Look
            </div>
            <div className="text-xs mb-2">
              Zoom: Mouse Wheel • Look: Click and Drag
            </div>
            <button
              className="bg-white text-red-500 px-2 py-1 rounded text-sm"
              onClick={logCameraPosition}
            >
              Log Position
            </button>
          </div>
        </Html>
      )}
    </>
  );
}
