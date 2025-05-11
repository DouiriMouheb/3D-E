// src/components/GuidedTourManager.jsx
import { useState, useEffect } from "react";
import { Html } from "@react-three/drei"; // Add this import
import EnhancedHotspot from "../pages/EnhancedHotspot";

export default function GuidedTourManager({
  tourSteps,
  onNavigateToWaypoint,
  isEditorMode = false,
  autoPlayEnabled = false,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tourActive, setTourActive] = useState(false);

  // Start or reset the tour
  const startTour = () => {
    setCurrentStepIndex(0);
    setTourActive(true);
    // Navigate to the first step
    if (tourSteps.length > 0) {
      navigateToStep(0);
    }
  };

  // Navigate to a specific step
  const navigateToStep = (index) => {
    if (index >= 0 && index < tourSteps.length) {
      const step = tourSteps[index];
      // Call the parent handler to navigate the camera
      onNavigateToWaypoint({
        position: step.position,
        lookAt: step.lookAt,
        name: step.label,
      });
      setCurrentStepIndex(index);
    }
  };

  // Advance to the next step
  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < tourSteps.length) {
      navigateToStep(nextIndex);
    } else {
      // Tour completed
      setTourActive(false);
      // You could add a completion callback here
    }
  };

  // Handle clicking on a hotspot
  const handleHotspotClick = (index) => {
    if (index === currentStepIndex) {
      // If clicking the current active step, advance to the next
      goToNextStep();
    } else {
      // Otherwise navigate to the clicked step
      navigateToStep(index);
    }
  };

  return (
    <>
      {/* Tour controls UI */}
      {!isEditorMode && tourSteps.length > 0 && (
        <Html position={[0, -2, -5]} center>
          <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
            {!tourActive ? (
              <button
                onClick={startTour}
                className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600 transition"
              >
                Start Guided Tour
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span>
                  Step {currentStepIndex + 1} of {tourSteps.length}
                </span>
                <button
                  onClick={goToNextStep}
                  className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600 transition"
                  disabled={currentStepIndex >= tourSteps.length - 1}
                >
                  Next Step
                </button>
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Render hotspots */}
      {!isEditorMode &&
        !autoPlayEnabled &&
        tourSteps.map((step, index) => (
          <EnhancedHotspot
            key={index}
            position={step.position}
            label={step.label}
            stepNumber={index + 1}
            isActive={tourActive && index === currentStepIndex}
            onClick={() => handleHotspotClick(index)}
          />
        ))}
    </>
  );
}
