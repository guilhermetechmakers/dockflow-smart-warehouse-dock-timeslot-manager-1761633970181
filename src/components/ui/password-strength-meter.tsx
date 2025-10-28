import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface StrengthLevel {
  score: number;
  label: string;
  color: string;
  bgColor: string;
}

const strengthLevels: StrengthLevel[] = [
  { score: 0, label: 'Very Weak', color: 'text-red-600', bgColor: 'bg-red-500' },
  { score: 1, label: 'Weak', color: 'text-red-500', bgColor: 'bg-red-400' },
  { score: 2, label: 'Fair', color: 'text-yellow-500', bgColor: 'bg-yellow-400' },
  { score: 3, label: 'Good', color: 'text-blue-500', bgColor: 'bg-blue-400' },
  { score: 4, label: 'Strong', color: 'text-green-500', bgColor: 'bg-green-400' },
];

const calculatePasswordStrength = (password: string): number => {
  let score = 0;
  
  if (password.length === 0) return 0;
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  // Bonus for very long passwords
  if (password.length >= 16) score++;
  
  return Math.min(score, 4);
};

const getStrengthRequirements = (password: string) => {
  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'One lowercase letter', met: /[a-z]/.test(password) },
    { text: 'One number', met: /\d/.test(password) },
  ];
  
  return requirements;
};

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = calculatePasswordStrength(password);
  const currentLevel = strengthLevels[strength];
  const requirements = getStrengthRequirements(password);
  const metRequirements = requirements.filter(req => req.met).length;
  
  if (!password) return null;
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Password strength</span>
          <span className={cn('font-medium', currentLevel.color)}>
            {currentLevel.label}
          </span>
        </div>
        
        <div className="flex space-x-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 flex-1 rounded-full transition-all duration-300',
                i < strength
                  ? currentLevel.bgColor
                  : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Requirements List */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div
              className={cn(
                'h-4 w-4 rounded-full flex items-center justify-center transition-colors duration-200',
                req.met
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              {req.met && (
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={cn(
                'transition-colors duration-200',
                req.met ? 'text-green-700' : 'text-gray-500'
              )}
            >
              {req.text}
            </span>
          </div>
        ))}
      </div>
      
      {/* Progress Summary */}
      <div className="text-xs text-gray-500">
        {metRequirements} of {requirements.length} requirements met
      </div>
    </div>
  );
}