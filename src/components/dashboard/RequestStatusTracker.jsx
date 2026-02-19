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
        <div className={`w-full ${compact ? 'py-1' : 'py-8 px-2'}`}>
            <div className="relative">
                {/* Connection Line Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />

                {/* Active Progress Line with Glow */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-rose-500 -translate-y-1/2 transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_12px_rgba(244,63,94,0.4)]"
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
                                        ${compact ? 'h-3.5 w-3.5' : 'h-7 w-7 sm:h-9 sm:w-9'} 
                                        ${state === 'complete' ? 'bg-rose-500 border-rose-500 shadow-lg shadow-rose-200' :
                                            state === 'current' ? 'bg-white border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse-slow' :
                                                'bg-white border-slate-200'}`}
                                >
                                    {state === 'complete' && !compact && (
                                        <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    )}
                                    {state === 'current' && !compact && (
                                        <div className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 bg-rose-600 rounded-full animate-pulse" />
                                    )}
                                    {state === 'complete' && compact && (
                                        <div className="h-1.5 w-1.5 bg-white rounded-full" />
                                    )}
                                </div>

                                {/* Label - Smart visibility */}
                                {!compact && (
                                    <span className={`absolute top-full mt-3 text-[9px] sm:text-xs font-bold tracking-tight text-center transition-all duration-300
                                        ${idx === 0 ? 'left-0 translate-x-0' : idx === STEPS.length - 1 ? 'right-0 translate-x-0' : 'left-1/2 -translate-x-1/2'}
                                        ${state === 'upcoming' ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {step.label}
                                    </span>
                                )}
                                {compact && state === 'current' && (
                                    <span className="absolute top-full mt-1.5 text-[8px] font-black text-rose-600 uppercase tracking-tighter whitespace-nowrap bg-rose-50 px-1 rounded">
                                        {step.label.split(' ')[0]}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
            {!compact && <div className="h-6" />}
        </div>
    );
}

// Add these to your CSS or use Tailwind's arbitrary values
// animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
