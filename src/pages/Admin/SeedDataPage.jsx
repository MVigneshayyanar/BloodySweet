import { useState } from 'react';
import { donorService } from '../../services/donorService';
import { MOCK_DONORS } from '../../utils/mockData';

export default function SeedDataPage() {
    const [status, setStatus] = useState('idle');
    const [log, setLog] = useState([]);

    const handleSeed = async () => {
        setStatus('seeding');
        setLog([]);

        try {
            let count = 0;
            for (const donor of MOCK_DONORS) {
                // Remove ID as Firestore generates it
                const { id, ...donorData } = donor;
                await donorService.addDonor(donorData);
                setLog(prev => [...prev, `Added ${donor.name}`]);
                count++;
            }
            setStatus('success');
            setLog(prev => [...prev, `Successfully seeded ${count} donors!`]);
        } catch (error) {
            setStatus('error');
            setLog(prev => [...prev, `Error: ${error.message}`]);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
            <p className="mb-4 text-gray-600">
                This utility will populate your Firestore database with the mock data currently used in the app.
                Only run this once to avoid duplicates!
            </p>

            <button
                onClick={handleSeed}
                disabled={status === 'seeding'}
                className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {status === 'seeding' ? 'Seeding...' : 'Seed Database'}
            </button>

            <div className="mt-6 bg-gray-100 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
                {log.length === 0 ? <span className="text-gray-400">Log output will appear here...</span> : log.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
            </div>
        </div>
    );
}
