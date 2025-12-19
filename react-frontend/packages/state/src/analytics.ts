import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import storage from "./storage";
import {
  startAnalytics as apiStart,
  getAnalyticsStatus as apiStatus,
  getDownloadUrl as apiDownload,
} from "@rsd/api";

const POLL_MS = 30_000;

let pollLock = false;

const toUpper = (s: string | null | undefined) => (s ?? "").toUpperCase();
const SUCCESS_STATUSES = new Set(["COMPLETED", "SUCCEEDED"]);
const FAIL_STATUSES = new Set(["FAILED", "ERROR"]);
const isSuccess = (s?: string | null) => SUCCESS_STATUSES.has(toUpper(s));
const isFail = (s?: string | null) => FAIL_STATUSES.has(toUpper(s));

export type CsvSheet = {
  name: string;
  headers: string[];
  rows: (string | number)[][];
  csv?: string;
};

export type AnalyticsState = {
  isRunning: boolean;
  isPolling: boolean;
  status: string | null;
  jobId: string | null;
  xlsxBlob: Blob | null;
  error: string | null;
  csvSheets: CsvSheet[];
  reportFetched: boolean;
};

const initialState: AnalyticsState = {
  isRunning: false,
  isPolling: false,
  status: null,
  jobId: null,
  xlsxBlob: null,
  error: null,
  csvSheets: [],
  reportFetched: false,
};

async function persistState(partial: Partial<AnalyticsState>) {
  if (partial.jobId != null)
    await storage.setItem("analytics.jobId", partial.jobId);
  if (partial.status != null)
    await storage.setItem("analytics.status", partial.status);
  if (partial.csvSheets != null) {
    try {
      await storage.setItem(
        "analytics.csvSheets",
        JSON.stringify(partial.csvSheets)
      );
    } catch {}
  }
  if (partial.reportFetched != null) {
    await storage.setItem(
      "analytics.reportFetched",
      partial.reportFetched ? "1" : "0"
    );
  }
}

export const clearAnalyticsPersistence = createAsyncThunk(
  "analytics/clearPersistence",
  async () => {
    await storage.removeItem("analytics.jobId");
    await storage.removeItem("analytics.status");
    await storage.removeItem("analytics.csvSheets");
    await storage.removeItem("analytics.reportFetched");
  }
);

export const loadPersistedAnalytics = createAsyncThunk(
  "analytics/loadPersisted",
  async () => {
    const jobId = await storage.getItem("analytics.jobId");
    const status = await storage.getItem("analytics.status");
    const reportFetchedRaw = await storage.getItem("analytics.reportFetched");
    const reportFetched = reportFetchedRaw === "1";

    let csvSheets: CsvSheet[] = [];
    try {
      const raw = await storage.getItem("analytics.csvSheets");
      if (raw) csvSheets = JSON.parse(raw) as CsvSheet[];
    } catch {}

    return { jobId, status, csvSheets, reportFetched };
  }
);

export const startAndPollAnalytics = createAsyncThunk<
  { jobId: string; status: string; xlsxBlob: Blob | null },
  void
>(
  "analytics/startAndPoll",
  async (_arg, thunkAPI) => {
    if (pollLock) {
      const s: any = thunkAPI.getState();
      return {
        jobId: (s.analytics.jobId ?? "") as string,
        status: (s.analytics.status ?? "RUNNING") as string,
        xlsxBlob: s.analytics.xlsxBlob ?? null,
      };
    }

    pollLock = true;
    try {
      const { jobRunId, status } = await apiStart();
      const jobId = jobRunId;
      await persistState({ jobId, status });

      let currentStatus = status;

      for (;;) {
        if (thunkAPI.signal.aborted)
          throw new Error("Analytics polling aborted.");

        const s = await apiStatus(jobId);
        currentStatus = s.status;
        await persistState({ jobId, status: currentStatus });

        if (isSuccess(currentStatus)) {
          const st: any = thunkAPI.getState();
          const existingBlob: Blob | null = st?.analytics?.xlsxBlob ?? null;
          const alreadyFetched = st?.analytics?.reportFetched === true;

          if (existingBlob || alreadyFetched) {
            await persistState({ reportFetched: true, status: currentStatus });
            return { jobId, status: currentStatus, xlsxBlob: existingBlob };
          }

          const blob = await apiDownload();
          await persistState({ reportFetched: true });
          return { jobId, status: currentStatus, xlsxBlob: blob };
        }

        if (isFail(currentStatus)) {
          return { jobId, status: currentStatus, xlsxBlob: null };
        }

        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.message ?? "Failed to run analytics.");
    } finally {
      pollLock = false;
    }
  },
  {
    condition: (_arg, { getState }) => {
      const s = getState() as { analytics: AnalyticsState };
      const st = toUpper(s.analytics.status);
      if (s.analytics.isPolling || st === "RUNNING") return false;
      return true;
    },
  }
);

