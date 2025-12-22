
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import storage from "./storage";
import { getUserByUsername } from "@rsd/api";

/** Role type (adjust if you have fixed roles) */
export type Role = "USER" | "ADMIN" | string;

/** Matches backend PortfolioStockDto shape */
export interface PortfolioStockDto {
  stockName: string;
  pricePerUnit: number;
  quantity: number;
  amount: number;
  transactionType: string;   // e.g., "BUY" | "SELL"
  transactionDate: string;   // ISO / formatted string
}

/** Matches backend top-level response UserPortfolioResponse */
export interface UserPortfolioResponse {
  userId: string;
  username: string;
  userRole: Role;
  currentBalance: number;
  stocks: PortfolioStockDto[];
}

/** Front-end slice user model */
export type User = {
  userId: string;
  username: string;
  currentBalance: number;
  userRole: Role;
  stocks: PortfolioStockDto[];
};

type AuthState = {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

const STORAGE_KEY = "rsd_user";

/** For hydration from storage; we accept partials of the front-end User */
type StoredUser = Partial<User>;

/**
 * Normalize backend API response to front-end User shape.
 * - Enforces strings for userId/username/userRole
 * - Validates numbers for currentBalance/stock numeric fields
 * - Ensures stocks is an array (defaults to empty)
 */
const normalizeUserPortfolio = (
  raw: Partial<UserPortfolioResponse>,
  fallbackUsername?: string
): User => {
  const userId = String(raw?.userId ?? "").trim();
  const username = String(raw?.username ?? fallbackUsername ?? "").trim();
  const userRole: Role = (raw?.userRole ?? "USER") as Role;

  const balanceRaw = raw?.currentBalance;
  const currentBalance =
    typeof balanceRaw === "number" && Number.isFinite(balanceRaw) ? balanceRaw : 0;

  const stocks: PortfolioStockDto[] = Array.isArray(raw?.stocks)
    ? raw!.stocks.map((s: any) => ({
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
    : [];

    console.log(username, userRole, stocks)
  return { userId, username, userRole, currentBalance, stocks };
};

/**
 * Normalize stored user (already in front-end shape) defensively.
 * Useful if older versions stored slightly different shapes.
 */
const normalizeStoredUser = (raw: StoredUser): User => {
  return {
    userId: String(raw?.userId ?? "").trim(),
    username: String(raw?.username ?? "").trim(),
    userRole: (raw?.userRole ?? "USER") as Role,
    currentBalance:
      typeof raw?.currentBalance === "number" && Number.isFinite(raw.currentBalance)
        ? raw.currentBalance
        : 0,
    stocks: Array.isArray(raw?.stocks) ? raw!.stocks.map((s) => ({
      stockName: String(s?.stockName ?? "").trim(),
      pricePerUnit:
        typeof s?.pricePerUnit === "number" && Number.isFinite(s?.pricePerUnit)
          ? s.pricePerUnit
          : 0,
      quantity: typeof s?.quantity === "number" ? s.quantity : 0,
      amount: typeof s?.amount === "number" && Number.isFinite(s?.amount) ? s.amount : 0,
      transactionType: String(s?.transactionType ?? "").trim(),
      transactionDate: String(s?.transactionDate ?? "").trim(),
    })) : [],
  };
};

export const hydrateAuth = createAsyncThunk<User | null>(
  "auth/hydrate",
  async () => {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as StoredUser;
      // Already front-end shape; still normalize defensively
      return normalizeStoredUser(parsed);
    } catch {
      // If parse fails, clear corrupted storage
      await storage.removeItem(STORAGE_KEY);
      return null;
    }
  }
);

export const loginUser = createAsyncThunk<User, string>(
  "auth/loginUser",
  async (username) => {
    try {
      // Expecting UserPortfolioResponse from backend
      const apiUser = (await getUserByUsername(username)) as UserPortfolioResponse;
      const user = normalizeUserPortfolio(apiUser, username);
      await storage.setItem(STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (e: any) {
      throw new Error(e?.message ?? "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk<void>(
  "auth/logoutUser",
  async () => {
    await storage.removeItem(STORAGE_KEY);
  }
);

const initialState: AuthState = { user: null, status: "idle", error: null };

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSucceeded(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
      })
      .addCase(hydrateAuth.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.error?.message ?? null;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "succeeded";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message ?? "Login failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.error = null;
      });
  },
});

export const { loginSucceeded, logout } = slice.actions;
export const authReducer = slice.reducer;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.user;
