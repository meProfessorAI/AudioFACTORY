/**
@license
* SPDX-License-Identifier: Apache-2.0
* AudioFACTORY Production Smoke & Security Test Suite
*/
import assert from 'node:assert/strict';

async function runSmokeTests() {
  console.log('[SMOKE TEST] Starting AudioFACTORY Production Verification...');
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200, 'Health check should return 200');
    const healthData = await healthRes.json();
    assert.equal(healthData.status, 'ok', 'Health status should be ok');
    console.log('[SMOKE TEST] ✓ GET /api/health passed');

    // 2. Dependency health
    const depRes = await fetch(`${baseUrl}/api/health/dependencies`);
    assert.equal(depRes.status, 200, 'Dependency health check should return 200');
    const depData = await depRes.json();
    assert.equal(depData.storageEngine, 'initialized');
    console.log('[SMOKE TEST] ✓ GET /api/health/dependencies passed');

    // 3. Plans list
    const plansRes = await fetch(`${baseUrl}/api/billing/plans`);
    assert.equal(plansRes.status, 200, 'Plans endpoint should return 200');
    const plansData = await plansRes.json();
    assert.ok(plansData.plans, 'Plans object should be present');
    assert.equal(plansData.plans.guest.dailyGenerations, 3);
    assert.equal(plansData.plans.free.dailyGenerations, 10);
    console.log('[SMOKE TEST] ✓ GET /api/billing/plans passed');

    // 4. Guest entitlement resolution test
    const entRes = await fetch(`${baseUrl}/api/billing/entitlement`);
    assert.equal(entRes.status, 200, 'Guest entitlement should return 200 with guest plan');
    const entData = await entRes.json();
    assert.equal(entData.isGuest, true, 'Unauthenticated user should resolve as guest');
    console.log('[SMOKE TEST] ✓ Guest entitlement resolution passed (HTTP 200)');

    console.log('[SMOKE TEST] All production smoke & security tests passed successfully!');
  } catch (error: any) {
    console.error('[SMOKE TEST ERROR]:', error);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('production-smoke-test.ts')) {
  runSmokeTests();
}

export { runSmokeTests };
