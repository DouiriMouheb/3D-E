// src/components/CollisionHandler.jsx
import { useEffect, useRef } from "react";
import {
  Vector3,
  Raycaster,
  Box3,
  Object3D,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} from "three";
import { useThree, useFrame } from "@react-three/fiber";

export default function CollisionHandler({
  active = true,
  collisionDistance = 4.5, // Increased from 3.0 to 4.5 for even stronger prevention
  floorClippingPrevention = true,
  children,
}) {
  const { scene, camera } = useThree();
  const raycastRef = useRef(new Raycaster());
  const previousPosition = useRef(new Vector3());
  const boundingBoxes = useRef([]);
  const isInitialized = useRef(false);
  const controlsRef = useRef(null);
  const frameCount = useRef(0);
  const originalCameraY = useRef(null);
  const maxCameraY = useRef(null);
  const invisibleWalls = useRef([]);

  // Add invisible walls, floors and ceiling
  useEffect(() => {
    if (!active) return;

    // Wait until scene is loaded
    setTimeout(() => {
      // Create invisible walls to prevent going through red walls or any thin objects
      const createInvisibleWalls = () => {
        // Clean up any previously created walls
        invisibleWalls.current.forEach((wall) => {
          scene.remove(wall);
        });
        invisibleWalls.current = [];

        console.log("Creating invisible protection walls...");

        // Helper function to add invisible wall
        const addWall = (position, size, name) => {
          const wallGeometry = new BoxGeometry(size[0], size[1], size[2]);
          const wallMaterial = new MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.0, // Completely invisible
            depthWrite: false, // Don't affect depth buffer
          });
          const wall = new Mesh(wallGeometry, wallMaterial);
          wall.position.set(position[0], position[1], position[2]);
          wall.name = name || "invisibleWall";
          wall.userData = { isCollider: true };
          scene.add(wall);
          invisibleWalls.current.push(wall);
          console.log(
            `Created invisible wall: ${name} at position ${position} with size ${size}`
          );
          return wall;
        };

        // Create walls to specifically protect red walls and other thin structures

        // Left wall protection
        addWall([-85, 10, 30], [5, 20, 60], "leftWallProtection");

        // Right wall protection
        addWall([50, 10, 20], [5, 20, 60], "rightWallProtection");

        // Front wall protection
        addWall([-15, 10, 85], [100, 20, 5], "frontWallProtection");

        // Back wall protection
        addWall([-15, 10, -35], [100, 20, 5], "backWallProtection");

        // Create ceiling protection
        addWall([0, 20, 0], [200, 2, 200], "ceilingProtection");
      };

      // Store original floor height value (minimum camera Y position)
      if (camera && camera.position) {
        originalCameraY.current = camera.position.y - 1.0; // Allow 1 unit below current camera
        maxCameraY.current = camera.position.y + 15.0; // Set maximum height (ceiling)
        console.log(
          `Setting floor height limits: min=${originalCameraY.current}, max=${maxCameraY.current}`
        );
      }

      // Create the invisible walls
      createInvisibleWalls();

      // Update collision boxes
      setTimeout(() => {
        if (isInitialized.current) {
          // Reinitialize collision detection to include the new invisible walls
          isInitialized.current = false;
          initializeCollisionSystem();
        }
      }, 500);
    }, 1500);

    return () => {
      // Clean up invisible walls
      invisibleWalls.current.forEach((wall) => {
        scene.remove(wall);
      });
    };
  }, [scene, active, floorClippingPrevention, camera]);

  // Initialize collision system
  const initializeCollisionSystem = () => {
    if (isInitialized.current) return;

    console.log("Initializing enhanced collision system...");

    // Collection of potential collision objects
    const colliders = [];

    // Find all meshes in the scene that could be walls
    scene.traverse((object) => {
      if (object.isMesh) {
        // Skip very small objects (they're probably not walls)
        if (object.geometry && object.geometry.boundingBox) {
          const size = new Vector3();
          object.geometry.boundingBox.getSize(size);

          // Consider objects with a significant dimension
          if (size.x > 1 || size.y > 1 || size.z > 1) {
            console.log(
              `Adding collision object: ${object.name}, size: ${size.x.toFixed(
                2
              )} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`
            );
            colliders.push(object);
          }
        } else if (object.geometry) {
          // If boundingBox doesn't exist, compute it
          object.geometry.computeBoundingBox();
          if (object.geometry.boundingBox) {
            const size = new Vector3();
            object.geometry.boundingBox.getSize(size);

            if (size.x > 1 || size.y > 1 || size.z > 1) {
              console.log(
                `Added collision object after computing bounds: ${object.name}`
              );
              colliders.push(object);
            }
          }
        }
      }

      // Add objects specifically marked as colliders
      if (object.userData && object.userData.isCollider) {
        if (!colliders.includes(object)) {
          console.log(`Adding marked collider: ${object.name}`);
          colliders.push(object);
        }
      }
    });

    // Add more aggressive collision approach if needed
    if (colliders.length < 10) {
      console.log("Adding more collision objects with lower size threshold...");
      scene.traverse((object) => {
        if (object.isMesh && !colliders.includes(object)) {
          // Specifically look for red materials (walls)
          if (object.material && object.material.color) {
            const color = object.material.color;
            // If it's a reddish color, definitely include it
            if (color.r > 0.7 && color.g < 0.3 && color.b < 0.3) {
              console.log(
                `Adding RED colored object as collider: ${object.name}`
              );
              colliders.push(object);
            }
          }

          const worldBox = new Box3().setFromObject(object);
          const size = new Vector3();
          worldBox.getSize(size);

          if (size.x > 0.5 || size.y > 0.5 || size.z > 0.5) {
            console.log(`Adding additional collision object: ${object.name}`);
            colliders.push(object);
          }
        }
      });
    }

    console.log(`Found ${colliders.length} potential collision objects`);

    // Pre-compute bounding boxes for better performance
    boundingBoxes.current = colliders.map((object) => {
      const box = new Box3().setFromObject(object);
      return { object, box };
    });

    isInitialized.current = true;
  };

  // Initialize collision system after delay
  useEffect(() => {
    if (!active) return;

    // Wait a bit for the model to fully load
    const initTimeout = setTimeout(() => {
      initializeCollisionSystem();
    }, 1000);

    return () => clearTimeout(initTimeout);
  }, [scene, active]);

  // Find and reference OrbitControls
  useFrame(() => {
    if (!active) return;

    frameCount.current++;

    // Only search for controls every 30 frames to avoid performance issues
    if (
      frameCount.current < 30 ||
      (controlsRef.current && frameCount.current % 30 !== 0)
    ) {
      return;
    }

    // Find OrbitControls by tag
    scene.traverse((object) => {
      if (object.userData && object.userData.isOrbitControls) {
        controlsRef.current = object;
      }
    });
  });

  // Check if view ray intersects with a wall
  const checkViewRayCollision = (origin, direction, maxDistance) => {
    if (boundingBoxes.current.length === 0 || !isInitialized.current)
      return false;

    // Set up raycaster
    raycastRef.current.set(origin, direction);
    const intersects = raycastRef.current.intersectObjects(
      boundingBoxes.current.map((item) => item.object),
      false
    );

    // If we hit a wall within maxDistance
    if (intersects.length > 0 && intersects[0].distance < maxDistance) {
      return true;
    }

    return false;
  };

  // Run collision detection every frame
  useFrame(() => {
    if (!active || !camera || !isInitialized.current) return;

    // Check for height limits (floor and ceiling)
    if (floorClippingPrevention) {
      // Floor prevention
      if (
        originalCameraY.current !== null &&
        camera.position.y < originalCameraY.current
      ) {
        camera.position.y = originalCameraY.current;
        if (controlsRef.current) {
          controlsRef.current.target.y = Math.max(
            controlsRef.current.target.y,
            originalCameraY.current
          );
          controlsRef.current.update();
        }
      }

      // Ceiling prevention
      if (
        maxCameraY.current !== null &&
        camera.position.y > maxCameraY.current
      ) {
        camera.position.y = maxCameraY.current;
        if (controlsRef.current) {
          controlsRef.current.target.y = Math.min(
            controlsRef.current.target.y,
            maxCameraY.current
          );
          controlsRef.current.update();
        }
      }
    }

    // Store current position for reverting if collision
    previousPosition.current.copy(camera.position);

    // Number of rays to cast in each direction
    const numRays = 12; // More rays = better detection but more processing

    // Check for collisions with a cone of rays in the viewing direction
    for (let i = 0; i < numRays; i++) {
      // Create slightly varied directions around the main view direction
      const lookDirection = new Vector3(0, 0, -1);
      lookDirection.applyQuaternion(camera.quaternion);

      // Add some variation for wider coverage
      if (i > 0) {
        const angle = (i * Math.PI * 2) / numRays;
        const spreadAmount = 0.3; // How wide to spread the rays
        lookDirection.x += Math.cos(angle) * spreadAmount;
        lookDirection.y += Math.sin(angle) * spreadAmount;
        lookDirection.normalize();
      }

      // Check if this ray collides with a wall
      if (
        checkViewRayCollision(
          camera.position,
          lookDirection,
          collisionDistance * 3
        )
      ) {
        // If looking through a wall, revert camera position
        camera.position.copy(previousPosition.current);

        // If we have orbit controls, update them
        if (controlsRef.current) {
          controlsRef.current.update();
        }

        break;
      }
    }

    // Check for collisions in all directions around the camera
    const directions = [
      new Vector3(1, 0, 0), // Right
      new Vector3(-1, 0, 0), // Left
      new Vector3(0, 1, 0), // Up
      new Vector3(0, -1, 0), // Down
      new Vector3(0, 0, 1), // Forward
      new Vector3(0, 0, -1), // Backward

      // Add diagonal directions for better coverage
      new Vector3(1, 0, 1).normalize(), // Forward-Right
      new Vector3(-1, 0, 1).normalize(), // Forward-Left
      new Vector3(1, 0, -1).normalize(), // Backward-Right
      new Vector3(-1, 0, -1).normalize(), // Backward-Left

      // Upper and lower diagonals
      new Vector3(1, 1, 0).normalize(), // Up-Right
      new Vector3(-1, 1, 0).normalize(), // Up-Left
      new Vector3(1, -1, 0).normalize(), // Down-Right
      new Vector3(-1, -1, 0).normalize(), // Down-Left

      // Additional diagonal rays for more coverage
      new Vector3(1, 1, 1).normalize(), // Up-Forward-Right
      new Vector3(-1, 1, 1).normalize(), // Up-Forward-Left
      new Vector3(1, -1, 1).normalize(), // Down-Forward-Right
      new Vector3(-1, -1, 1).normalize(), // Down-Forward-Left
    ];

    for (const direction of directions) {
      if (
        checkViewRayCollision(camera.position, direction, collisionDistance)
      ) {
        // If collision detected, revert camera position
        camera.position.copy(previousPosition.current);

        // If we have orbit controls, update them
        if (controlsRef.current) {
          controlsRef.current.update();
        }

        break;
      }
    }
  });

  // Patch orbit controls to prevent going through walls
  useEffect(() => {
    if (!active) return;

    // Find TourCamera's orbit controls in children
    const patchTimeout = setTimeout(() => {
      scene.traverse((object) => {
        if (
          object.type === "OrbitControls" ||
          (object.userData && object.userData.isOrbitControls)
        ) {
          // Store original update method
          const originalUpdate = object.update;

          // Override update method with collision check
          object.update = function () {
            const oldTarget = this.target.clone();
            const oldPosition = camera.position.clone();

            // Call original update
            originalUpdate.call(this);

            // Height limits
            if (floorClippingPrevention) {
              // Floor
              if (
                originalCameraY.current !== null &&
                camera.position.y < originalCameraY.current
              ) {
                camera.position.y = originalCameraY.current;
                this.target.y = Math.max(
                  this.target.y,
                  originalCameraY.current - 1
                );
              }

              // Ceiling
              if (
                maxCameraY.current !== null &&
                camera.position.y > maxCameraY.current
              ) {
                camera.position.y = maxCameraY.current;
                this.target.y = Math.min(this.target.y, maxCameraY.current + 1);
              }
            }

            // Check if camera is now looking through a wall
            const cameraToTarget = new Vector3()
              .subVectors(this.target, camera.position)
              .normalize();

            if (
              checkViewRayCollision(
                camera.position,
                cameraToTarget,
                camera.position.distanceTo(this.target)
              )
            ) {
              // If looking through a wall, restore previous orbit center and camera position
              this.target.copy(oldTarget);
              camera.position.copy(oldPosition);
              // Re-call update to apply restored positions
              originalUpdate.call(this);
            }
          };

          console.log(
            "Enhanced OrbitControls with advanced collision detection"
          );
        }
      });
    }, 1500); // Longer delay to ensure controls are fully available

    // Clean up on unmount
    return () => {
      clearTimeout(patchTimeout);
    };
  }, [active, scene, camera, floorClippingPrevention]);

  // More aggressive camera matrix update override to prevent wall collisions
  useEffect(() => {
    if (!active || !camera) return;

    // Wait for initialization
    if (!isInitialized.current) {
      const initWaitInterval = setInterval(() => {
        if (isInitialized.current) {
          clearInterval(initWaitInterval);
          setupAggressiveCollision();
        }
      }, 100);

      return () => clearInterval(initWaitInterval);
    } else {
      setupAggressiveCollision();
    }

    function setupAggressiveCollision() {
      // Save original update method
      const originalUpdateMatrixWorld = camera.updateMatrixWorld;

      // Function to check if new position would cause collision
      const wouldCollide = (newPosition) => {
        if (boundingBoxes.current.length === 0) return false;

        // Check height limits
        if (floorClippingPrevention) {
          // Floor
          if (
            originalCameraY.current !== null &&
            newPosition.y < originalCameraY.current
          ) {
            return true;
          }

          // Ceiling
          if (
            maxCameraY.current !== null &&
            newPosition.y > maxCameraY.current
          ) {
            return true;
          }
        }

        // Directions to check - using many more angles for better coverage
        const directions = [
          new Vector3(1, 0, 0), // Right
          new Vector3(-1, 0, 0), // Left
          new Vector3(0, 1, 0), // Up
          new Vector3(0, -1, 0), // Down
          new Vector3(0, 0, 1), // Forward
          new Vector3(0, 0, -1), // Backward

          // Standard diagonals
          new Vector3(1, 0, 1).normalize(), // Forward-Right
          new Vector3(-1, 0, 1).normalize(), // Forward-Left
          new Vector3(1, 0, -1).normalize(), // Backward-Right
          new Vector3(-1, 0, -1).normalize(), // Backward-Left

          // Vertical diagonals
          new Vector3(1, 1, 0).normalize(), // Up-Right
          new Vector3(-1, 1, 0).normalize(), // Up-Left
          new Vector3(1, -1, 0).normalize(), // Down-Right
          new Vector3(-1, -1, 0).normalize(), // Down-Left

          // 3D diagonals
          new Vector3(1, 1, 1).normalize(), // Up-Forward-Right
          new Vector3(-1, 1, 1).normalize(), // Up-Forward-Left
          new Vector3(1, 1, -1).normalize(), // Up-Backward-Right
          new Vector3(-1, 1, -1).normalize(), // Up-Backward-Left
          new Vector3(1, -1, 1).normalize(), // Down-Forward-Right
          new Vector3(-1, -1, 1).normalize(), // Down-Forward-Left
          new Vector3(1, -1, -1).normalize(), // Down-Backward-Right
          new Vector3(-1, -1, -1).normalize(), // Down-Backward-Left
        ];

        // Check in all directions
        for (const direction of directions) {
          raycastRef.current.set(newPosition, direction);
          const intersects = raycastRef.current.intersectObjects(
            boundingBoxes.current.map((item) => item.object),
            false
          );

          // If we're too close to a wall in this direction
          if (
            intersects.length > 0 &&
            intersects[0].distance < collisionDistance
          ) {
            return true;
          }
        }

        return false;
      };

      // Override camera's updateMatrixWorld to include collision detection
      camera.updateMatrixWorld = function (force) {
        // Store current position
        previousPosition.current.copy(this.position);

        // Call original update
        originalUpdateMatrixWorld.call(this, force);

        // Check if we've moved to a colliding position
        if (isInitialized.current && wouldCollide(this.position)) {
          // Revert to previous position
          this.position.copy(previousPosition.current);
          // Update matrix again after position change
          originalUpdateMatrixWorld.call(this, true);
        }
      };

      // Cleanup
      return () => {
        camera.updateMatrixWorld = originalUpdateMatrixWorld;
      };
    }
  }, [
    active,
    camera,
    collisionDistance,
    isInitialized.current,
    floorClippingPrevention,
  ]);

  return children;
}
