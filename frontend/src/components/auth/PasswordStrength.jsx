import { CheckCircle, Circle } from 'lucide-react';

const REQUIREMENTS = [
  { id: 1, label: 'At least 8 characters', check: (pwd) => pwd.length >= 8 },
  { id: 2, label: 'One uppercase letter', check: (pwd) => /[A-Z]/.test(pwd) },
  { id: 3, label: 'One number', check: (pwd) => /[0-9]/.test(pwd) },
  { id: 4, label: 'One special character', check: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
];

export const PasswordStrength = ({ password = '' }) => {
  // Calculate strength
  const metRequirements = REQUIREMENTS.filter((req) => req.check(password)).length;
  const strength = metRequirements === 0 ? 0 : Math.ceil((metRequirements / REQUIREMENTS.length) * 4);

  const getStrengthColor = () => {
    switch (strength) {
      case 1:
        return 'bg-error';
      case 2:
        return 'bg-warning';
      case 3:
        return 'bg-accent';
      case 4:
        return 'bg-success';
      default:
        return 'bg-border';
    }
  };

  const getStrengthLabel = () => {
    switch (strength) {
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return 'No password';
    }
  };

  return (
    <div className="space-y-4">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                idx < strength ? getStrengthColor() : 'bg-border'
              }`}
            />
          ))}
        </div>
        {password && (
          <p className="text-xs font-semibold text-text-secondary">
            Strength: <span className={getStrengthColor().replace('bg-', 'text-')}>{getStrengthLabel()}</span>
          </p>
        )}
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        {REQUIREMENTS.map((req) => {
          const isMet = req.check(password);
          return (
            <div key={req.id} className="flex items-center gap-2">
              {isMet ? (
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" strokeWidth={2.5} />
              ) : (
                <Circle className="w-4 h-4 text-border flex-shrink-0" strokeWidth={1.5} />
              )}
              <span className={`text-sm ${isMet ? 'text-text-brand font-medium' : 'text-text-secondary'}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
