'use client';

import { CheckCircle2 } from 'lucide-react';

const ProgressStepper = ({ steps, currentStep, completedSteps }) => {
  return (
    <div className="w-full">
      <div className="flex items-start justify-between relative">
        {/* Connecting lines background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 flex">
          {steps.map((_, index) => {
            if (index === steps.length - 1) return null;
            
            const isCompleted = completedSteps.includes(index + 1);
            const lineClass = isCompleted 
              ? 'bg-cyan-500' 
              : 'bg-neutral-200';
              
            return (
              <div
                key={`line-${index}`}
                className={`flex-1 h-0.5 ${lineClass} transition-colors duration-300`}
              />
            );
          })}
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = completedSteps.includes(stepNumber);
          
          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
              role="img"
              aria-label={`Step ${stepNumber} of ${steps.length}: ${step.label}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Circle */}
              <div
                className={`
                  flex items-center justify-center rounded-full transition-all duration-300
                  ${isCompleted 
                    ? 'w-11 h-11 bg-cyan-500' 
                    : isActive 
                    ? 'w-11 h-11 bg-navy-600 animate-pulse' 
                    : 'w-11 h-11 bg-white border-2 border-neutral-200'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                ) : isActive ? (
                  step.icon && <step.icon className="w-5 h-5 text-white" strokeWidth={2} />
                ) : (
                  step.icon && <step.icon className="w-5 h-5 text-neutral-400" strokeWidth={2} />
                )}
              </div>

              {/* Label */}
              <div className="mt-3 text-center">
                <p
                  className={`
                    text-xs font-medium uppercase tracking-wider transition-colors duration-300
                    ${isCompleted 
                      ? 'text-cyan-600' 
                      : isActive 
                      ? 'text-navy-600 font-semibold' 
                      : 'text-neutral-400'
                    }
                  `}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile-only current step info */}
      <div className="md:hidden mt-6 text-center">
        <p className="text-sm text-text-secondary">
          Step {currentStep} of {steps.length}
        </p>
      </div>
    </div>
  );
};

export default ProgressStepper;
