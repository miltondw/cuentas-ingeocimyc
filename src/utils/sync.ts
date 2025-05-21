import api from "@api/index";
import { getPendingRequests, deleteRequest } from "@utils/offlineStorage";

export async function syncPendingRequests(): Promise<void> {
  if (!navigator.onLine) {
    console.warn("Cannot sync: No internet connection");
    return;
  }

  const requests = await getPendingRequests();
  for (const request of requests) {
    try {
      await api({
        url: request.url,
        method: request.method,
        data: request.data,
        headers: request.headers,
      });
      if (request.id !== undefined) {
        await deleteRequest(request.id);
      }
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
