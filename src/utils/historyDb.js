const DB_NAME = 'qa_report_generator_db';
const STORE_NAME = 'reports';
const DB_VERSION = 1;

export function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function saveReport(fileName, data, id = null) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const record = {
      id: id || Date.now().toString(),
      fileName,
      timestamp: new Date().toISOString(),
      data,
    };
    const request = store.put(record);
    request.onsuccess = () => resolve(record.id);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getAllReports() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = (e) => {
      const results = e.target.result || [];
      results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      resolve(results);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getReport(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function updateReport(id, data, fileName = null) {
  const db = await openDb();
  const existing = await getReport(id);
  if (!existing) throw new Error('Report not found');

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const updated = {
      ...existing,
      data,
      timestamp: new Date().toISOString(),
    };
    if (fileName) updated.fileName = fileName;
    const request = store.put(updated);
    request.onsuccess = () => resolve(id);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function deleteReport(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function renameReport(id, fileName) {
  const db = await openDb();
  const existing = await getReport(id);
  if (!existing) throw new Error('Report not found');

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const updated = {
      ...existing,
      fileName,
      timestamp: new Date().toISOString(),
    };
    const request = store.put(updated);
    request.onsuccess = () => resolve(id);
    request.onerror = (e) => reject(e.target.error);
  });
}
