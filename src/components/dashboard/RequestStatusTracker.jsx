import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

const STEPS = [
    { id: 'pending', label: 'Request Received' },
    { id: 'matching', label: 'Matching Donors' },
    { id: 'contacting', label: 'Outreach (n8n)' },
    { id: 'awaiting', label: 'Awaiting Response' },
    { id: 'secured', label: 'Donor Secured' }
];

export default function RequestStatusTracker({ status }) {
    // Determine current step index based on status
    const currentStepIndex = STEPS.findIndex(s => s.id === status);
    const isCompleted = status === 'secured';

    return (
        <div className="w-full py-4">
            <nav aria-label="Progress">
                <ol role="list" className="flex items-center">
                    {STEPS.map((step, stepIdx) => {
                        const isComplete = stepIdx < currentStepIndex || isCompleted;
                        const isCurrent = stepIdx === currentStepIndex && !isCompleted;

                        return (
                            <li key={step.label} className={`${stepIdx !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                                {stepIdx !== STEPS.length - 1 && (
                                    <div className="absolute top-4 left-0 -right-8 sm:-right-20 h-0.5 w-full" aria-hidden="true">
                                        <div
                                            className={`h-full transition-all duration-500 ease-in-out ${isComplete ? 'bg-red-600' : 'bg-gray-200'
                                                }`}
                                        />
                                    </div>
                                )}

                                <div className="group relative flex flex-col items-center justify-center">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition duration-500">
                                        {isComplete ? (
                                            <CheckCircleIcon className="h-full w-full text-red-600" aria-hidden="true" />
                                        ) : isCurrent ? (
                                            <span className="relative flex h-8 w-8">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-8 w-8 bg-red-600 items-center justify-center">
                                                    <ClockIcon className="h-5 w-5 text-white animate-pulse" />
                                                </span>
                                            </span>
                                        ) : (
                                            <div className="h-4 w-4 rounded-full bg-gray-200 ring-1 ring-gray-300" />
                                        )}
                                    </span>
                                    <span className={`absolute top-10 w-32 text-center text-xs font-medium ${isCurrent ? 'text-red-600' : isComplete ? 'text-gray-900' : 'text-gray-500'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </nav>
            <div className="h-8"></div> {/* Spacer for labels */}
        </div>
    );
}
