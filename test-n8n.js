import fetch from 'node-fetch';

const WEBHOOK_URL = 'https://vigneshinr.app.n8n.cloud/webhook/blood-request';

async function testWebhook() {
    console.log(`Testing n8n Webhook: ${WEBHOOK_URL}`);

    const payload = {
        requestId: 'test-req-123',
        patientName: 'Test Patient',
        bloodGroup: 'O+',
        location: 'Test Location',
        urgency: 'high',
        status: 'pending'
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();

        console.log(`Response Status: ${response.status}`);
        console.log(`Response Body: ${text}`);

        if (response.ok) {
            console.log('✅ Webhook triggered successfully!');
        } else {
            console.error('❌ Webhook failed.');
        }
    } catch (error) {
        console.error('❌ Error triggering webhook:', error.message);
    }
}

testWebhook();
