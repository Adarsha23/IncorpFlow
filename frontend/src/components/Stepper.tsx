import React from 'react';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="stepper">
      {steps.map((_, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div 
            key={index} 
            className={`step-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`} 
          />
        );
      })}
    </div>
  );
};
