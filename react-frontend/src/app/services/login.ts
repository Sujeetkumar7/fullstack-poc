
export type Role = 'ADMIN' | 'USER';
export type User = {
  userId: string;
  username: string;          // <-- backend returns 'username'
  currentBalance: number;
  userRole: Role;            // <-- backend returns 'userRole'
};

const BASE_URL = (import.meta.env.VITE_API_BASE ?? 'http://localhost:8080').replace(/\/+$/, '');

export async function fetchUser(userId: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`User not found (status ${res.status})`);
  }
  return res.json();
}
