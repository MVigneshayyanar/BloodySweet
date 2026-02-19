import { useState } from 'react';
import Modal from '../common/Modal';

export default function OutreachModal({ open, setOpen, donor }) {
    const [method, setMethod] = useState('sms');
    const [status, setStatus] = useState('idle');

    const handleSend = () => {
        setStatus('sending');
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    return (
        <Modal open={open} setOpen={setOpen} title={`Contact Request: ${donor?.name}`}>
            <div className="space-y-4 mt-4">
                <p className="text-sm text-gray-600">
                    Initiating outreach for blood group <span className="font-bold text-red-600">{donor?.bloodGroup}</span>.
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Compliance Check: This donor belongs to <strong>Organization A</strong>.
                                Manual coordination required for cross-organization requests.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Outreach Method</label>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6"
                    >
                        <option value="sms">Automated SMS (Owner Only)</option>
                        <option value="voice">Automated Voice Call (Owner Only)</option>
                        <option value="manual">Manual Call (Cross-Org)</option>
                    </select>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                        onClick={handleSend}
                        disabled={status === 'sending' || status === 'success'}
                    >
                        {status === 'idle' && 'Send Request'}
                        {status === 'sending' && 'Processing...'}
                        {status === 'success' && 'Request Sent!'}
                    </button>
                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
}
