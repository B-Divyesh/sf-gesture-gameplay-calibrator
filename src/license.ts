const SLUG = 'gesture-gameplay-calibrator';
const STORAGE_KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `${STORAGE_KEY}:verdict`;
const BILLING_BASE = import.meta.env.VITE_BILLING_BASE ?? 'https://api.sociobot.in/api/v1';
const DAY = 86_400_000;

export interface LicenseState {
  unlocked: boolean;
  checking: boolean;
  message: string;
}

export const checkoutUrl = `${BILLING_BASE}/products/${SLUG}/checkout`;

export function captureLicenseFromUrl(): void {
  const url = new URL(window.location.href);
  const license = url.searchParams.get('license');
  if (!license) return;
  localStorage.setItem(STORAGE_KEY, license);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(STORAGE_KEY, token.trim());
  localStorage.removeItem(CACHE_KEY);
}

export function removeLicense(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CACHE_KEY);
}

export async function verifyLicense(): Promise<LicenseState> {
  const token = localStorage.getItem(STORAGE_KEY);
  if (!token) return { unlocked: false, checking: false, message: '' };

  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as { valid: boolean; checkedAt: number } | null;
  const optimistic = Boolean(cached?.valid);
  if (cached && Date.now() - cached.checkedAt < DAY) {
    return { unlocked: cached.valid, checking: false, message: cached.valid ? 'Maker Pack active' : 'License no longer active' };
  }

  try {
    const response = await fetch(`${BILLING_BASE}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const verdict = await response.json() as { valid: boolean; reason?: string };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ valid: verdict.valid, checkedAt: Date.now() }));
    return {
      unlocked: verdict.valid,
      checking: false,
      message: verdict.valid ? 'Maker Pack active' : 'License no longer active',
    };
  } catch {
    return {
      unlocked: optimistic,
      checking: false,
      message: optimistic ? 'Maker Pack active offline' : 'Could not verify this license yet',
    };
  }
}
