import { openDB } from "idb";

const DB_NAME = "ingeocimyc-offline";
const STORE_NAME = "pending-requests";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    db.createObjectStore(PROJECTS_STORE, { keyPath: "proyecto_id" });
  },
});

export async function saveRequest(request) {
  const db = await dbPromise;
  return db.add(STORE_NAME, request);
}

export async function getPendingRequests() {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
}

export async function deleteRequest(id) {
  const db = await dbPromise;
  return db.delete(STORE_NAME, id);
}
const PROJECTS_STORE = "projects";

export async function cacheProjects(projects) {
  const db = await dbPromise;
  const tx = db.transaction(PROJECTS_STORE, "readwrite");
  for (const project of projects) {
    await tx.store.put(project);
  }
  await tx.done;
}

export async function getCachedProjects() {
  const db = await dbPromise;
  return db.getAll(PROJECTS_STORE);
}
