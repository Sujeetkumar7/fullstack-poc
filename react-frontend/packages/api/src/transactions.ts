import { request } from "./http";

export type Transaction = {
  transactionId: string;
  transactionType: string;
  amount: number;
  timestamp: string;
  username: string;
  userId: string;
  fromUsername:string;
  toUsername:string;
};

export async function saveTransaction(body: any) {
  return request<any>("/transaction/transfer", {
    method: "POST",
    body,
  });
}

export async function getTransactionHistory(userId: string) {
  if (!userId) throw new Error("Missing userId");
  const url = `/transaction/history?userId=${encodeURIComponent(userId)}`;
  return request<Transaction[]>(url, { method: "GET" });
}