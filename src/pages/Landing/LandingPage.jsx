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
        </div>
    )
}
