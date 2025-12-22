
import { RouteObject, Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/AdminDashboard";
import AnalyticsPage from "../pages/Analytics";

import ColorModeProvider from "../theme/ColorModeProvider";
import UserDashboardLayout from "../layouts/UserDashboardLayout";

import Portfolio from "../pages/user/Portfolio";
import Transactions from "../pages/user/Transactions";
import Stocks from "../pages/user/Stocks";

export const routes: RouteObject[] = [
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },

  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <ColorModeProvider>
          <UserDashboardLayout />
        </ColorModeProvider>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/user/portfolio" replace /> },
      { path: "portfolio", element: <Portfolio /> },
      { path: "transactions", element: <Transactions /> },
      { path: "stocks", element: <Stocks /> },
    ],
  },

  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <AnalyticsPage />
           </ProtectedRoute>
    ),
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]