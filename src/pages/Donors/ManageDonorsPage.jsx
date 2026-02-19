import { useState } from 'react';
import { donorService } from '../../services/donorService';
import * as XLSX from 'xlsx';
import { ArrowDownTrayIcon, CloudArrowUpIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ManageDonorsPage() {
    const [activeTab, setActiveTab] = useState('single');
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        bloodGroup: 'O+',
        location: '',
        contactNumber: '',
        email: '',
        lastDonation: ''
    });
    const [importPreview, setImportPreview] = useState([]);

    const handleSingleSubmit = async (e) => {
        e.preventDefault();
        setStatus('processing');
        try {
            await donorService.addDonor(formData);
            setStatus('success');
            setMessage(`Successfully added donor: ${formData.name}`);
            setFormData({
                name: '',
                bloodGroup: 'O+',
                location: '',
                contactNumber: '',
                email: '',
                lastDonation: ''
            });
        } catch (error) {
            setStatus('error');
            setMessage('Failed to add donor: ' + error.message);
        }
    };

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
                // Basic mapping/validation
                if (!row.Name || !row.Location) {
                    errors++;
                    continue;
                }

                const donorData = {
                    name: row.Name,
                    bloodGroup: row['Blood Group'] || 'Unknown',
                    location: row.Location,
                    email: row.Email || '',
                    contactNumber: row.Contact || '',
                    lastDonation: row['Last Donation'] || new Date().toISOString().split('T')[0],
                    status: 'Active'
                };

                await donorService.addDonor(donorData);
                count++;
            }
            setStatus('success');
            setMessage(`Successfully imported ${count} donors. ${errors} skipped due to missing Name/Location.`);
            setImportPreview([]);
        } catch (error) {
            setStatus('error');
            setMessage('Bulk import failed: ' + error.message);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            { Name: 'John Doe', 'Blood Group': 'O+', Location: 'Chennai', Email: 'john@example.com', Contact: '9876543210', 'Last Donation': '2023-01-01' },
            { Name: 'Jane Smith', 'Blood Group': 'A-', Location: 'Bangalore', Email: 'jane@example.com', Contact: '1234567890', 'Last Donation': '2023-05-15' }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Donors");
        XLSX.writeFile(wb, "Donor_Import_Template.xlsx");
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-6">Manage Donors</h2>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('single')}
                        className={`${activeTab === 'single'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Add Single Donor
                    </button>
                    <button
                        onClick={() => setActiveTab('bulk')}
                        className={`${activeTab === 'bulk'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Bulk Import (Excel/CSV)
                    </button>
                </nav>
            </div>

            {/* Feedback Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-md ${status === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    <p>{message}</p>
                </div>
            )}

            {/* Single Entry Form */}
            {activeTab === 'single' && (
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <form onSubmit={handleSingleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                <select
                                    value={formData.bloodGroup}
                                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-4">
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Last Donation</label>
                                <input
                                    type="date"
                                    value={formData.lastDonation}
                                    onChange={e => setFormData({ ...formData, lastDonation: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={status === 'processing'}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                {status === 'processing' ? 'Adding...' : 'Add Donor'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bulk Import */}
            {activeTab === 'bulk' && (
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Excel File</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Upload an .xlsx or .csv file with columns: Name, Blood Group, Location, Contact, Email, Last Donation.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={downloadTemplate}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                <ArrowDownTrayIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                Download Template
                            </button>
                        </div>

                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">XLSX, CSV up to 10MB</p>
                            </div>
                        </div>

                        {importPreview.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Preview ({importPreview.length} records)</h4>
                                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                {Object.keys(importPreview[0]).map(key => (
                                                    <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {importPreview.slice(0, 20).map((row, idx) => (
                                                <tr key={idx}>
                                                    {Object.values(row).map((val, i) => (
                                                        <td key={i} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{val}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {importPreview.length > 20 && (
                                        <p className="p-2 text-xs text-center text-gray-500">...and {importPreview.length - 20} more rows</p>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleBulkImport}
                                        disabled={status === 'processing'}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {status === 'processing' ? 'Importing...' : 'Import All Records'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
