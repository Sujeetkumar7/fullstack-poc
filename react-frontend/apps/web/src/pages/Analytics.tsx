import * as React from "react";
import { html, css } from "react-strict-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUser, selectAuthStatus, logoutUser } from "@rsd/state";
import { Header, Sidebar, SheetsViewer } from "@rsd/ui";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/PlayArrow";

import * as XLSX from "xlsx";

import {
  startAndPollAnalytics,
  fetchAnalyticsReport,
  loadPersistedAnalytics,
  setCsvSheets,
  selectAnalyticsRunning,
  selectAnalyticsReady,
  selectAnalyticsBlob,
  selectAnalyticsStatus,
  selectAnalyticsError,
  selectAnalyticsCsvSheets,
  resetAnalytics,
  clearAnalyticsPersistence,
  resumeAnalyticsFromStorage,
} from "@rsd/state";

type Sheet = {
  name: string;
  headers: string[];
  rows: (string | number)[][];
  csv?: string;
};

const tokens = { headerH: 56, sidebarW: 240 };

const styles = css.create({
  page: { minHeight: "100vh", backgroundColor: "#f8fafc", width: "100%" },
  content: {
    marginTop: tokens.headerH,
    padding: 0,
    marginLeft: tokens.sidebarW,
  },
  contentFull: { marginLeft: 0 },
  fullWidth: {
    width: "100%",
    maxWidth: "none",
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    boxSizing: "border-box",
  },

  sheetShell: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "calc(100vh - 260px)",
    WebkitOverflowScrolling: "touch",
  },

  sheetInner: {
    minWidth: 980,
  },

  sheetShellTablet: {
    paddingTop: 4,
    paddingBottom: 8,
  },
});

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectUser);
  const loadStatus = useAppSelector(selectAuthStatus);

  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setSidebarOpen(!mql.matches);
    const handleChange = (ev: MediaQueryListEvent) =>
      setSidebarOpen(!ev.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const [isTablet, setIsTablet] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsTablet(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const handleLogout = async () => {
    await dispatch(clearAnalyticsPersistence());
    dispatch(resetAnalytics());
    await dispatch(logoutUser()).unwrap();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { key: "users", label: "User Management", route: "/admin", icon: "👥" },
    { key: "analytics", label: "Analytics", route: "/analytics", icon: "📊" },
  ];
  const activeKey =
    menuItems.find((m) => m.route === location.pathname)?.key ?? "analytics";
  const onNavigate = (route: string) => {
    navigate(route);
    if (window.matchMedia("(max-width: 768px)").matches) setSidebarOpen(false);
  };

  const didInitRef = React.useRef(false);
  React.useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    (async () => {
      const res: any = await dispatch(loadPersistedAnalytics());
      const persistedStatus = (res?.payload?.status ?? "").toUpperCase();
      if (persistedStatus === "RUNNING") {
        dispatch(resumeAnalyticsFromStorage());
      }
    })();
  }, [dispatch]);

  const isRunning = useAppSelector(selectAnalyticsRunning);
  const isReady = useAppSelector(selectAnalyticsReady);
  const xlsxBlob = useAppSelector(selectAnalyticsBlob);
  const statusText = useAppSelector(selectAnalyticsStatus);
  const errorText = useAppSelector(selectAnalyticsError);
  const persistedSheets = useAppSelector(selectAnalyticsCsvSheets);

  const upperStatus = (statusText ?? "").toUpperCase();
  const isEffectivelyRunning = React.useMemo(
    () => isRunning || upperStatus === "RUNNING",
    [isRunning, upperStatus]
  );
  const isSuccessful = React.useMemo(
    () => isReady || upperStatus === "SUCCEEDED" || upperStatus === "COMPLETED",
    [isReady, upperStatus]
  );

  const formatDateYmd = (d: Date): string => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const excelSerialToDate = (n: number): Date => {
    const ms = (n - 25569) * 86400000;
    return new Date(ms);
  };

  const isNumericLike = (s: string): boolean =>
    /^-?\d+(\.\d+)?$/.test(s.trim());
  const isExcelSerialInRange = (n: number): boolean =>
    Number.isInteger(n) && n >= 40000 && n <= 60000;

  const isDateString = (s: string): boolean => {
    const t = s.trim();
    if (!t) return false;
    const iso =
      /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/;
    const dmyText = /^\d{1,2}-[A-Za-z]{3}-\d{4}$/;
    return iso.test(t) || dmyText.test(t);
  };

  const parseDateStringToDate = (s: string): Date | null => {
    const t = s.trim();
    if (!t) return null;

    const d1 = new Date(t);
    if (!isNaN(d1.getTime())) return d1;

    const dmyText = /^\d{1,2}-[A-Za-z]{3}-\d{4}$/;
    if (dmyText.test(t)) {
      const [dayStr, monStr, yearStr] = t.split("-");
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const mi = months.findIndex(
        (m) => m.toLowerCase() === monStr.toLowerCase()
      );
      if (mi >= 0) {
        const d = parseInt(dayStr, 10);
        const y = parseInt(yearStr, 10);
        const res = new Date(Date.UTC(y, mi, d));
        if (!isNaN(res.getTime())) return res;
      }
    }

    return null;
  };

  const DATE_HEADER_HINTS = [
    "date",
    "created",
    "updated",
    "posted",
    "transaction",
    "invoice",
    "report",
    "start",
    "end",
    "from",
    "to",
    "effective",
    "expiry",
  ];
  const NON_DATE_HEADER_HINTS = [
    "id",
    "amount",
    "balance",
    "total",
    "qty",
    "quantity",
    "price",
    "rate",
    "count",
    "number",
    "score",
    "index",
  ];
  const headerHasAny = (h: string | undefined, words: string[]) =>
    !!h && words.some((w) => h.toLowerCase().includes(w.toLowerCase()));

  const isDateLikeCell = (val: unknown): boolean => {
    if (val instanceof Date) return true;

    if (typeof val === "number") {
      return isExcelSerialInRange(val);
    }

    if (typeof val === "string") {
      const t = val.trim();
      if (!t) return false;

      if (/^-?\d+$/.test(t)) {
        const n = Number(t);
        return isExcelSerialInRange(n);
      }

      return isDateString(t);
    }

    return false;
  };

  const formatIfDateLike = (val: unknown): string | number => {
    if (val instanceof Date) return formatDateYmd(val);

    if (typeof val === "number" && isExcelSerialInRange(val)) {
      return formatDateYmd(excelSerialToDate(val));
    }

    if (typeof val === "string") {
      const t = val.trim();
      if (/^-?\d+$/.test(t)) {
        const n = Number(t);
        if (isExcelSerialInRange(n)) return formatDateYmd(excelSerialToDate(n));
      }
      if (isDateString(t)) {
        const d = parseDateStringToDate(t);
        if (d) return formatDateYmd(d);
      }
      return val;
    }

    if (typeof val === "boolean") return val ? "true" : "false";
    try {
      const s = JSON.stringify(val);
      return s ?? "";
    } catch {
      return String(val);
    }
  };

  const inferDateColumns = (
    headers: string[],
    rows: unknown[][],
    sampleCount: number = 50,
    threshold: number = 0.8,
    minDateSamples: number = 4
  ): boolean[] => {
    const cols = headers.length;
    const isDateCol = Array.from({ length: cols }, () => false);
    if (cols === 0 || rows.length === 0) return isDateCol;

    const limit = Math.min(sampleCount, rows.length);

    for (let c = 0; c < cols; c++) {
      const header = headers[c];
      const headerLooksDate = headerHasAny(header, DATE_HEADER_HINTS);
      const headerLooksNonDate = headerHasAny(header, NON_DATE_HEADER_HINTS);

      if (headerLooksNonDate) {
        isDateCol[c] = false;
        continue;
      }

      let dateLike = 0;
      let nonEmpty = 0;
      let decimals = 0;
      let yearOutOfRange = 0;

      for (let r = 0; r < limit; r++) {
        const cell = rows[r]?.[c];
        if (cell === undefined || cell === null || cell === "") continue;
        nonEmpty++;

        if (typeof cell === "number" && !Number.isInteger(cell)) decimals++;
        if (typeof cell === "string" && /^\d+\.\d+$/.test(cell.trim()))
          decimals++;

        if (isDateLikeCell(cell)) {
          dateLike++;

          if (
            typeof cell === "number" &&
            Number.isInteger(cell) &&
            isExcelSerialInRange(cell)
          ) {
            const y = excelSerialToDate(cell).getUTCFullYear();
            if (y < 1990 || y > 2100) yearOutOfRange++;
          }
          if (typeof cell === "string" && /^\d+$/.test(cell.trim())) {
            const n = Number(cell);
            if (isExcelSerialInRange(n)) {
              const y = excelSerialToDate(n).getUTCFullYear();
              if (y < 1990 || y > 2100) yearOutOfRange++;
            }
          }
        }
      }

      const decimalRatio = nonEmpty > 0 ? decimals / nonEmpty : 0;
      if (decimalRatio > 0.2) {
        isDateCol[c] = false;
        continue;
      }

      const ratio = nonEmpty > 0 ? dateLike / nonEmpty : 0;

      const neededRatio = headerLooksDate ? 0.6 : threshold;
      const neededMinSamples = headerLooksDate
        ? Math.max(2, Math.floor(minDateSamples * 0.75))
        : minDateSamples;

      isDateCol[c] =
        nonEmpty > 0 &&
        dateLike >= neededMinSamples &&
        ratio >= neededRatio &&
        yearOutOfRange === 0;
    }

    return isDateCol;
  };

  const normalizeRowWithDateCols = (
    headers: string[],
    row: unknown[],
    isDateCol: boolean[]
  ): (string | number)[] =>
    Array.from({ length: headers.length }, (_, i) => {
      const val = row[i];
      return isDateCol[i]
        ? formatIfDateLike(val)
        : typeof val === "string" || typeof val === "number"
        ? val
        : String(val ?? "");
    });

  const escapeCsv = (v: string | number): string => {
    const s = String(v ?? "");
    const needsQuotes = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const [sheets, setSheets] = React.useState<Sheet[]>([]);

  React.useEffect(() => {
    let cancelled = false;

    const toCsv = (sheet: Sheet): string =>
      [sheet.headers, ...sheet.rows]
        .map((row) => row.map(escapeCsv).join(","))
        .join("\n");

    async function parseBlob(blob: Blob) {
      const buf = await blob.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });

      const parsed: Sheet[] = wb.SheetNames.map((name) => {
        const ws = wb.Sheets[name];
        const aoa = XLSX.utils.sheet_to_json<any[]>(ws, {
          header: 1,
          raw: true,
        });

        const headers = (aoa.shift() ?? []).map((h) => String(h));
        const rawRows: unknown[][] = aoa;

        const dateCols = inferDateColumns(headers, rawRows);

        const rows: (string | number)[][] = rawRows.map((row) =>
          normalizeRowWithDateCols(headers, row, dateCols)
        );

        return { name, headers, rows };
      });

      if (!cancelled) {
        setSheets(parsed);
        const payload = parsed.map((s) => ({ ...s, csv: toCsv(s) }));
        await dispatch(setCsvSheets(payload));
      }
    }

    setSheets([]);

    if ((isSuccessful || !isEffectivelyRunning) && xlsxBlob) {
      parseBlob(xlsxBlob);
    }

    return () => {
      cancelled = true;
    };
  }, [xlsxBlob, dispatch, isEffectivelyRunning, isSuccessful]);

  React.useEffect(() => {
    if (isEffectivelyRunning && !isSuccessful) {
      setSheets([]);
    }
  }, [isEffectivelyRunning, isSuccessful]);

  const onRun = () => {
    setSheets([]);
    dispatch(startAndPollAnalytics());
  };

  const downloadXlsxReport = async () => {
    let blob = xlsxBlob;
    if (!blob && isSuccessful) {
      const res = await dispatch(fetchAnalyticsReport());
      if (fetchAnalyticsReport.fulfilled.match(res)) {
        blob = res.payload as Blob;
      }
    }
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-report.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sheetsToShow: Sheet[] = React.useMemo(() => {
    if (!isSuccessful && isEffectivelyRunning) return [];
    const base = (sheets.length ? sheets : persistedSheets) || [];

    return base.map((sh) => {
      const headers = sh.headers ?? [];
      const rawRows = sh.rows as unknown[][];
      const dateCols = inferDateColumns(headers, rawRows);
      const normalizedRows: (string | number)[][] = rawRows.map((row) =>
        normalizeRowWithDateCols(headers, row, dateCols)
      );
      return { ...sh, rows: normalizedRows };
    });
  }, [sheets, persistedSheets, isEffectivelyRunning, isSuccessful]);

  const friendlyStatus = (() => {
    const st = upperStatus;
    if (!isSuccessful && isEffectivelyRunning) return "Analytics is running…";
    if (isSuccessful) return "Analytics completed. Report is ready.";
    if (st === "FAILED" || st === "ERROR" || errorText)
      return "Analytics failed.";
    return statusText ?? "";
  })();

  if (loadStatus === "loading") return <html.div>Loading…</html.div>;

  return (
    <html.div style={styles.page}>
      <Header
        title="Admin Dashboard"
        username={authUser?.username}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <Sidebar
        open={sidebarOpen}
        menuItems={menuItems}
        activeKey={activeKey}
        onItemClick={(item) => onNavigate(item.route)}
        onClose={() => setSidebarOpen(false)}
      />

      <html.main
        style={[styles.content, sidebarOpen ? false : styles.contentFull]}
      >
        <html.div style={styles.fullWidth}>
          <Card elevation={3} sx={{ mt: 3 }}>
            <CardHeader
              title={<Typography variant="h6">Analytics</Typography>}
              action={
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={onRun}
                  disabled={isEffectivelyRunning && !isSuccessful} // ⬅️ disable only when actually running and not successful
                >
                  {isEffectivelyRunning && !isSuccessful
                    ? "Running..."
                    : isSuccessful
                    ? "Run Again"
                    : "Run Analytics"}
                </Button>
              }
            />
            <CardContent>
              {friendlyStatus ? (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {friendlyStatus}
                </Typography>
              ) : null}
              {errorText ? (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  {errorText}
                </Typography>
              ) : null}
              {isSuccessful ||
              (!isEffectivelyRunning && sheetsToShow.length > 0) ? (
                <>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={downloadXlsxReport}
                    >
                      Download Report
                    </Button>
                  </Stack>

                  <html.div
                    style={[
                      styles.sheetShell,
                      isTablet ? styles.sheetShellTablet : false,
                    ]}
                  >
                    <html.div style={styles.sheetInner}>
                      <SheetsViewer sheets={sheetsToShow} />
                    </html.div>
                  </html.div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </html.div>
      </html.main>
    </html.div>
  );
}
``;
