import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'upcoming' | 'current' | 'complete';
}

interface CheckoutStepsProps {
  steps: Step[];
}

export default function CheckoutSteps({ steps }: CheckoutStepsProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={`flex-1 ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {step.status === 'complete' ? (
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                ) : step.status === 'current' ? (
                  <div className="h-10 w-10 rounded-full border-2 border-green-600 bg-white flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">
                      {stepIdx + 1}
                    </span>
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-500">
                      {stepIdx + 1}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.status === 'complete'
                      ? 'text-green-600'
                      : step.status === 'current'
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
            {stepIdx !== steps.length - 1 && (
              <div
                className={`absolute top-5 left-0 -ml-px h-0.5 w-full ${
                  step.status === 'complete' ? 'bg-green-600' : 'bg-gray-300'
                }`}
                aria-hidden="true"
                style={{
                  width: 'calc(100% - 5rem)',
                  marginLeft: '5rem',
                  marginTop: '-1.25rem',
                }}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
