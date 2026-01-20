
// Verification Script
async function verifyFunction() {
    const url = 'https://nywvatykietyhbhugcbl.supabase.co/functions/v1/check-auto-followups';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55d3ZhdHlraWV0eWhiaHVnY2JsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIyMTQ4MywiZXhwIjoyMDgzNzk3NDgzfQ.SWYoFd-nPa13F6t2hUdJSQjC1Y8AQRAmGZ3ir8I2cLM';

    console.log('🔄 Manually Triggering Auto Follow-up Check...');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({})
        });

        const status = response.status;
        const text = await response.text();

        console.log(`\n📡 Status Code: ${status}`);

        try {
            const json = JSON.parse(text);
            console.log('📦 Processed Result:');
            console.dir(json, { depth: null, colors: true });
        } catch (e) {
            console.log('📄 Response:', text);
        }

    } catch (err) {
        console.error('❌ Error:', err);
    }
}

verifyFunction();
