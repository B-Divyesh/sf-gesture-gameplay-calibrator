import assert from 'node:assert/strict';

// This is deliberately a live integration check: the rate limiter belongs to
// the Sociobot billing service, not to the static MoveMap bundle. Keeping it
// separate makes a missing server-side control fail the release gate instead
// of being hidden behind a mocked browser request.
const billingOrigin = (process.env.BILLING_ORIGIN ?? 'https://api.sociobot.in').replace(/\/$/, '');
const slug = 'gesture-gameplay-calibrator';
const burstSize = Number.parseInt(process.env.BILLING_RATE_LIMIT_BURST ?? '60', 10);

assert.ok(Number.isInteger(burstSize) && burstSize > 0, 'BILLING_RATE_LIMIT_BURST must be a positive integer');

const verifyUrl = new URL(`/api/v1/products/${slug}/verify`, billingOrigin);
verifyUrl.searchParams.set('license', 'qa-rate-limit-probe');

function hasMeaningfulRetryAfter(value) {
  if (!value) return false;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return seconds > 0;
  const retryAt = Date.parse(value);
  return Number.isFinite(retryAt) && retryAt > Date.now();
}

const responses = await Promise.all(Array.from({ length: burstSize }, async () => {
  const response = await fetch(verifyUrl, {
    cache: 'no-store',
    headers: { 'X-QA-Rate-Limit-Probe': 'movemap' },
  });
  return { status: response.status, retryAfter: response.headers.get('retry-after') };
}));

const throttled = responses.filter((response) => response.status === 429);
const statusCounts = Object.entries(Object.groupBy(responses, (response) => response.status))
  .map(([status, matching]) => `${status}=${matching.length}`)
  .join(', ');

assert.ok(
  throttled.length > 0,
  `verify endpoint must rate-limit a ${burstSize}-request per-client burst (observed ${statusCounts})`,
);

for (const response of throttled) {
  assert.ok(response.retryAfter, 'each 429 response must include Retry-After');
  assert.ok(hasMeaningfulRetryAfter(response.retryAfter), `Retry-After must be a positive delay or future HTTP date (received ${response.retryAfter})`);
}

console.log(`Billing rate limit verified: ${throttled.length}/${burstSize} requests returned 429 with Retry-After.`);
