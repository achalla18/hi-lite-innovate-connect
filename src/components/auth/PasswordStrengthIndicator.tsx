import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  onStrengthChange: (isStrong: boolean) => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p) => /\d/.test(p) },
  { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function PasswordStrengthIndicator({ password, onStrengthChange }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState(0);
  
  useEffect(() => {
    const passedRequirements = requirements.filter(req => req.test(password)).length;
    setStrength(passedRequirements);
    onStrengthChange(passedRequirements >= 4); // At least 4 out of 5 requirements
  }, [password, onStrengthChange]);

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${getStrengthColor().replace('bg-', 'text-')}`}>
          {getStrengthText()}
        </span>
      </div>
      
      <div className="space-y-1">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <div key={index} className="flex items-center space-x-2 text-xs">
              {passed ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-gray-400" />
              )}
              <span className={passed ? "text-green-600" : "text-gray-500"}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}