import type { CalibrationProfile } from './types';

const DB_NAME = 'movemap-local';
const STORE = 'profiles';
const CURRENT_KEY = 'current';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProfile(profile: CalibrationProfile): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(profile, CURRENT_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadProfile(): Promise<CalibrationProfile | null> {
  const db = await openDatabase();
  const profile = await new Promise<CalibrationProfile | undefined>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(CURRENT_KEY);
    request.onsuccess = () => resolve(request.result as CalibrationProfile | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return profile ?? null;
}

export async function clearProfile(): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete(CURRENT_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}
