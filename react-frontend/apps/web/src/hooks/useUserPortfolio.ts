
import * as React from "react";
import { getUserPortfolio } from "@rsd/api";
import type { UserPortfolioResponse, PortfolioStockDto } from "../types/users";

export function useUserPortfolio(userId?: string, seed?: Partial<UserPortfolioResponse>) {
  const [data, setData] = React.useState<UserPortfolioResponse | null>(seed ? {
    userId: String(seed.userId ?? ""),
    username: String(seed.username ?? ""),
    userRole: String(seed.userRole ?? "USER"),
    currentBalance: Number(seed.currentBalance ?? 0),
    stocks: Array.isArray(seed.stocks) ? seed.stocks as PortfolioStockDto[] : [],
  } : null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const abortRef = React.useRef<AbortController | null>(null);

  const refresh = React.useCallback(async () => {
    if (!userId) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError("");
    try {
      const res = (await getUserPortfolio(userId)) as UserPortfolioResponse;
      setData(res);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message ?? "Failed to load portfolio.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    if (!userId) return;
    void refresh();
    return () => abortRef.current?.abort();
  }, [userId, refresh]);

  return { data, loading, error, refresh };
}

function normalizePortfolio(data: Partial<UserPortfolioResponse>, fallback: Partial<UserPortfolioResponse> = {}): UserPortfolioResponse {
  return {
    userId: String(data?.userId ?? fallback.userId ?? ""),
    username: String(data?.username ?? fallback.username ?? ""),
    userRole: String(data?.userRole ?? fallback.userRole ?? "USER"),
    currentBalance:
      typeof data?.currentBalance === "number" && Number.isFinite(data.currentBalance)
        ? data.currentBalance
        : 0,
    stocks: Array.isArray(data?.stocks)
      ? data!.stocks.map((s: any) => ({
          stockName: String(s?.stockName ?? "").trim(),
          pricePerUnit:
            typeof s?.pricePerUnit === "number" && Number.isFinite(s?.pricePerUnit)
              ? s.pricePerUnit
              : 0,
          quantity: typeof s?.quantity === "number" ? s.quantity : 0,
          amount: typeof s?.amount === "number" && Number.isFinite(s?.amount) ? s.amount : 0,
          transactionType: String(s?.transactionType ?? "").trim(),
          transactionDate: String(s?.transactionDate ?? "").trim(),
        }))
      : [],
  };
}

