const KEYS = {
  user: 'cd_current_user',
  users: 'cd_users',
  samples: 'cd_samples',
  likesPrefix: 'cd_likes_',
};

const MEDIA_DB = {
  name: 'cd_media',
  version: 1,
  store: 'audioFiles',
};

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const authListeners = new Set();
const sampleListeners = new Set();
const likeListeners = new Map();
const objectUrlCache = new Map();

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const getCurrentUser = () => read(KEYS.user, null);
const getUsers = () => read(KEYS.users, []);
const getSamples = () => read(KEYS.samples, []);
const getLikes = (uid) => read(`${KEYS.likesPrefix}${uid}`, []);

const fallbackUsername = (email) => email.split('@')[0] || 'producer';

const openMediaDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(MEDIA_DB.name, MEDIA_DB.version);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_DB.store)) {
        db.createObjectStore(MEDIA_DB.store);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open local media storage.'));
  });

const saveAudioBlob = async (id, blob) => {
  const db = await openMediaDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_DB.store, 'readwrite');
    tx.objectStore(MEDIA_DB.store).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to save audio file.'));
  });
  db.close();
};

const loadAudioBlob = async (id) => {
  const db = await openMediaDb();
  const blob = await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_DB.store, 'readonly');
    const request = tx.objectStore(MEDIA_DB.store).get(id);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error ?? new Error('Failed to read audio file.'));
  });
  db.close();
  return blob;
};

const deleteAudioBlob = async (id) => {
  const db = await openMediaDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_DB.store, 'readwrite');
    tx.objectStore(MEDIA_DB.store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to delete audio file.'));
  });
  db.close();
};

const hydrateSampleMedia = async (sample) => {
  if (sample.mediaType !== 'indexeddb') {
    return sample;
  }

  const blob = await loadAudioBlob(sample.id);
  if (!blob) {
    return {
      ...sample,
      audioUrl: '',
      downloadUrl: '',
      missingMedia: true,
    };
  }

  const oldUrl = objectUrlCache.get(sample.id);
  if (oldUrl) {
    URL.revokeObjectURL(oldUrl);
  }

  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(sample.id, objectUrl);

  return {
    ...sample,
    audioUrl: objectUrl,
    downloadUrl: objectUrl,
    missingMedia: false,
  };
};

const emitAuth = () => {
  const user = getCurrentUser();
  authListeners.forEach((cb) => cb(user));
};

const emitSamples = async () => {
  const sorted = getSamples().sort((a, b) => b.createdAt - a.createdAt);
  const hydrated = await Promise.all(sorted.map((sample) => hydrateSampleMedia(sample)));
  sampleListeners.forEach((cb) => cb(hydrated));
};

const emitLikes = (uid) => {
  const listeners = likeListeners.get(uid) || new Set();
  const likes = getLikes(uid);
  listeners.forEach((cb) => cb(likes));
};

const removeSampleFromAllLikes = (sampleId) => {
  const users = getUsers();
  users.forEach((entry) => {
    const key = `${KEYS.likesPrefix}${entry.uid}`;
    const nextLikes = read(key, []).filter((id) => id !== sampleId);
    write(key, nextLikes);
    emitLikes(entry.uid);
  });
};

export function subscribeAuth(cb) {
  authListeners.add(cb);
  cb(getCurrentUser());
  return () => authListeners.delete(cb);
}

export async function login(email, password) {
  const found = getUsers().find((entry) => entry.email === email && entry.password === password);
  if (!found) throw new Error('Invalid email or password.');

  write(KEYS.user, {
    uid: found.uid,
    email: found.email,
    username: found.username || fallbackUsername(found.email),
  });
  emitAuth();
}

export async function signup(username, email, password) {
  const users = getUsers();
  const trimmedUsername = username.trim();

  if (trimmedUsername.length < 2) {
    throw new Error('Username must be at least 2 characters.');
  }

  if (users.some((entry) => entry.email === email)) throw new Error('Email already exists.');
  if (users.some((entry) => entry.username?.toLowerCase() === trimmedUsername.toLowerCase())) {
    throw new Error('Username is already taken.');
  }

  const created = { uid: crypto.randomUUID(), username: trimmedUsername, email, password };
  write(KEYS.users, [...users, created]);
  write(KEYS.user, { uid: created.uid, email: created.email, username: created.username });
  emitAuth();
}

export async function logout() {
  localStorage.removeItem(KEYS.user);
  emitAuth();
}

export function subscribeSamples(cb) {
  sampleListeners.add(cb);
  cb([]);
  emitSamples();
  return () => sampleListeners.delete(cb);
}

export function subscribeLikes(uid, cb) {
  const set = likeListeners.get(uid) || new Set();
  set.add(cb);
  likeListeners.set(uid, set);
  cb(getLikes(uid));
  return () => {
    const existing = likeListeners.get(uid);
    if (!existing) return;
    existing.delete(cb);
  };
}

export async function toggleLike(uid, sampleId) {
  const likes = getLikes(uid);
  const next = likes.includes(sampleId) ? likes.filter((id) => id !== sampleId) : [...likes, sampleId];
  write(`${KEYS.likesPrefix}${uid}`, next);
  emitLikes(uid);
}

const validateAudioUpload = (file) => {
  if (!file) {
    throw new Error('Please choose an MP3 file first.');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('File is too large. Keep uploads under 20MB in this demo build.');
  }
};

export async function uploadSample(user, payload) {
  validateAudioUpload(payload.file);

  const sampleId = crypto.randomUUID();
  const sample = {
    id: sampleId,
    title: payload.title,
    genre: payload.genre,
    tags: payload.tags,
    highlight: payload.highlight,
    bpm: Number(payload.bpm),
    producer: user.username || fallbackUsername(user.email),
    userId: user.uid,
    createdAt: Date.now(),
    mediaType: 'indexeddb',
    originalFileName: payload.file.name,
  };

  try {
    await saveAudioBlob(sampleId, payload.file);
    write(KEYS.samples, [sample, ...getSamples()]);
    await emitSamples();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Storage is full. Remove large browser data or upload a smaller file.');
    }

    throw error;
  }
}

export async function deleteSample(user, sampleId) {
  const sample = getSamples().find((entry) => entry.id === sampleId);
  if (!sample) return;
  if (sample.userId !== user.uid) {
    throw new Error('You can only delete your own uploads.');
  }

  if (sample.mediaType === 'indexeddb') {
    await deleteAudioBlob(sampleId);
  }

  const cachedUrl = objectUrlCache.get(sampleId);
  if (cachedUrl) {
    URL.revokeObjectURL(cachedUrl);
    objectUrlCache.delete(sampleId);
  }

  write(
    KEYS.samples,
    getSamples().filter((entry) => entry.id !== sampleId)
  );
  removeSampleFromAllLikes(sampleId);
  await emitSamples();
}
