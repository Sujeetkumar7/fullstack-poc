import { request, requestBlob } from "./http";

export type AnalyticsStartResponse = {
  status: string;
  jobRunId: string;
};

export type AnalyticsStatusResponse = {
  jobId: string;
  status: string;
};

export async function startAnalytics(): Promise<AnalyticsStartResponse> {
  return request<AnalyticsStartResponse>(`/analytics/start`, { method: "GET" });
}

export async function getAnalyticsStatus(
  jobId: string
): Promise<AnalyticsStatusResponse> {
  const safe = encodeURIComponent(jobId);
  return request<AnalyticsStatusResponse>(`/analytics/status?jobId=${safe}`, {
    method: "GET",
  });
}

export async function getDownloadUrl(): Promise<Blob> {
  return requestBlob(`/analytics/download`, { method: "GET" });
}
