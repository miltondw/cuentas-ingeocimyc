import apiClient from "@/lib/axios/apiClient";
import { getStoredRequests, removeRequest } from "@/utils/offlineStorage";

export async function syncPendingRequests(): Promise<void> {
  if (!navigator.onLine) {
    console.warn("Cannot sync: No internet connection");
    return;
  }

  const requests = getStoredRequests();
  if (requests.length === 0) {
    return;
  }

  console.log(`Synchronizing ${requests.length} pending requests...`);

  // Ordenar por prioridad (mayor prioridad primero)
  const sortedRequests = [...requests].sort((a, b) => b.priority - a.priority);

  for (const request of sortedRequests) {
    try {
      await apiClient({
        url: request.url,
        method: request.method as "get" | "post" | "put" | "delete" | "patch",
        data: request.data,
        headers: request.headers,
      });
      removeRequest(request.id);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as {
          response?: {
            status?: number;
            data?: { message?: string };
          };
          message?: string;
        };
        if (err.response?.status === 401) {
          console.error(
            `Authentication error for ${request.url}:`,
            err.response?.data?.message || "Unauthorized"
          );
        } else if (err.response?.status === 429) {
          console.error(
            `Rate limit exceeded for ${request.url}:`,
            err.response?.data?.message || "Too many requests"
          );
        } else {
          console.error(
            `Failed to sync ${request.url}:`,
            err.response?.data?.message || err.message
          );
        }
      } else {
        console.error(
          `Failed to sync ${request.url}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  }
}
