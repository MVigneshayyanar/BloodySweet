import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bloodRequestService } from '../../services/bloodRequestService';
import RequestStatusTracker from '../../components/dashboard/RequestStatusTracker';
import ModernInput from '../../components/ui/ModernInput';
import { PlusIcon, UserIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function BloodRequestPage() {
    const { currentUser } = useAuth();
    const [requests, setRequests] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        patientName: '',
        patientPhone: '',
        bloodGroup: 'A+',
        units: 1,
        hospital: '',
        location: '',
        urgency: 'high'
    });
    const [submitting, setSubmitting] = useState(false);

    // Redirect or show message if not authorized
    if (!currentUser || currentUser.role === 'individual') {
        return (
            <div className="text-center py-12">
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Access Denied</h3>
                <p className="mt-1 text-sm text-gray-500">Only authorized organizations can post blood requests.</p>
            </div>
        );
    }

    useEffect(() => {
        if (currentUser) {
            const unsubscribe = bloodRequestService.subscribeToRequests(currentUser.uid, (data) => {
                setRequests(data);
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await bloodRequestService.createRequest({
                ...formData,
                orgId: currentUser.uid,
                orgName: currentUser.email // In a real app, this would be the org name
            });
            setIsFormOpen(false);
            setFormData({
                patientName: '',
                patientPhone: '',
                bloodGroup: 'A+',
                units: 1,
                hospital: '',
                location: '',
                urgency: 'high'
            });
        } catch (error) {
            console.error("Failed to submit request", error);
        }
        setSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Blood Requests
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your outreach campaigns and track real-time status.</p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <button
                        type="button"
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="ml-3 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all duration-200"
                    >
                        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        New Request
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="bg-white shadow-lg sm:rounded-xl p-6 border border-gray-100 ring-1 ring-black/5 animate-fade-in-down">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">New Emergency Request</h3>
                        <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <ModernInput
                                id="patientName"
                                label="Patient Name"
                                required
                                value={formData.patientName}
                                onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                                icon={UserIcon}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <div className="relative">
                                <select
                                    value={formData.bloodGroup}
                                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    className="peer block w-full rounded-lg border-0 bg-transparent py-3 pl-4 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-600 focus:outline-none sm:text-sm sm:leading-6 appearance-none transition-all duration-200"
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                                <label className="absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-slate-500 duration-300 pointer-events-none">
                                    Blood Group
                                </label>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <ModernInput
                                id="patientPhone"
                                label="Patient Phone Number"
                                required
                                value={formData.patientPhone}
                                onChange={e => setFormData({ ...formData, patientPhone: e.target.value })}
                                icon={PhoneIcon}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <ModernInput
                                id="location"
                                label="Hospital / Location"
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                icon={MapPinIcon}
                            />
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['critical', 'high', 'moderate'].map((level) => (
                                    <div
                                        key={level}
                                        onClick={() => setFormData({ ...formData, urgency: level })}
                                        className={`cursor-pointer rounded-lg border p-3 flex items-center justify-center text-sm font-medium uppercase tracking-wide transition-all duration-200 ${formData.urgency === level
                                            ? level === 'critical' ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-500' :
                                                level === 'high' ? 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-500' :
                                                    'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500'
                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {level}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sm:col-span-6 flex justify-end gap-x-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-md bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition-colors"
                            >
                                {submitting ? 'Broadcasting...' : 'Broadcast Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Layout for Requests (Row by Row) */}
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-md border border-gray-200">
                <ul role="list" className="divide-y divide-gray-200">
                    {requests.length === 0 ? (
                        <li className="p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No active requests</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new blood request.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                >
                                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    New Request
                                </button>
                            </div>
                        </li>
                    ) : (
                        requests.map((request) => (
                            <li key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
                                                    <span className="text-lg font-black text-red-600">{request.bloodGroup}</span>
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-medium text-indigo-600">{request.patientName}</p>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${request.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                                                        request.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {request.urgency.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                                    <MapPinIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                                    <span className="truncate">{request.location}</span>
                                                    <span className="mx-2 hidden sm:inline">•</span>
                                                    <span className="hidden sm:inline">
                                                        Posted {new Date(request.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                                            <div className="w-32 sm:w-48 mt-1">
                                                <RequestStatusTracker status={request.status} compact={true} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
