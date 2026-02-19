import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { donorService } from '../../services/donorService';
import OutreachModal from '../../components/dashboard/OutreachModal';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [bloodGroupFilter, setBloodGroupFilter] = useState('');
    const [donors, setDonors] = useState([]);
    const [filteredDonors, setFilteredDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [outreachOpen, setOutreachOpen] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);

    // Fetch all donors initially (or could act as search results)
    useEffect(() => {
        async function fetchDonors() {
            setLoading(true);
            const data = await donorService.getAllDonors();
            setDonors(data);
            setFilteredDonors(data);
            setLoading(false);
        }
        fetchDonors();
    }, []);

    // Handle filtering locally for instant feedback after initial load
    useEffect(() => {
        let results = donors;

        if (bloodGroupFilter) {
            results = results.filter(donor => donor.bloodGroup === bloodGroupFilter);
        }

        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(donor =>
                donor.name?.toLowerCase().includes(lowerQuery) ||
                donor.location?.toLowerCase().includes(lowerQuery)
            );
        }

        setFilteredDonors(results);
    }, [query, bloodGroupFilter, donors]);

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Search Donors (Real Data)
                    </h2>
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <div className="relative rounded-md shadow-sm grow">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                        placeholder="Search by name or location (e.g. 'Anna Nagar')"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <select
                    id="blood-group"
                    name="blood-group"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6 sm:w-48"
                    value={bloodGroupFilter}
                    onChange={(e) => setBloodGroupFilter(e.target.value)}
                >
                    <option value="">All Blood Groups</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Blood Group
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Location
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Last Donation
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="py-4 text-center text-sm text-gray-500">
                                                Loading donors...
                                            </td>
                                        </tr>
                                    ) : filteredDonors.map((person) => (
                                        <tr key={person.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {person.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.bloodGroup}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.location}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${person.status === 'Active'
                                                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                    : 'bg-red-50 text-red-700 ring-red-600/10'
                                                    }`}>
                                                    {person.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.lastDonation}</td>
                                            <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={() => {
                                                        setSelectedDonor(person);
                                                        setOutreachOpen(true);
                                                    }}
                                                >
                                                    Contact<span className="sr-only">, {person.name}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && filteredDonors.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-4 text-center text-sm text-gray-500">
                                                No donors found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <OutreachModal open={outreachOpen} setOpen={setOutreachOpen} donor={selectedDonor} />
                    </div>
                </div>
            </div>
        </div>
    );
}
