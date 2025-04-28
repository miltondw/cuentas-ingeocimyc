import api from "@api";
import { getPendingRequests, deleteRequest } from "./offlineStorage";

export async function syncPendingRequests() {
  if (!navigator.onLine) return;

  const requests = await getPendingRequests();
  for (const request of requests) {
    try {
      await api({
        url: request.url,
        method: request.method,
        data: request.data,
        headers: request.headers,
      });
      await deleteRequest(request.id);
      console.log(`Sincronización exitosa para ${request.url}`);
    } catch (error) {
      console.error(`Error al sincronizar ${request.url}:`, error);
    }
  }
}
