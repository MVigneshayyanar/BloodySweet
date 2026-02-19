import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, UserIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'
import ModernInput from '../ui/ModernInput';
import { donorService } from '../../services/donorService';

export default function EditDonorModal({ open, setOpen, donor, onUpdate }) {
    const [formData, setFormData] = useState({
        name: '', bloodGroup: '', location: '', contactNumber: '', email: '', lastDonation: ''
    });
    const [countryCode, setCountryCode] = useState('+91');
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        if (donor) {
            // Split contact number if it contains country code
            let contact = donor.contactNumber || '';
            let code = '+91';

            if (contact.startsWith('+1')) { code = '+1'; contact = contact.slice(2); }
            else if (contact.startsWith('+44')) { code = '+44'; contact = contact.slice(3); }
            else if (contact.startsWith('+91')) { code = '+91'; contact = contact.slice(3); }

            setFormData({
                name: donor.name || '',
                bloodGroup: donor.bloodGroup || 'O+',
                location: donor.location || '',
                contactNumber: contact,
                email: donor.email || '',
                lastDonation: donor.lastDonation || ''
            });
            setCountryCode(code);
        }
    }, [donor]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('processing');
        try {
            const finalData = {
                ...formData,
                contactNumber: `${countryCode}${formData.contactNumber}`
            };

            await donorService.updateDonor(donor.id, finalData);

            setStatus('success');
            setTimeout(() => {
                setOpen(false);
                setStatus('idle');
                if (onUpdate) onUpdate(); // Refresh the list
            }, 500);
        } catch (error) {
            setStatus('error');
            console.error(error);
        }
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                                        onClick={() => setOpen(false)}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <UserIcon className="h-6 w-6 text-rose-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                            Edit Donor Details
                                        </Dialog.Title>
                                        <div className="mt-2 text-sm text-gray-500 mb-4">
                                            Update the information for this donor.
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                            <ModernInput
                                                id="edit-name"
                                                label="Name"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />

                                            <div className="relative">
                                                <select
                                                    value={formData.bloodGroup}
                                                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                                    className="peer block w-full rounded-lg border-0 bg-transparent py-3 pl-4 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-600 focus:outline-none sm:text-sm sm:leading-6 appearance-none transition-all duration-200"
                                                >
                                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                </select>
                                                <label className="absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-slate-500 duration-300 pointer-events-none">
                                                    Blood Group
                                                </label>
                                            </div>

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
                                                    value={formData.contactNumber}
                                                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                                />
                                            </div>

                                            <ModernInput
                                                id="edit-location"
                                                label="Location"
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                required
                                            />

                                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                <button
                                                    type="submit"
                                                    disabled={status === 'processing'}
                                                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                                >
                                                    {status === 'processing' ? 'Saving...' : 'Save Changes'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
