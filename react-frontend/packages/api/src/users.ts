import { request } from "./http";

export type UserRole = "ADMIN" | "USER";

export type User = {
  userId: string;
  username: string;
  currentBalance: number;
  userRole: UserRole;
};

export type UserRequest = {
  username: string;
  userRole: UserRole | string;
  currentBalance: number | string;
};

export type UserResponse = User;

export async function getUserByUsername(
  username: string
): Promise<UserResponse> {
  const safe = encodeURIComponent(username);
  return request<UserResponse>(`/users/${safe}`, { method: "GET" });
}

export async function getUsersList(): Promise<UserResponse[]> {
  return request<UserResponse[]>(`/users`, { method: "GET" });
}

export async function createUser(user: UserRequest): Promise<UserResponse> {
  const payload = {
    username: user.username,
    userRole: user.userRole as UserRole,
    currentBalance:
      typeof user.currentBalance === "string"
        ? Number(user.currentBalance)
        : user.currentBalance,
  };
  return request<UserResponse>(`/users`, {
    method: "POST",
    body: payload,
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateUser(
  userId: string,
  user: UserResponse
): Promise<string> {
  const safe = encodeURIComponent(userId);
  return request<string>(`/users/${safe}`, {
    method: "PUT",
    body: user,
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteUser(userId: string): Promise<string> {
  const safe = encodeURIComponent(userId);
  return request<string>(`/users/${safe}`, {
    method: "DELETE",
  });
}
