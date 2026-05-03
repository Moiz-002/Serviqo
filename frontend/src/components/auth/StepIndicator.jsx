import { User, Briefcase, Lock, ShieldCheck, CheckCircle } from 'lucide-react';

export const StepIndicator = ({ currentStep = 1, completedSteps = [], steps = [] }) => {
  const displaySteps = steps.length > 0 ? steps : [
    { id: 1, label: 'Profile', icon: User },
    { id: 2, label: 'Details', icon: Briefcase },
    { id: 3, label: 'Security', icon: Lock },
    { id: 4, label: 'Verify', icon: ShieldCheck },
  ];

  return (
    <div className="w-full mb-8 sm:mb-12">
      {/* Steps Container */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {displaySteps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;
          const CheckIcon = CheckCircle;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-fg shadow-lg scale-110'
                      : isCompleted
                      ? 'bg-accent text-accent-foreground shadow-md'
                      : 'bg-surface border-2 border-border text-text-tertiary'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                  role="img"
                  aria-label={`Step ${step.id}: ${step.label}. Status: ${
                    isActive ? 'Current' : isCompleted ? 'Completed' : 'Upcoming'
                  }`}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-xs font-semibold uppercase tracking-wide mt-2 ${
                    isActive || isCompleted ? 'text-text-brand' : 'text-text-tertiary'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {idx < displaySteps.length - 1 && (
                <div
                  className={`h-1.5 w-6 sm:w-10 mx-2 sm:mx-3 rounded-full transition-all duration-300 ${
                    isCompleted || completedSteps.includes(step.id + 1)
                      ? 'bg-navy-600 shadow-sm'
                      : 'bg-neutral-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
