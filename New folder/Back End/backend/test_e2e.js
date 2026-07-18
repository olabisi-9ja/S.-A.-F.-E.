import fetch from 'node-fetch'; // We will just use native fetch in node 18+

const API_URL = 'http://localhost:5000/api';
let token = '';

async function runTests() {
  console.log('--- STARTING RIGOROUS E2E TESTS ---');
  
  // 1. Test Registration
  console.log('\n[1] Testing User Registration...');
  const regEmail = `test_${Date.now()}@kwasu.edu.ng`;
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'E2E Tester',
      institutional_email: regEmail,
      phone: '08123456789',
      password: 'password123'
    })
  });
  const regData = await regRes.json();
  if (regRes.ok) {
    console.log('✅ Registration successful!');
    
    // Manually verify the user in the database for testing
    const sqlite3 = await import('sqlite3');
    const db = new sqlite3.default.Database('./safe_dev.sqlite');
    await new Promise((resolve) => {
      db.run(`UPDATE users SET email_verified = 1 WHERE institutional_email = ?`, [regEmail], resolve);
    });
    console.log('✅ User artificially verified in database.');
  } else {
    console.error('❌ Registration failed:', regData);
  }

  // 2. Test Login
  console.log('\n[2] Testing User Login...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      institutional_email: regEmail,
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  if (loginRes.ok && loginData.data && loginData.data.token) {
    console.log('✅ Login successful! Token received.');
    token = loginData.data.token;
  } else {
    console.error('❌ Login failed:', loginData);
    return;
  }

  // 3. Test Incident Reporting (Triggers AI)
  console.log('\n[3] Testing Incident Reporting (AI Classification)...');
  const incRes = await fetch(`${API_URL}/incidents`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      category: 'Fire',
      description: 'Massive fire breaking out near the engineering building.',
      latitude: 8.5,
      longitude: 4.5
    })
  });
  const incData = await incRes.json();
  if (incRes.ok) {
    console.log('✅ Incident reported successfully!');
    console.log('   AI Classification:', incData.data.ai_classification);
  } else {
    console.error('❌ Incident report failed:', incData);
  }

  // 4. Test SOS Alert (Triggers Termii/SMS Mock)
  console.log('\n[4] Testing SOS Alert Trigger...');
  const sosRes = await fetch(`${API_URL}/alerts`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      latitude: 8.51,
      longitude: 4.51,
      transmission_mode: 'https'
    })
  });
  const sosData = await sosRes.json();
  if (sosRes.ok) {
    console.log('✅ SOS triggered successfully!');
  } else {
    console.error('❌ SOS trigger failed:', sosData);
  }

  console.log('\n--- TESTS COMPLETE ---');
}

runTests().catch(console.error);
