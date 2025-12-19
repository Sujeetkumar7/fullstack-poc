import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import storage from "./storage";
import { getUserByUsername } from "@rsd/api";

// Slice-level user (required fields)
export type User = {
  userId: string;
  username: string;
  currentBalance: number;
  userRole: string;
};

type AuthState = {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

const STORAGE_KEY = "rsd_user";

type RawUser = {
  userId?: string;
  username?: string;
  currentBalance?: number;
  userRole?: string;
};

const normalizeUser = (raw: RawUser, inputUsername?: string): User => ({
  userId: String(raw.userId ?? ""),
  username: String(raw.username ?? inputUsername ?? ""),
  currentBalance: Number(raw.currentBalance ?? 0),
  userRole: String(raw.userRole ?? "USER"),
});

export const hydrateAuth = createAsyncThunk<User | null>(
  "auth/hydrate",
  async () => {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as RawUser;
    return normalizeUser(parsed, parsed.username);
  }
);

export const loginUser = createAsyncThunk<User, string>(
  "auth/loginUser",
  async (username) => {
    try {
      const apiUser = await getUserByUsername(username);
      const user = normalizeUser(apiUser as RawUser, username);
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
export const selectAuthStatus = (state: { auth: AuthState }) =>
  state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.user;
