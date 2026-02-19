import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const COLLECTION_NAME = 'donors';

export const donorService = {
    // Add a new donor
    async addDonor(donorData) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...donorData,
                createdAt: new Date(),
                status: 'Active' // Default status
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding donor:", error);
            throw error;
        }
    },

    // Get all donors (for analytics/admin)
    async getAllDonors() {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting donors:", error);
            return [];
        }
    },

    // Search donors by blood group and location (fuzzy match simulation on client side for now, or simple filter)
    async searchDonors(bloodGroup, locationQuery) {
        try {
            // Firestore simple query for blood group
            let q = query(collection(db, COLLECTION_NAME));

            if (bloodGroup) {
                q = query(q, where('bloodGroup', '==', bloodGroup));
            }

            const querySnapshot = await getDocs(q);
            let results = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side filtering for location (since Firestore text search is limited without additional services like Algolia)
            if (locationQuery) {
                const lowerQuery = locationQuery.toLowerCase();
                results = results.filter(donor =>
                    donor.location.toLowerCase().includes(lowerQuery) ||
                    donor.district?.toLowerCase().includes(lowerQuery)
                );
            }

            return results;
        } catch (error) {
            console.error("Error searching donors:", error);
            return [];
        }
    }
};
