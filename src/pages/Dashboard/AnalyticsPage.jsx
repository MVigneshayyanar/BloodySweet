import { useState, useEffect } from 'react';
import { donorService } from '../../services/donorService';
import { bloodRequestService } from '../../services/bloodRequestService';
import { UsersIcon, SignalIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1'];

export default function AnalyticsPage() {
    const [donors, setDonors] = useState([]);
    const [requests, setRequests] = useState([]);
    // Removed loading state to show UI immediately (as requested)

    useEffect(() => {
        async function fetchData() {
            // Parallel fetch for speed
            const [donorsData, requestsData] = await Promise.all([
                donorService.getAllDonors(),
                bloodRequestService.getAllRequests()
            ]);

            setDonors(donorsData);
            setRequests(requestsData);
        }
        fetchData();
    }, []);

    // --- Process Data for Charts ---

    // 1. Blood Group Distribution
    const bloodGroupData = donors.reduce((acc, donor) => {
        const group = donor.bloodGroup || 'Unknown';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(bloodGroupData).map(key => ({
        name: key,
        value: bloodGroupData[key]
    }));

    // 2. Request Status Overview
    // Initialize with 0s to ensure chart renders even if empty
    const statusCounts = { 'pending': 0, 'matching': 0, 'contacting': 0, 'secured': 0, 'awaiting': 0 };

    requests.forEach(req => {
        const status = req.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const requestData = [
        { name: 'Pending', count: statusCounts['pending'] },
        { name: 'Matching', count: statusCounts['matching'] },
        { name: 'Outreach', count: statusCounts['contacting'] },
        { name: 'Secured', count: statusCounts['secured'] },
    ];

    const stats = [
        { name: 'Total Donors', value: donors.length, icon: UsersIcon },
        { name: 'All Requests', value: requests.length, icon: SignalIcon },
        { name: 'Donors Secured', value: statusCounts['secured'], icon: CheckBadgeIcon },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold leading-7 text-gray-900">Analytics Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {stats.map((item) => (
                    <div key={item.name} className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm hover:shadow-md transition-shadow duration-300 sm:p-6 border border-slate-100">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 rounded-lg bg-rose-50 p-3">
                                <item.icon className="h-6 w-6 text-rose-600" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-slate-500">{item.name}</dt>
                                <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{item.value}</dd>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Blood Group Distribution */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Donor Distribution by Blood Group</h3>
                    <div className="h-80">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No donor data available</div>
                        )}
                    </div>
                </div>

                {/* Requests Overview */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Request Status Overview</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={requestData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