export const fetchAnalyticsReport = createAsyncThunk<Blob, void>(
  "analytics/fetchReport",
  async (_arg, thunkAPI) => {
    try {
      const blob = await apiDownload();
      await persistState({ reportFetched: true });
      return blob;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(
        e?.message ?? "Failed to download report."
      );
    }
  }
);

export const setCsvSheets = createAsyncThunk<CsvSheet[], CsvSheet[]>(
  "analytics/setCsvSheets",
  async (sheets, _thunkAPI) => {
    await persistState({ csvSheets: sheets });
    return sheets;
  }
);

export const resumeAnalyticsFromStorage = createAsyncThunk<
  { jobId: string; status: string; xlsxBlob: Blob | null } | null,
  void
>(
  "analytics/resumeFromStorage",
  async (_arg, thunkAPI) => {
    if (pollLock) {
      const s: any = thunkAPI.getState();
      return {
        jobId: (s.analytics.jobId ?? "") as string,
        status: (s.analytics.status ?? "RUNNING") as string,
        xlsxBlob: s.analytics.xlsxBlob ?? null,
      };
    }

    pollLock = true;
    try {
      const jobId = await storage.getItem("analytics.jobId");
      const status = await storage.getItem("analytics.status");
      if (!jobId) return null;

      const st0: any = thunkAPI.getState();
      const hasBlob = !!st0?.analytics?.xlsxBlob;
      const hasCsv =
        Array.isArray(st0?.analytics?.csvSheets) &&
        st0.analytics.csvSheets.length > 0;
      const alreadyFetched = st0?.analytics?.reportFetched === true;

      if (isSuccess(status)) {
        if (hasBlob || hasCsv || alreadyFetched) {
          return {
            jobId,
            status: toUpper(status),
            xlsxBlob: st0.analytics.xlsxBlob ?? null,
          };
        }
        const blob = await apiDownload();
        await persistState({ reportFetched: true });
        return { jobId, status: toUpper(status), xlsxBlob: blob };
      }

      if (isFail(status)) {
        return { jobId, status: toUpper(status), xlsxBlob: null };
      }

      let currentStatus = status ?? "RUNNING";
      for (;;) {
        if (thunkAPI.signal.aborted)
          throw new Error("Analytics polling aborted.");

        const s = await apiStatus(jobId);
        currentStatus = s.status;
        await persistState({ jobId, status: currentStatus });

        if (isSuccess(currentStatus)) {
          const st1: any = thunkAPI.getState();
          const haveBlob = !!st1?.analytics?.xlsxBlob;
          const haveCsv =
            Array.isArray(st1?.analytics?.csvSheets) &&
            st1.analytics.csvSheets.length > 0;
          const fetched = st1?.analytics?.reportFetched === true;

          if (haveBlob || haveCsv || fetched) {
            return {
              jobId,
              status: currentStatus,
              xlsxBlob: st1.analytics.xlsxBlob ?? null,
            };
          }
          const blob = await apiDownload();
          await persistState({ reportFetched: true });
          return { jobId, status: currentStatus, xlsxBlob: blob };
        }

        if (isFail(currentStatus)) {
          return { jobId, status: currentStatus, xlsxBlob: null };
        }

        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } catch (e: any) {
      return thunkAPI.rejectWithValue(
        e?.message ?? "Failed to resume analytics."
      );
    } finally {
      pollLock = false;
    }
  },
  {
    condition: (_arg, { getState }) => {
      const s = getState() as { analytics: AnalyticsState };
      if (s.analytics.isPolling) return false;
      const st = toUpper(s.analytics.status);
      return st === "RUNNING";
    },
  }
);

const slice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    resetAnalytics(state) {
      state.isRunning = false;
      state.isPolling = false;
      state.status = null;
      state.jobId = null;
      state.xlsxBlob = null;
      state.error = null;
      state.csvSheets = [];
      state.reportFetched = false;
    },
    clearReport(state) {
      state.xlsxBlob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPersistedAnalytics.fulfilled, (state, action) => {
        const { jobId, status, csvSheets, reportFetched } = action.payload as {
          jobId: string | null;
          status: string | null;
          csvSheets: CsvSheet[];
          reportFetched: boolean;
        };
        state.jobId = jobId;
        state.status = status;
        state.csvSheets = Array.isArray(csvSheets) ? csvSheets : [];
        state.reportFetched = !!reportFetched;
        state.isRunning = toUpper(status) === "RUNNING";
        state.isPolling = false;
        state.csvSheets =
          toUpper(status) === "RUNNING"
            ? []
            : Array.isArray(csvSheets)
            ? csvSheets
            : [];
      })

      .addCase(startAndPollAnalytics.pending, (state) => {
        state.isPolling = true;
        state.isRunning = true;
        state.error = null;
        state.xlsxBlob = null;
        state.status = "RUNNING";
        state.csvSheets = [];
        state.reportFetched = false;
      })
      .addCase(startAndPollAnalytics.fulfilled, (state, action) => {
        state.isPolling = false;
        state.isRunning = false;
        state.jobId = action.payload.jobId;
        state.status = action.payload.status;
        state.xlsxBlob = action.payload.xlsxBlob;
        state.reportFetched = !!action.payload.xlsxBlob;
      })
      .addCase(startAndPollAnalytics.rejected, (state, action) => {
        state.isPolling = false;
        state.isRunning = false;
        state.error = String(
          (action as any).payload ?? action.error.message ?? "Unknown error"
        );
      })

      .addCase(
        fetchAnalyticsReport.fulfilled,
        (state, action: PayloadAction<Blob>) => {
          state.xlsxBlob = action.payload;
          state.reportFetched = true;
        }
      )
      .addCase(fetchAnalyticsReport.rejected, (state, action) => {
        state.error = String(
          (action as any).payload ?? action.error.message ?? "Unknown error"
        );
      })

      .addCase(setCsvSheets.fulfilled, (state, action) => {
        state.csvSheets = action.payload;
      })

      .addCase(clearAnalyticsPersistence.fulfilled, (state) => {
        state.jobId = null;
        state.status = null;
        state.csvSheets = [];
        state.reportFetched = false;
      })

      .addCase(resumeAnalyticsFromStorage.pending, (state) => {
        state.isPolling = true;
        state.error = null;
      })
      .addCase(resumeAnalyticsFromStorage.fulfilled, (state, action) => {
        state.isPolling = false;
        state.isRunning = false;
        if (action.payload) {
          state.jobId = action.payload.jobId;
          state.status = action.payload.status;
          state.xlsxBlob = action.payload.xlsxBlob;
        }
      })
      .addCase(resumeAnalyticsFromStorage.rejected, (state, action) => {
        state.isPolling = false;
        state.isRunning = false;
        state.error = String(
          (action as any).payload ?? action.error.message ?? "Unknown error"
        );
      });
  },
});

export const { resetAnalytics, clearReport } = slice.actions;
export default slice.reducer;

export const selectAnalytics = (s: any): AnalyticsState => s.analytics;
export const selectAnalyticsRunning = (s: any): boolean =>
  s.analytics.isRunning;
export const selectAnalyticsStatus = (s: any): string | null =>
  s.analytics.status;
export const selectAnalyticsReady = (s: any): boolean =>
  SUCCESS_STATUSES.has(toUpper(s.analytics.status));
export const selectAnalyticsBlob = (s: any): Blob | null =>
  s.analytics.xlsxBlob;
export const selectAnalyticsError = (s: any): string | null =>
  s.analytics.error;
export const selectAnalyticsCsvSheets = (s: any): CsvSheet[] =>
  s.analytics.csvSheets;
export const selectAnalyticsReportFetched = (s: any): boolean =>
  s.analytics.reportFetched;
``;
