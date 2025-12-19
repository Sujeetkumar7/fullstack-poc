import { Login } from "@rsd/ui";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { loginUser, selectAuthStatus, selectAuthError } from "@rsd/state";
import { useAppSelector } from "../store/hooks";
import { useEffect } from "react";

type FromState = { from?: Location };

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as FromState | undefined)?.from?.pathname ?? "/admin";
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  useEffect(() => {
    const user = localStorage.getItem("rsd_user");
    if (user) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async ({ username }: { username: string }) => {
    const result = await dispatch(loginUser(username));
    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true });
    } else {
      console.error("Login failed:", result);
    }
  };

  return <Login onLogin={handleLogin} />;
}
