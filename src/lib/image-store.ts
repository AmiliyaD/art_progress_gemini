/**
 * IndexedDB image storage for ART//PROGRESS
 * Stores full-resolution image blobs safely without polluting localStorage limits.
 */

const DB_NAME = 'artprogress_db_v1';
const DB_VERSION = 1;
const STORE_NAME = 'artwork_images';

// In-memory cache for Object URLs to prevent repeated object creation and manage cleanup
const objectUrlCache = new Map<string, string>();

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  return dbPromise;
}

/**
 * Save an image blob or File to IndexedDB
 */
export async function saveArtworkImage(id: string, image: Blob | File | string): Promise<string> {
  try {
    let blobToStore: Blob;

    if (typeof image === 'string') {
      // If it's a data URL or remote URL, fetch it to get a blob
      if (image.startsWith('data:') || image.startsWith('blob:')) {
        const res = await fetch(image);
        blobToStore = await res.blob();
      } else {
        // Fallback string storage
        blobToStore = new Blob([image], { type: 'text/plain' });
      }
    } else {
      blobToStore = image;
    }

    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blobToStore, id);

      req.onsuccess = () => {
        // Revoke old cached URL if existed
        if (objectUrlCache.has(id)) {
          URL.revokeObjectURL(objectUrlCache.get(id)!);
          objectUrlCache.delete(id);
        }
        resolve(id);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('Failed to save artwork in IndexedDB, falling back to memory/local fallback:', err);
    // Fallback: Store small data URL in sessionStorage or fallback map if IDB is disabled
    if (typeof image === 'string') {
      sessionStorage.setItem(`artprogress.fallback.img.${id}`, image);
      return id;
    }
    return id;
  }
}

/**
 * Get an image blob from IndexedDB
 */
export async function getArtworkImageBlob(id: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        resolve(req.result || null);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('Failed to read from IndexedDB:', err);
    return null;
  }
}

/**
 * Retrieve a temporary Object URL for display in <img src="..." />
 */
export async function getArtworkImageUrl(id: string): Promise<string | null> {
  if (!id) return null;

  // If already a remote HTTP/HTTPS URL or data URL, return directly
  if (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('data:')) {
    return id;
  }

  // Check cache first
  if (objectUrlCache.has(id)) {
    return objectUrlCache.get(id)!;
  }

  // Check fallback storage
  const fallback = sessionStorage.getItem(`artprogress.fallback.img.${id}`);
  if (fallback) return fallback;

  try {
    const blob = await getArtworkImageBlob(id);
    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    objectUrlCache.set(id, url);
    return url;
  } catch (err) {
    console.error('Failed to create artwork Object URL:', err);
    return null;
  }
}

/**
 * Delete an image blob from IndexedDB
 */
export async function deleteArtworkImage(id: string): Promise<void> {
  if (objectUrlCache.has(id)) {
    URL.revokeObjectURL(objectUrlCache.get(id)!);
    objectUrlCache.delete(id);
  }
  sessionStorage.removeItem(`artprogress.fallback.img.${id}`);

  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete image from IndexedDB:', err);
  }
}
