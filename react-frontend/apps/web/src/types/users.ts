export type Role = "ADMIN" | "USER";

export type UserRow = {
  userId: string;
  username: string;
  currentBalance: number;
  userRole: Role;
};

export type Order = "asc" | "desc";

export type PortfolioStockDto = {
  stockName: string;
  pricePerUnit: number;
  quantity: number;
  amount: number;
  transactionType: string;
  transactionDate: string;
};

export type UserPortfolioResponse = {
  userId: string;
  username: string;
  userRole: string;
  currentBalance: number;
  stocks: PortfolioStockDto[];
};
