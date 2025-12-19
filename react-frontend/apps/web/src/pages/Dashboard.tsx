import * as React from "react";
import { html, css } from "react-strict-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUser, selectAuthStatus, logoutUser } from "@rsd/state";
import { Header, Sidebar } from "@rsd/ui";
import {
  getUsersList,
  createUser,
  updateUser,
  deleteUser as deleteUserApi,
} from "@rsd/api";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Stack,
  InputAdornment,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import UsersTable from "../components/UserTable";
import UserAddEditDialog from "../components/AddEditDialog";
import ConfirmDialog from "../components/ConfirmDialog";

import type { Role, UserRow } from "../types/users";

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
});

type Order = "asc" | "desc";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  const av = (a as any)[orderBy];
  const bv = (b as any)[orderBy];
  if (bv < av) return -1;
  if (bv > av) return 1;
  return 0;
}
function getComparator<T>(
  order: Order,
  orderBy: keyof T
): (a: T, b: T) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
function stableSort<T>(array: T[], comparator: (a: T, b: T) => number): T[] {
  const stabilized = array.map((el, index) => [el, index] as const);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);

  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setSidebarOpen(!mql.matches);
    const handleChange = (ev: MediaQueryListEvent) =>
      setSidebarOpen(!ev.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { key: "users", label: "User Management", route: "/admin", icon: "👥" },
    { key: "analytics", label: "Analytics", route: "/analytics", icon: "📊" },
  ];
  const activeKey =
    menuItems.find((m) => m.route === location.pathname)?.key ?? "users";
  const onNavigate = (route: string) => {
    navigate(route);
    if (window.matchMedia("(max-width: 768px)").matches) setSidebarOpen(false);
  };

  if (status === "loading") return <html.div>Loading…</html.div>;

  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");

  const hasFetched = React.useRef(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const inflight = React.useRef(false);

  const toRow = (u: {
    userId: string;
    username: string;
    currentBalance: number;
    userRole: Role | string;
  }): UserRow => ({
    userId: u.userId,
    username: u.username,
    currentBalance: u.currentBalance,
    userRole: (u.userRole as Role) ?? "USER",
  });

  const loadUsers = React.useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const ac = new AbortController();
    abortRef.current = ac;

    if (inflight.current) return;
    inflight.current = true;

    setLoading(true);
    setError("");
    try {
      const data = await getUsersList();
      setRows(data.map(toRow));
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        const msg =
          e?.message ??
          (typeof e === "string" ? e : "Failed to load users. Please retry.");
        setError(msg);
      }
    } finally {
      inflight.current = false;
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    void loadUsers();
  }, [loadUsers]);

  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.userId, r.username, r.userRole].some((v) =>
        String(v).toLowerCase().includes(q)
      )
    );
  }, [rows, query]);

  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof UserRow>("username");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const sorted = stableSort<UserRow>(
    filtered,
    getComparator<UserRow>(order, orderBy)
  );
  const paged = sorted.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: keyof UserRow
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const handleChangePage = (_evt: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [openAddEdit, setOpenAddEdit] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<
    Partial<UserRow> | undefined
  >(undefined);

  const [saveError, setSaveError] = React.useState<string>(""); // inline save error

  const openAddUser = () => {
    setEditMode(false);
    setEditingUser(undefined);
    setSaveError("");
    setOpenAddEdit(true);
  };
  const onEditUser = (u: UserRow) => {
    setEditMode(true);
    setEditingUser(u);
    setSaveError("");
    setOpenAddEdit(true);
  };

  const onSubmitUser = async (payload: {
    userId?: string;
    username: string;
    currentBalance: number;
    userRole: Role;
  }) => {
    try {
      setSaveError("");

      if (editMode && payload.userId) {
        await updateUser(payload.userId, {
          userId: payload.userId,
          username: payload.username,
          currentBalance: payload.currentBalance,
          userRole: payload.userRole,
        });
        setRows((prev) =>
          prev.map((r) =>
            r.userId === payload.userId
              ? {
                  ...r,
                  username: payload.username,
                  currentBalance: payload.currentBalance,
                  userRole: payload.userRole,
                }
              : r
          )
        );
      } else {
        const created = await createUser({
          username: payload.username,
          currentBalance: payload.currentBalance,
          userRole: payload.userRole,
        });

        const newRow: UserRow = {
          userId:
            (created as any)?.userId ?? `U${String(Date.now()).slice(-4)}`,
          username: (created as any)?.username ?? payload.username,
          currentBalance:
            typeof (created as any)?.currentBalance === "number"
              ? (created as any).currentBalance
              : payload.currentBalance,
          userRole: (created as any)?.userRole
            ? ((created as any).userRole as Role)
            : (payload.userRole as Role),
        };

        setRows((prev) => [newRow, ...prev]);
      }

      setOpenAddEdit(false);
    } catch (e: any) {
      const msg =
        e?.message ?? (typeof e === "string" ? e : "Failed to save user.");
      setSaveError(msg);
    }
  };

  const [openDelete, setOpenDelete] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<UserRow | null>(null);

  const confirmDelete = (u: UserRow) => {
    setUserToDelete(u);
    setOpenDelete(true);
  };
  const closeDelete = () => {
    if (deleteLoading) return;
    setOpenDelete(false);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    try {
      setDeleteLoading(true);
      await deleteUserApi(userToDelete.userId);
      setRows((prev) => prev.filter((r) => r.userId !== userToDelete.userId));
      setOpenDelete(false);
      setUserToDelete(null);
    } catch (e: any) {
      console.error("Delete failed:", e?.message ?? e);
    } finally {
      setDeleteLoading(false);
    }
  };

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
              title={<Typography variant="h6">User Management</Typography>}
              sx={{ pb: 1, pt: 1.5 }}
              action={
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={openAddUser}
                    disabled={loading}
                  >
                    Add User
                  </Button>
                </Stack>
              }
            />

            <CardContent>
              {error ? (
                <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                  {error}
                </Typography>
              ) : null}

              {saveError ? (
                <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                  {saveError}
                </Typography>
              ) : null}

              <UsersTable
                rows={paged}
                totalCount={sorted.length}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                loading={loading}
                onEditUser={onEditUser}
                onDeleteUser={confirmDelete}
              />
            </CardContent>
          </Card>

          <UserAddEditDialog
            open={openAddEdit}
            editMode={editMode}
            initialValue={editingUser}
            onClose={() => setOpenAddEdit(false)}
            onSubmit={onSubmitUser}
          />

          <ConfirmDialog
            open={openDelete}
            title="Delete User"
            intent="delete"
            confirmText="Delete"
            cancelText="Cancel"
            description={
              <Typography>
                Are you sure you want to delete{" "}
                <strong>{userToDelete?.username ?? ""}</strong>?
              </Typography>
            }
            loading={deleteLoading}
            onClose={closeDelete}
            onConfirm={deleteUser}
          />
        </html.div>
      </html.main>
    </html.div>
  );
}
