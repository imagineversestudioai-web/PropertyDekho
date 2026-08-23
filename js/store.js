const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAIO_WzagQUycGjRHiIuBK5OLaAaTD5NTg",
  authDomain: "propertydekho-official.firebaseapp.com",
  projectId: "propertydekho-official",
  storageBucket: "propertydekho-official.firebasestorage.app",
  messagingSenderId: "18868204274",
  appId: "1:18868204274:web:4fa92548bce39a65abd66b",
};

let firestore = null;
function db() {
  if (!firestore) {
    firebase.initializeApp(FIREBASE_CONFIG);
    firestore = firebase.firestore();
  }
  return firestore;
}

let localApi = null;

async function hasLocalApi() {
  if (localApi !== null) return localApi;
  if (location.hostname.includes("onrender.com")) {
    localApi = false;
    return false;
  }
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    localApi = res.ok;
  } catch {
    localApi = false;
  }
  return localApi;
}

async function cloudList(resource) {
  const snap = await db().collection(resource).orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

async function cloudAdd(resource, item) {
  const payload = { ...item };
  delete payload.id;
  const ref = await db().collection(resource).add(payload);
  return { ...payload, id: ref.id };
}

async function loadDemands() {
  if (await hasLocalApi()) {
    const res = await fetch("/api/demands", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }
  return cloudList("demands");
}

async function addDemand(demand) {
  if (await hasLocalApi()) {
    const res = await fetch("/api/demands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(demand),
    });
    if (!res.ok) throw new Error("Could not post demand");
    return res.json();
  }
  return cloudAdd("demands", demand);
}

async function loadClients() {
  if (await hasLocalApi()) {
    const res = await fetch("/api/clients", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }
  return cloudList("clients");
}

async function addClient(client) {
  if (await hasLocalApi()) {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    if (!res.ok) throw new Error("Could not post requirement");
    return res.json();
  }
  return cloudAdd("clients", client);
}

function listenLive(kind, onChange) {
  hasLocalApi().then((ok) => {
    if (!ok || !window.EventSource) return;
    const path = kind === "clients" ? "/api/clients/stream" : "/api/demands/stream";
    const stream = new EventSource(path);
    stream.onmessage = () => onChange();
  });
}

function startLiveRefresh(kind, refresh) {
  listenLive(kind, refresh);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refresh();
  });
  setInterval(() => {
    if (document.visibilityState === "visible") refresh();
  }, 45000);
  refresh();
}
