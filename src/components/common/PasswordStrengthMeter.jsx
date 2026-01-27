import { useMemo } from 'react';
import zxcvbn from 'zxcvbn';

const PasswordStrengthMeter = ({ password }) => {
  const analysis = useMemo(() => {
    if (!password) {
      return null;
    }
    return zxcvbn(password);
  }, [password]);

  if (!password) {
    return null;
  }

  const score = analysis.score; // 0-4
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = {
    0: 'bg-red-500',
    1: 'bg-orange-500',
    2: 'bg-yellow-500',
    3: 'bg-blue-500',
    4: 'bg-green-500',
  };
  const textColors = {
    0: 'text-red-600',
    1: 'text-orange-600',
    2: 'text-yellow-600',
    3: 'text-blue-600',
    4: 'text-green-600',
  };

  // Password requirements checklist
  const requirements = [
    { label: 'At least 12 characters', met: password.length >= 12 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-3 space-y-2">
      {/* Strength bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Password Strength:</span>
          <span className={`text-sm font-semibold ${textColors[score]}`}>
            {labels[score]}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors[score]} transition-all duration-300 ease-out`}
            style={{ width: `${((score + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center text-xs">
            {req.met ? (
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className={req.met ? 'text-gray-700' : 'text-gray-500'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {/* Suggestions from zxcvbn */}
      {analysis.feedback && analysis.feedback.suggestions.length > 0 && score < 3 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p className="font-semibold text-yellow-800 mb-1">Suggestions:</p>
          <ul className="list-disc list-inside text-yellow-700 space-y-1">
            {analysis.feedback.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
