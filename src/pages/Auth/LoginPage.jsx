import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ModernInput from '../../components/ui/ModernInput';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to log in: ' + err.message);
        }

        setLoading(false);
    }

    return (
        <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-slate-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg relative text-sm" role="alert">{error}</div>}
                    <div>
                        <ModernInput
                            id="email"
                            name="email"
                            type="email"
                            label="Email address"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={EnvelopeIcon}
                        />
                    </div>

                    <div>
                        <ModernInput
                            id="password"
                            name="password"
                            type="password"
                            label="Password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={LockClosedIcon}
                        />
                        <div className="flex items-center justify-end mt-1">
                            {/* Forgot password link could go here */}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-lg bg-rose-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50 transition-colors duration-200"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-slate-500">
                    Not a member?{' '}
                    <Link to="/signup" className="font-semibold leading-6 text-rose-600 hover:text-rose-500">
                        Register your organization
                    </Link>
                </p>
            </div>
        </div>
    );
}
