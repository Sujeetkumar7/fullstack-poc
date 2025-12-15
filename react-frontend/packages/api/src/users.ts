import { request } from "./http";

export type User = {
  id?: string;
  username?: string;
};

export async function getUserById(id: string): Promise<User> {
  const safeId = encodeURIComponent(id);
  return await request<User>(`/users/${safeId}`, { method: "GET" });
}
