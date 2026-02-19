import { useState, useEffect } from 'react';
import { donorService } from '../../services/donorService';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import { MagnifyingGlassIcon, PlusIcon, ArrowDownTrayIcon, CloudArrowUpIcon, UserPlusIcon, PhoneIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import ModernInput from '../../components/ui/ModernInput';
import OutreachModal from '../../components/dashboard/OutreachModal';
import EditDonorModal from '../../components/dashboard/EditDonorModal';

export default function DonorsPage() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('find'); // find, add, bulk

    // --- Search State ---
    const [query, setQuery] = useState('');
    const [bloodGroupFilter, setBloodGroupFilter] = useState('');
    const [donors, setDonors] = useState([]);
    const [filteredDonors, setFilteredDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [outreachOpen, setOutreachOpen] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);

    // --- Add/Import State ---
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '', bloodGroup: 'O+', location: '', contactNumber: '', email: '', lastDonation: ''
    });
    const [countryCode, setCountryCode] = useState('+91');
    const [editingDonor, setEditingDonor] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [importPreview, setImportPreview] = useState([]);

    const isOrg = currentUser && ['hospital', 'blood_bank', 'ngo'].includes(currentUser.role);

    // Initial Fetch for Search
    useEffect(() => {
        if (activeTab === 'find') {
            fetchDonors();
        }
    }, [activeTab]);

    async function fetchDonors() {
        setLoading(true);
        try {
            const data = await donorService.getAllDonors();
            setDonors(data);
            filterDonors(data, query, bloodGroupFilter);
        } catch (error) {
            console.error("Failed to fetch donors", error);
        } finally {
            setLoading(false);
        }
    }

    // --- Filter Logic ---
    useEffect(() => {
        filterDonors(donors, query, bloodGroupFilter);
    }, [query, bloodGroupFilter, donors]); // Removed unnecessary spacing comments for brevity

    function filterDonors(data, q, bg) {
        let results = data;
        if (bg) results = results.filter(d => d.bloodGroup === bg);
        if (q) {
            const lowerQ = q.toLowerCase();
            results = results.filter(d =>
                d.name?.toLowerCase().includes(lowerQ) ||
                d.location?.toLowerCase().includes(lowerQ)
            );
        }
        setFilteredDonors(results);
    }

    // --- Handlers: Add Single ---
    const handleSingleSubmit = async (e) => {
        e.preventDefault();
        setStatus('processing');
        try {
            const finalData = {
                ...formData,
                contactNumber: `${countryCode}${formData.contactNumber}`
            };
            await donorService.addDonor(finalData);
            setStatus('success');
            setMessage(`Successfully added donor: ${formData.name}`);
            setFormData({ name: '', bloodGroup: 'O+', location: '', contactNumber: '', email: '', lastDonation: '' });
            // Refresh list if needed (though we're on a different tab)
        } catch (error) {
            setStatus('error');
            setMessage('Failed to add donor: ' + error.message);
        }
    };

    // --- Handlers: Bulk Import ---
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                setImportPreview(data);
                setStatus('idle');
                setMessage(`Loaded ${data.length} records. Review below and click Import.`);
            } catch (error) {
                setStatus('error');
                setMessage('Error parsing file: ' + error.message);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleBulkImport = async () => {
        setStatus('processing');
        let count = 0;
        let errors = 0;
        try {
            for (const row of importPreview) {
                if (!row.Name || !row.Location) { errors++; continue; }
                const donorData = {
                    name: row.Name,
                    bloodGroup: row['Blood Group'] || 'Unknown',
                    location: row.Location || row.City || '',
                    email: row.Email || '',
                    contactNumber: row.Contact || row.Phone || row.Mobile || '',
                    lastDonation: row['Last Donation'] || new Date().toISOString().split('T')[0],
                    status: 'Active'
                };
                await donorService.addDonor(donorData);
                count++;
            }
            setStatus('success');
            setMessage(`Successfully imported ${count} donors. ${errors} skipped.`);
            setImportPreview([]);
        } catch (error) {
            setStatus('error');
            setMessage('Bulk import failed: ' + error.message);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            { Name: 'John Doe', 'Blood Group': 'O+', Location: 'Chennai', Email: 'john@example.com', Contact: '9876543210', 'Last Donation': '2023-01-01' }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        XLSX.writeFile({ Sheets: { 'Donors': ws }, SheetNames: ['Donors'] }, "Donor_Import_Template.xlsx");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Donors
                    </h2>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('find')}
                        className={`${activeTab === 'find' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                    >
                        <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                        Find Donors
                    </button>
                    {isOrg && (
                        <>
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`${activeTab === 'add' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                            >
                                <UserPlusIcon className="h-5 w-5 mr-2" />
                                Add Donor
                            </button>
                            <button
                                onClick={() => setActiveTab('bulk')}
                                className={`${activeTab === 'bulk' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                            >
                                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                Bulk Import
                            </button>
                        </>
                    )}
                </nav>
            </div>

            {/* Content: Find Donors */}
            {activeTab === 'find' && (
                <>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative rounded-md shadow-sm grow">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <ModernInput
                                id="search"
                                label="Search by name or location"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                icon={MagnifyingGlassIcon}
                            />
                        </div>
                        <select
                            className="block w-full rounded-lg border-0 py-4 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-rose-600 focus:outline-none sm:text-sm sm:leading-6 sm:w-48 shadow-sm"
                            value={bloodGroupFilter}
                            onChange={(e) => setBloodGroupFilter(e.target.value)}
                        >
                            <option value="">All Groups</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </div>

                    <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">
                            {loading ? (
                                <li className="px-4 py-4 text-center text-sm text-gray-500">Loading...</li>
                            ) : filteredDonors.length === 0 ? (
                                <li className="px-4 py-4 text-center text-sm text-gray-500">No donors found.</li>
                            ) : (
                                filteredDonors.map((person) => (
                                    <li key={person.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mr-4">
                                                    <span className="font-medium leading-none text-red-700">{person.bloodGroup}</span>
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{person.name}</p>
                                                    <p className="text-sm text-gray-500">{person.location}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {person.contactNumber && <span className="mr-3">📞 {person.contactNumber}</span>}
                                                        {person.lastDonation && <span>🩸 Last Donated: {person.lastDonation}</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium mr-2"
                                                    onClick={() => { setSelectedDonor(person); setOutreachOpen(true); }}
                                                >
                                                    Contact
                                                </button>
                                                {isOrg && (
                                                    <>
                                                        <button
                                                            className="text-gray-400 hover:text-blue-600"
                                                            onClick={() => {
                                                                setEditingDonor(person);
                                                                setFormData({
                                                                    name: person.name,
                                                                    bloodGroup: person.bloodGroup,
                                                                    location: person.location,
                                                                    contactNumber: person.contactNumber ? person.contactNumber.replace(/^\+91/, '') : '',
                                                                    email: person.email || '',
                                                                    lastDonation: person.lastDonation || ''
                                                                });
                                                                setEditModalOpen(true);
                                                            }}
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            className="text-gray-400 hover:text-red-600"
                                                            onClick={async () => {
                                                                if (window.confirm(`Are you sure you want to delete ${person.name}?`)) {
                                                                    try {
                                                                        await donorService.deleteDonor(person.id);
                                                                        const updatedDonors = donors.filter(d => d.id !== person.id);
                                                                        setDonors(updatedDonors);
                                                                        filterDonors(updatedDonors, query, bloodGroupFilter);
                                                                    } catch (err) {
                                                                        alert("Failed to delete donor");
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <OutreachModal open={outreachOpen} setOpen={setOutreachOpen} donor={selectedDonor} />
                    <EditDonorModal
                        open={editModalOpen}
                        setOpen={setEditModalOpen}
                        donor={editingDonor}
                        onUpdate={() => fetchDonors()}
                    />
                </>
            )}

            {/* Content: Add Single */}
            {
                activeTab === 'add' && isOrg && (
                    <div className="max-w-2xl mx-auto bg-white shadow sm:rounded-lg p-6">
                        {message && <div className={`mb-4 p-3 rounded ${status === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message}</div>}
                        <form onSubmit={handleSingleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <ModernInput
                                        id="donorName"
                                        label="Name"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        icon={UserPlusIcon}
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <div className="relative">
                                        <select
                                            value={formData.bloodGroup}
                                            onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                            className="peer block w-full rounded-lg border-0 bg-transparent py-4 pl-4 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-600 focus:outline-none sm:text-sm sm:leading-6 appearance-none transition-all duration-200"
                                        >
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                        </select>
                                        <label className="absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-slate-500 duration-300 pointer-events-none">
                                            Blood Group
                                        </label>
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                    <div className="flex">
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="rounded-l-lg border-gray-300 border-r-0 focus:ring-rose-500 focus:border-rose-500 py-3 pl-3 pr-8 bg-gray-50 text-gray-500 sm:text-sm"
                                        >
                                            <option value="+91">+91 (IN)</option>
                                            <option value="+1">+1 (US)</option>
                                            <option value="+44">+44 (UK)</option>
                                        </select>
                                        <input
                                            type="tel"
                                            required
                                            className="block w-full rounded-r-lg border-gray-300 focus:ring-rose-500 focus:border-rose-500 sm:text-sm py-3 px-4"
                                            placeholder="9876543210"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-6">
                                    <ModernInput
                                        id="location"
                                        label="Location"
                                        required
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        icon={MagnifyingGlassIcon} // Using search icon for location context
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={status === 'processing'} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> {status === 'processing' ? 'Adding...' : 'Add Donor'}
                                </button>
                            </div>
                        </form>
                    </div>
                )
            }

            {/* Content: Bulk Import */}
            {
                activeTab === 'bulk' && isOrg && (
                    <div className="max-w-2xl mx-auto bg-white shadow sm:rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Excel File</h3>
                            <button type="button" onClick={downloadTemplate} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <ArrowDownTrayIcon className="-ml-0.5 mr-2 h-4 w-4" /> Template
                            </button>
                        </div>
                        {message && <div className={`mb-4 p-3 rounded ${status === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message}</div>}

                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {importPreview.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Preview ({importPreview.length} records)</h4>
                                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>{Object.keys(importPreview[0]).map(k => <th key={k} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{k}</th>)}</tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {importPreview.slice(0, 5).map((row, i) => (
                                                <tr key={i}>{Object.values(row).map((v, j) => <td key={j} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{v}</td>)}</tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={handleBulkImport} disabled={status === 'processing'} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                                        {status === 'processing' ? 'Importing...' : 'Import All'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
}
