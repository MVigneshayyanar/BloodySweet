import { forwardRef } from 'react';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const ModernInput = forwardRef(({
    label,
    id,
    type = 'text',
    error,
    icon: Icon,
    className,
    ...props
}, ref) => {
    return (
        <div className={classNames("relative", className)}>
            <div className="relative">
                <input
                    type={type}
                    id={id}
                    ref={ref}
                    className={classNames(
                        "peer block w-full rounded-lg border-0 bg-transparent py-4 pl-4 pr-4 text-slate-900 ring-1 ring-inset focus:ring-2 focus:ring-inset focus:outline-none sm:text-sm sm:leading-6 transition-all duration-200",
                        Icon ? "pl-11" : "",
                        error
                            ? "ring-rose-300 focus:ring-rose-500 text-rose-900 placeholder:text-rose-300"
                            : "ring-slate-200 focus:ring-rose-600 placeholder:text-transparent"
                    )}
                    placeholder={label} // Placeholder required for peer-placeholder-shown to work
                    {...props}
                />

                {/* Leading Icon */}
                {Icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Icon className={classNames("h-5 w-5", error ? "text-rose-400" : "text-slate-400 peer-focus:text-rose-600 transition-colors duration-200")} aria-hidden="true" />
                    </div>
                )}

                {/* Floating Label */}
                <label
                    htmlFor={id}
                    className={classNames(
                        "absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-slate-50 px-2 text-sm duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 pointer-events-none",
                        Icon ? "peer-placeholder-shown:left-9 peer-focus:left-2" : "",
                        error ? "text-rose-600" : "text-slate-500 peer-focus:text-rose-600"
                    )}
                >
                    {label}
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-rose-600" id={`${id}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
});

ModernInput.displayName = 'ModernInput';

export default ModernInput;
