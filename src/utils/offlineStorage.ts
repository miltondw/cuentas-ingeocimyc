import { ProjectFormData } from "@/components/cuentas/forms/CreateProject/form-create-project.types";
import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "ingeocimyc-offline";
const REQUESTS_STORE = "pending-requests";
const PROJECTS_STORE = "projects";

export interface OfflineRequest {
  id?: number;
  url: string;
  method: string;
  data?: unknown;
  headers?: Record<string, string>;
  timestamp: string;
}

interface MyDB {
  [REQUESTS_STORE]: OfflineRequest;
  [PROJECTS_STORE]: ProjectFormData;
}

const dbPromise: Promise<IDBPDatabase<MyDB>> = openDB<MyDB>(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(REQUESTS_STORE, {
      keyPath: "id",
      autoIncrement: true,
    });
    db.createObjectStore(PROJECTS_STORE, { keyPath: "proyecto_id" });
  },
});

export async function saveRequest(request: OfflineRequest): Promise<number> {
  try {
    const db = await dbPromise;
    return (await db.add(REQUESTS_STORE, request)) as number;
  } catch (error) {
    console.error("Failed to save request to IndexedDB:", error);
    throw new Error("Could not save request to offline storage");
  }
}

export async function getPendingRequests(): Promise<OfflineRequest[]> {
  try {
    const db = await dbPromise;
    return await db.getAll(REQUESTS_STORE);
  } catch (error) {
    console.error("Failed to retrieve pending requests:", error);
    throw new Error("Could not retrieve pending requests");
  }
}

export async function deleteRequest(id: number): Promise<void> {
  try {
    const db = await dbPromise;
    await db.delete(REQUESTS_STORE, id);
  } catch (error) {
    console.error(`Failed to delete request with id ${id}:`, error);
    throw new Error("Could not delete request from offline storage");
  }
}

export async function cacheProjects(
  projects: ProjectFormData[]
): Promise<void> {
  try {
    const db = await dbPromise;
    const tx = db.transaction(PROJECTS_STORE, "readwrite");
    for (const project of projects) {
      await tx.store.put(project);
    }
    await tx.done;
  } catch (error) {
    console.error("Failed to cache projects:", error);
    throw new Error("Could not cache projects in offline storage");
  }
}

export async function getCachedProjects(): Promise<ProjectFormData[]> {
  try {
    const db = await dbPromise;
    return await db.getAll(PROJECTS_STORE);
  } catch (error) {
    console.error("Failed to retrieve cached projects:", error);
    throw new Error("Could not retrieve cached projects");
  }
}
