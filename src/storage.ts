import type { CalibrationProfile } from './types';

const LOCAL_DB_NAME = 'movemap-local';
const DEMO_DB_NAME = 'movemap-demo';
const STORE = 'profiles';
const CURRENT_KEY = 'current';

function databaseName(demo: boolean): string {
  return demo ? DEMO_DB_NAME : LOCAL_DB_NAME;
}

function openDatabase(demo: boolean): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName(demo), 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProfile(profile: CalibrationProfile, demo = false): Promise<void> {
  const db = await openDatabase(demo);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(profile, CURRENT_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadProfile(demo = false): Promise<CalibrationProfile | null> {
  const db = await openDatabase(demo);
  const profile = await new Promise<CalibrationProfile | undefined>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(CURRENT_KEY);
    request.onsuccess = () => resolve(request.result as CalibrationProfile | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return profile ?? null;
}

export async function clearProfile(demo = false): Promise<void> {
  const db = await openDatabase(demo);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete(CURRENT_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}
