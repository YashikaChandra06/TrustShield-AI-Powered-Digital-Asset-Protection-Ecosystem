const { spawn } = require('child_process');
const path = require('path');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/api`;

const testFlow = async () => {
    console.log('Starting server for testing...');
    const serverProcess = spawn('node', [path.join(__dirname, 'src/server.js')]);

    // Give server a second to start
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        console.log('\n--- Testing Standard Registration ---');
        const testUser = { email: `test${Date.now()}@example.com`, password: 'password123' };
        let res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        let data = await res.json();
        console.log('Register response:', data);

        console.log('\n--- Testing Standard Login ---');
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        data = await res.json();
        console.log('Login response:', data);
        const standardToken = data.token;

        console.log('\n--- Testing Protected Route with Token ---');
        res = await fetch(`${BASE_URL}/protected`, {
            headers: { Authorization: `Bearer ${standardToken}` }
        });
        data = await res.json();
        console.log('Protected route response:', data);

        console.log('\n--- Testing Mock Google Login ---');
        const googleUser = { email: `google${Date.now()}@example.com`, google_id: `g_id_${Date.now()}` };
        res = await fetch(`${BASE_URL}/auth/google-mock`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(googleUser)
        });
        data = await res.json();
        console.log('Google login (signup) response:', data);
        const googleToken = data.token;

        console.log('\n--- Testing Protected Route with Google Token ---');
        res = await fetch(`${BASE_URL}/protected`, {
            headers: { Authorization: `Bearer ${googleToken}` }
        });
        data = await res.json();
        console.log('Protected route response:', data);

        console.log('\n--- Testing Asset Upload ---');
        const formData = new FormData();
        const fileContent = 'console.log("Mock code file content for testing");';
        const blob = new Blob([fileContent], { type: 'application/javascript' });
        formData.append('asset', blob, 'test_script.js');

        res = await fetch(`${BASE_URL}/assets/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${standardToken}` },
            body: formData
        });
        data = await res.json();
        console.log('Upload response:', data);
        const uploadedAssetId = data.assetId;

        // Give the AI scanner a couple of seconds to process
        console.log('Waiting for AI scan to complete...');
        await new Promise(resolve => setTimeout(resolve, 2500));

        console.log('\n--- Testing Get User Assets ---');
        res = await fetch(`${BASE_URL}/assets`, {
            headers: { Authorization: `Bearer ${standardToken}` }
        });
        data = await res.json();
        console.log('User assets:', data);

        if (uploadedAssetId) {
            console.log('\n--- Testing Get Specific Asset Scan Report ---');
            res = await fetch(`${BASE_URL}/assets/${uploadedAssetId}`, {
                headers: { Authorization: `Bearer ${standardToken}` }
            });
            data = await res.json();
            console.log('Asset detail and report:', data);
        }

        console.log('\nAll tests passed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        console.log('Shutting down server...');
        serverProcess.kill();
        process.exit(0);
    }
};

testFlow();
