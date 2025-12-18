export type Role = "ADMIN" | "USER";

export type UserRow = {
  userId: string;
  username: string;
  currentBalance: number;
  userRole: Role;
};

export type Order = "asc" | "desc";
