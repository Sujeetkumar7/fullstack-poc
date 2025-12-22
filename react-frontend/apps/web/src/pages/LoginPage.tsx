
import { Login } from "@rsd/ui";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, selectAuthStatus, selectAuthError } from "@rsd/state";
import { useEffect } from "react";

type FromState = { from?: Location };

const STORAGE_KEY = "rsd_user";

type Role = "ADMIN" | "USER" | string;

type StoredUser = {
  userRole?: Role;
};

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  //  // Only honor `from` if it exists; otherwise we’ll choose by role
  const from = (location.state as FromState | undefined)?.from?.pathname;

  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  // Auto-redirect if already logged in (based on stored user)
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as StoredUser;
      const role = String(parsed?.userRole ?? "USER").toUpperCase();

      navigate(role === "ADMIN" ? "/admin" : "/user", { replace: true });
    } catch {
      // Corrupted storage: clear and stay on login
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [navigate]);

  const handleLogin = async ({ username }: { username: string }) => {
    const result = await dispatch(loginUser(username));

    if (loginUser.fulfilled.match(result)) {
      // Prefer `from` only if it exists; otherwise role-based
      const role = String(result.payload.userRole ?? "USER").toUpperCase();
      const roleDestination = role === "ADMIN" ? "/admin" : "/user";

      navigate(from ?? roleDestination, { replace: true });
    } else {
      console.error("Login failed:", result);
      // Optionally show a toast/snackbar using `error`
    }
  };

  return <Login onLogin={handleLogin} />;
}