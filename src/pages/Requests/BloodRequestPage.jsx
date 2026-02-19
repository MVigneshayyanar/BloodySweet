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
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <button
                        type="button"
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="ml-3 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        New Request
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-200">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Patient Details</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
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
                                    className="peer block w-full rounded-lg border-0 bg-transparent py-4 pl-4 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-600 focus:outline-none sm:text-sm sm:leading-6 appearance-none transition-all duration-200"
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

                        <div className="sm:col-span-2">
                            <div className="relative">
                                <select
                                    value={formData.urgency}
                                    onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                                    className="peer block w-full rounded-lg border-0 bg-transparent py-4 pl-4 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-600 focus:outline-none sm:text-sm sm:leading-6 appearance-none transition-all duration-200"
                                >
                                    <option value="critical">Critical (Immediate)</option>
                                    <option value="high">High (&lt; 24h)</option>
                                    <option value="moderate">Moderate</option>
                                </select>
                                <label className="absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-slate-500 duration-300 pointer-events-none">
                                    Urgency
                                </label>
                            </div>
                        </div>

                        <div className="sm:col-span-6 flex justify-end gap-x-3">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-100">
                    {requests.length === 0 ? (
                        <li className="p-6 text-center text-gray-500">No active requests found.</li>
                    ) : (
                        requests.map((request) => (
                            <li key={request.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="truncate">
                                        <div className="flex items-center text-sm text-red-600 font-bold">
                                            {request.bloodGroup} Request
                                            <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${request.urgency === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {request.urgency.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                            <span className="truncate">{request.patientName}</span>
                                            <span className="mx-2">•</span>
                                            <span className="truncate">{request.location}</span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                                        <p className="text-sm leading-6 text-gray-900">
                                            Posted on <time dateTime={request.createdAt?.toString()}>{new Date(request.createdAt.seconds * 1000).toLocaleDateString()}</time>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <RequestStatusTracker status={request.status} />
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
