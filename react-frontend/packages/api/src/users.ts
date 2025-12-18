import { request } from "./http";

export type UserRole = "ADMIN" | "USER";

export type User = {
  userId: string;
  username: string;
  currentBalance: number;
  userRole: UserRole;
};

export async function getUserById(id: string): Promise<User> {
  const safeId = encodeURIComponent(id);
  return request<User>(`/users/${safeId}`, { method: "GET" });
}

export async function getUsersList(): Promise<User[]> {
  return request<User[]>(`/users`, { method: "GET" });
}
