import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

const STEPS = [
    { id: 'pending', label: 'Request Received' },
    { id: 'matching', label: 'Matching Donors' },
    { id: 'contacting', label: 'Outreach (n8n)' },
    { id: 'awaiting', label: 'Awaiting Response' },
    { id: 'secured', label: 'Donor Secured' }
];

export default function RequestStatusTracker({ status, compact = false }) {
    // Determine current step index based on status
    const currentStepIndex = STEPS.findIndex(s => s.id === status);
    const isCompleted = status === 'secured';

    // Helper to get step state
    const getStepState = (idx) => {
        if (isCompleted || idx < currentStepIndex) return 'complete';
        if (idx === currentStepIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className={`w-full ${compact ? 'py-1' : 'py-6'}`}>
            <div className="relative">
                {/* Connection Line Background */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 rounded-full" />

                {/* Active Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-red-500 -translate-y-1/2 transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                    style={{
                        width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%`
                    }}
                />

                {/* Points */}
                <ul className="relative flex items-center justify-between w-full">
                    {STEPS.map((step, idx) => {
                        const state = getStepState(idx);

                        return (
                            <li key={step.id} className="relative flex flex-col items-center">
                                {/* Point/Dot */}
                                <div
                                    className={`relative z-10 flex items-center justify-center transition-all duration-500 rounded-full border-2 
                                        ${compact ? 'h-3 w-3' : 'h-6 w-6 sm:h-8 sm:w-8'} 
                                        ${state === 'complete' ? 'bg-red-500 border-red-500 shadow-sm' :
                                            state === 'current' ? 'bg-white border-red-500 animate-pulse-slow' :
                                                'bg-white border-gray-200'}`}
                                >
                                    {state === 'complete' && !compact && (
                                        <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    )}
                                    {state === 'current' && !compact && (
                                        <div className="h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full animate-ping" />
                                    )}
                                </div>

                                {/* Label - Only show if not compact or if it's the current/first/last step for clarity */}
                                {!compact && (
                                    <span className={`absolute top-full mt-2 text-[10px] sm:text-xs font-bold tracking-tight whitespace-nowrap transition-colors duration-300
                                        ${state === 'upcoming' ? 'text-gray-400' : 'text-slate-800'}`}>
                                        {step.label}
                                    </span>
                                )}
                                {compact && state === 'current' && (
                                    <span className="absolute top-full mt-1 text-[8px] font-black text-red-600 uppercase tracking-tighter whitespace-nowrap">
                                        {step.id}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
            {!compact && <div className="h-6" />} {/* Bottom padding for full labels */}
        </div>
    );
}

// Add these to your CSS or use Tailwind's arbitrary values
// animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
