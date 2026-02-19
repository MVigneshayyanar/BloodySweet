import { Link } from 'react-router-dom'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                            Saving Lives Through <span className="text-red-600">Smart Coordination</span>
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-slate-600">
                            Transforming fragmented efforts into a collaborative response network.
                            Reduce donor matching time from 65 minutes to 15 minutes.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                to="/login"
                                className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            >
                                Get Started
                            </Link>
                            <a href="#mission" className="text-sm font-semibold leading-6 text-slate-900">
                                Learn more <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission / Learn More Section */}
            <div id="mission" className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-red-600">Our Mission</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Faster Coordination, More Lives Saved
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            We bridge the gap between hospitals, NGOs, and donors. By automating the outreach process, we ensure that blood requests reach the right donors instantly, reducing the critical time lost in manual phone calls.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                            {[
                                {
                                    name: 'Automated Outreach',
                                    description:
                                        'No more calling lists manually. Our system calls eligible donors automatically via Twilio Voice and SMS.',
                                },
                                {
                                    name: 'Real-time Verification',
                                    description:
                                        'Donors confirm their availability instantly via IVR input, updating the dashboard in real-time.',
                                },
                                {
                                    name: 'Smart Filtering',
                                    description:
                                        'We match requests based on blood group, location, and last donation date to prevent donor fatigue.',
                                },
                                {
                                    name: 'Unified Dashboard',
                                    description:
                                        'Hospitals and NGOs get a single view of all ongoing requests, donor responses, and stock levels.',
                                },
                            ].map((feature) => (
                                <div key={feature.name} className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-gray-900">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        </div>
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}
