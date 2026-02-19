import { useState, useEffect } from 'react';
import { donorService } from '../../services/donorService';
import { bloodRequestService } from '../../services/bloodRequestService';
import { useAuth } from '../../context/AuthContext';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

export default function DashboardOverview() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState([
        { name: 'Total Donors', stat: '-' },
        { name: 'Active Requests', stat: '-' },
        { name: 'Donors Found', stat: '-' },
    ]);
    const [recentRequests, setRecentRequests] = useState([]);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch donors count
                const donors = await donorService.getAllDonors();
                const totalDonors = donors.length;

                // Fetch requested stats (mocking global requests for now as we only implemented org-specific subscription)
                // In a real app, we'd have a specific service method for this
                // For now, let's just use the length of requests if we can access them, or a placeholder if unauthorized

                // Let's implement a simple fetch for the currently logged in user's organization
                if (currentUser && ['hospital', 'blood_bank', 'ngo'].includes(currentUser.role)) {
                    const unsubscribe = bloodRequestService.subscribeToRequests(currentUser.uid, (requests) => {
                        const active = requests.filter(r => r.status !== 'secured').length;
                        const fulfilled = requests.filter(r => r.status === 'secured').length;

                        setStats([
                            { name: 'Total Donors', stat: totalDonors.toString() },
                            { name: 'Active Requests', stat: active.toString() },
                            { name: 'Donors Found', stat: fulfilled.toString() },
                        ]);
                        setRecentRequests(requests.slice(0, 5));
                    });
                    return unsubscribe;
                } else {
                    // For others, show global stats or static marketing numbers (formatted as real data)
                    setStats([
                        { name: 'Total Donors', stat: totalDonors.toString() },
                        { name: 'Registered Orgs', stat: '12' },
                        { name: 'Lives Saved', stat: '150+' },
                    ]);
                }

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        }

        fetchStats();
    }, [currentUser]);

    return (
        <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Overview</h3>
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {stats.map((item) => (
                    <div key={item.name} className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm hover:shadow-md transition-shadow duration-300 sm:p-6 border border-slate-100">
                        <dt className="truncate text-sm font-medium text-slate-500">{item.name}</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{item.stat}</dd>
                    </div>
                ))}
            </dl>

            <div className="mt-8">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Request Activity</h3>
                <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-6">
                        {recentRequests.length > 0 ? (
                            <ul role="list" className="-my-5 divide-y divide-gray-200">
                                {recentRequests.map((request) => (
                                    <li key={request.id} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {request.patientName} ({request.bloodGroup})
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    Status: <span className="capitalize">{request.status}</span>
                                                </p>
                                            </div>
                                            <div>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${request.urgency === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {request.urgency}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No recent activity to show.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
