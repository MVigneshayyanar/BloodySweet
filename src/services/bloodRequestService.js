import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';

// Placeholder n8n Webhook URL - User needs to replace this
// PRO TIP: 'webhook-test' is for testing while the n8n editor is open. Change to 'webhook' for production.
// PRO TIP: 'webhook-test' is for testing while the n8n editor is open. Change to 'webhook' for production.
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://vigneshinr.app.n8n.cloud/webhook/blood-request';

// Mock simulation steps (Fallback if n8n is not reachable)
const WORKFLOW_STEPS = [
    { status: 'matching', label: 'Matching Donors', delay: 2000 },
    { status: 'contacting', label: 'Initiating Outreach (n8n)', delay: 4000 },
    { status: 'awaiting', label: 'Awaiting Responses', delay: 3000 },
    { status: 'secured', label: 'Donor Secured', delay: 2000 }
];

export const bloodRequestService = {
    // Create a new request and trigger n8n workflow
    async createRequest(requestData) {
        try {
            const docRef = await addDoc(collection(db, 'bloodRequests'), {
                ...requestData,
                status: 'pending',
                createdAt: new Date(),
                progress: 0,
                timeline: [{ status: 'created', timestamp: new Date(), label: 'Request Received' }]
            });

            // Call n8n Webhook
            this.triggerN8nWorkflow(docRef.id, requestData);

            return docRef.id;
        } catch (error) {
            console.error("Error creating request:", error);
            throw error;
        }
    },

    // Trigger n8n Automation
    async triggerN8nWorkflow(requestId, requestData) {
        // Removed placeholder check strictly to allow the new cloud URL to fire.


        try {
            console.log(`Triggering n8n for request ${requestId}...`);

            // Attempt to call the n8n webhook
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    ...requestData,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`n8n responded with ${response.status}`);
            }

            console.log("✅ n8n workflow triggered successfully");

        } catch (error) {
            console.warn("❌ n8n webhook failed (using fallback simulation):", error.message);
            // Fallback to local simulation if n8n is not reachable/configured
            this.simulateWorkflow(requestId);
        }
    },

    // Mock background process (Fallback)
    simulateWorkflow(requestId) {
        let currentStepIndex = 0;

        const runNextStep = () => {
            if (currentStepIndex >= WORKFLOW_STEPS.length) return;

            const step = WORKFLOW_STEPS[currentStepIndex];

            setTimeout(async () => {
                try {
                    const requestRef = doc(db, 'bloodRequests', requestId);

                    await updateDoc(requestRef, {
                        status: step.status,
                        progress: ((currentStepIndex + 1) / WORKFLOW_STEPS.length) * 100,
                    });

                    currentStepIndex++;
                    runNextStep();
                } catch (error) {
                    console.error("Error in workflow simulation:", error);
                }
            }, step.delay);
        };

        runNextStep();
    },

    // Subscribe to requests for a specific organization
    subscribeToRequests(orgId, callback) {
        const q = query(
            collection(db, 'bloodRequests'),
            where('orgId', '==', orgId),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(requests);
        });
    },

    // Get ALL requests (for Analytics)
    async getAllRequests() {
        try {
            const q = query(collection(db, 'bloodRequests'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting all requests:", error);
            return [];
        }
    }
};
