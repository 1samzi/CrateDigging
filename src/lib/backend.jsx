const KEYS = {
  user: 'cd_current_user',
  users: 'cd_users',
  samples: 'cd_samples',
  likesPrefix: 'cd_likes_',
};

const authListeners = new Set();
const sampleListeners = new Set();
const likeListeners = new Map();

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

const emitAuth = () => {
  const user = getCurrentUser();
  authListeners.forEach((cb) => cb(user));
};

const emitSamples = () => {
  const samples = getSamples().sort((a, b) => b.createdAt - a.createdAt);
  sampleListeners.forEach((cb) => cb(samples));
};

const emitLikes = (uid) => {
  const listeners = likeListeners.get(uid) || new Set();
  const likes = getLikes(uid);
  listeners.forEach((cb) => cb(likes));
};

export function subscribeAuth(cb) {
  authListeners.add(cb);
  cb(getCurrentUser());
  return () => authListeners.delete(cb);
}

export async function login(email, password) {
  const found = getUsers().find((entry) => entry.email === email && entry.password === password);
  if (!found) throw new Error('Invalid email or password.');
  write(KEYS.user, { uid: found.uid, email: found.email });
  emitAuth();
}

export async function signup(email, password) {
  const users = getUsers();
  if (users.some((entry) => entry.email === email)) throw new Error('Email already exists.');
  const created = { uid: crypto.randomUUID(), email, password };
  write(KEYS.users, [...users, created]);
  write(KEYS.user, { uid: created.uid, email: created.email });
  emitAuth();
}

export async function logout() {
  localStorage.removeItem(KEYS.user);
  emitAuth();
}

export function subscribeSamples(cb) {
  sampleListeners.add(cb);
  cb(getSamples().sort((a, b) => b.createdAt - a.createdAt));
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

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read audio file.'));
    reader.readAsDataURL(file);
  });

export async function uploadSample(user, payload) {
  const dataUrl = await fileToDataUrl(payload.file);
  const sample = {
    id: crypto.randomUUID(),
    title: payload.title,
    genre: payload.genre,
    tags: payload.tags,
    highlight: payload.highlight,
    bpm: Number(payload.bpm),
    producer: user.email,
    audioUrl: dataUrl,
    downloadUrl: dataUrl,
    userId: user.uid,
    createdAt: Date.now(),
  };

  write(KEYS.samples, [sample, ...getSamples()]);
  emitSamples();
}
