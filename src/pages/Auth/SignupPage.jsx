import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ModernInput from '../../components/ui/ModernInput';
import { EnvelopeIcon, LockClosedIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [role, setRole] = useState('individual');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== passwordConfirm) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            const userCredential = await signup(email, password);
            const user = userCredential.user;

            // Save user role to Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: role,
                createdAt: new Date()
            });

            navigate('/dashboard');
        } catch (err) {
            setError('Failed to create an account: ' + err.message);
        }

        setLoading(false);
    }

    return (
        <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-slate-900">
                    Create an Account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg relative text-sm" role="alert">{error}</div>}

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium leading-6 text-slate-700 mb-1 ml-1">
                            I am a...
                        </label>
                        <div className="relative">
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="block w-full rounded-lg border-0 py-4 pl-11 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-600 focus:outline-none sm:text-sm sm:leading-6 appearance-none bg-transparent"
                            >
                                <option value="individual">Individual / Patient (Donor only)</option>
                                <option value="hospital">Hospital</option>
                                <option value="blood_bank">Blood Bank</option>
                                <option value="ngo">NGO</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <UserIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                            </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 ml-1">
                            Only Organizations (Hospital, Blood Bank, NGO) can request blood.
                        </p>
                    </div>

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
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={LockClosedIcon}
                        />
                    </div>

                    <div>
                        <ModernInput
                            id="password-confirm"
                            name="password-confirm"
                            type="password"
                            label="Confirm Password"
                            required
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            icon={ShieldCheckIcon}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-lg bg-rose-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50 transition-colors duration-200"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold leading-6 text-rose-600 hover:text-rose-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
