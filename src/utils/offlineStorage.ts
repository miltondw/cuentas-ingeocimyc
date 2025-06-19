import type { ProjectFormData } from "@/features/financial/types/projectTypes";
import { openDB, IDBPDatabase } from "idb";
import { AxiosRequestHeaders } from "axios";

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
  priority?: number;
}

interface MyDB {
  [REQUESTS_STORE]: OfflineRequest;
  [PROJECTS_STORE]: ProjectFormData;
}

// Para compatibilidad con el nuevo sistema
export interface PendingRequest {
  id: string;
  url: string;
  method: string;
  data?: unknown;
  headers?: AxiosRequestHeaders | Record<string, string>;
  timestamp: number;
  priority: number;
}

const dbPromise: Promise<IDBPDatabase<MyDB>> = openDB<MyDB>(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(REQUESTS_STORE, {
      keyPath: "id",
      autoIncrement: true,
    });
    db.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
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

// Compatibilidad con la nueva API
export function getStoredRequests(): PendingRequest[] {
  try {
    // Intentamos obtener de IndexedDB y convertir al nuevo formato
    return getPendingRequests().then((requests) => {
      return requests.map((req) => ({
        id: `req_${req.id || Date.now().toString()}`,
        url: req.url,
        method: req.method,
        data: req.data,
        headers: req.headers || {},
        timestamp: new Date(req.timestamp).getTime(),
        priority: req.priority || 50,
      }));
    }) as unknown as PendingRequest[];
  } catch (error) {
    console.error("Error getting stored requests:", error);
    return [];
  }
}

// Compatibilidad con la nueva API
export function removeRequest(requestId: string): void {
  try {
    const idParts = requestId.split("_");
    if (idParts.length > 1) {
      const numericId = parseInt(idParts[1], 10);
      if (!isNaN(numericId)) {
        deleteRequest(numericId).catch((err) =>
          console.error("Error removing request:", err)
        );
      }
    }
  } catch (error) {
    console.error("Error removing request:", error);
  }
}

/**
 * Asigna una prioridad a la solicitud basada en su URL y método
 */
export function getPriorityForRequest(url: string, method: string): number {
  // Auth tiene la mayor prioridad
  if (url.includes("/auth/")) return 100;

  // POST/PUT tienen prioridad media-alta
  if (method === "POST" || method === "PUT") return 80;

  // DELETE tiene prioridad media
  if (method === "DELETE") return 60;

  // GET tiene la prioridad más baja
  return 40;
}
