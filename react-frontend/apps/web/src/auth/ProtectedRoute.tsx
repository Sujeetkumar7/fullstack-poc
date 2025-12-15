// apps/web/src/auth/ProtectedRoute.tsx
import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectIsAuthenticated,
  selectAuthStatus,
  hydrateAuth,
} from "@rsd/state";

type Props = { children: React.ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthed = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectAuthStatus);

  // Ensure hydrate runs only once per mount
  const triedHydrate = useRef(false);
  useEffect(() => {
    if (!triedHydrate.current) {
      triedHydrate.current = true;
      dispatch(hydrateAuth());
    }
  }, [dispatch]);

  // While hydration is happening, don't decide yet
  if (status === "loading") {
    return <div style={{ padding: 16 }}>Loading…</div>;
  }

  // After hydration, block if unauthenticated
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Authenticated, show protected content
  return <>{children}</>;
}
