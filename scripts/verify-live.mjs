import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const origin = (process.argv[2] ?? 'https://gesture-gameplay-calibrator.sociobot.in').replace(/\/$/, '');
const billingOrigin = 'https://api.sociobot.in';
const slug = 'gesture-gameplay-calibrator';

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  }));
  return files.flat();
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function pngDimensions(bytes) {
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const localFiles = (await filesBelow('dist')).filter((path) => !path.endsWith('staticwebapp.config.json'));
for (const path of localFiles) {
  const localPath = relative('dist', path).split(sep).join('/');
  const publicPath = localPath === 'index.html' ? '/' : `/${localPath.replace(/\/index\.html$/, '/')}`;
  const response = await fetch(`${origin}${publicPath}`, { cache: 'no-store' });
  assert.equal(response.status, 200, `${publicPath} should be live`);
  const remote = Buffer.from(await response.arrayBuffer());
  const local = await readFile(path);
  assert.equal(sha256(remote), sha256(local), `${publicPath} must match dist`);
  if (publicPath.startsWith('/assets/') || publicPath.startsWith('/icons/')) {
    assert.match(response.headers.get('cache-control') ?? '', /max-age=31536000/);
    assert.match(response.headers.get('cache-control') ?? '', /immutable/);
  }
}

const root = await fetch(`${origin}/`, { cache: 'no-store' });
assert.match(root.headers.get('cache-control') ?? '', /no-cache/);
assert.match(root.headers.get('cache-control') ?? '', /no-store/);
assert.match(root.headers.get('content-security-policy') ?? '', /default-src 'self'/);
assert.match(root.headers.get('permissions-policy') ?? '', /camera=\(self\)/);
assert.equal(root.headers.get('x-frame-options'), 'DENY');
assert.equal(root.headers.get('x-content-type-options'), 'nosniff');

const manifestResponse = await fetch(`${origin}/manifest.webmanifest`, { cache: 'no-store' });
assert.match(manifestResponse.headers.get('content-type') ?? '', /^application\/manifest\+json/);
const manifest = await manifestResponse.json();
const icon512 = manifest.icons.find((icon) => icon.sizes === '512x512');
assert.ok(icon512?.purpose.includes('maskable'), 'manifest needs a maskable 512px icon');
const iconResponse = await fetch(new URL(icon512.src, origin));
assert.deepEqual(pngDimensions(Buffer.from(await iconResponse.arrayBuffer())), { width: 512, height: 512 });

const catalogResponse = await fetch(`${billingOrigin}/api/v1/products`);
assert.equal(catalogResponse.status, 200);
const catalog = await catalogResponse.json();
const product = catalog.data.find((candidate) => candidate.slug === slug);
assert.deepEqual(product, {
  checkout_url: `${billingOrigin}/api/v1/products/${slug}/checkout`,
  currency: 'USD',
  name: 'MoveMap Maker Pack',
  price_minor: 1200,
  product_url: `${origin}/`,
  slug,
});

const checkout = await fetch(product.checkout_url, { redirect: 'manual' });
assert.equal(checkout.status, 303, 'checkout should redirect to the hosted merchant');
assert.match(checkout.headers.get('location') ?? '', /^https:\/\/checkout\.dodopayments\.com\/session\//);

console.log(`Live release verified: ${localFiles.length} files match dist; checkout redirects; 512px icon is valid.`);
