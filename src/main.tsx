import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./ui/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TestFormPage } from "./pages/TestFormPage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { PreviewPublishPage } from "./pages/PreviewPublishPage";
import { authStorage } from "./api/authStorage";
import "./styles.css";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return authStorage.getToken() ? <>{children}</> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "tests/new", element: <TestFormPage /> },
      { path: "tests/:testId/edit", element: <TestFormPage /> },
      { path: "tests/:testId/questions", element: <QuestionsPage /> },
      { path: "tests/:testId/preview", element: <PreviewPublishPage /> }
    ]
  },
  // { path: "*", element: <Navigate to="/" replace /> }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2600,
        style: {
          border: "1px solid #dfe4ee",
          color: "#2f3a4c",
          boxShadow: "0 18px 50px rgba(47, 58, 76, 0.12)"
        },
        success: {
          iconTheme: { primary: "#18a56f", secondary: "#fff" }
        },
        error: {
          iconTheme: { primary: "#ff7178", secondary: "#fff" }
        }
      }}
    />
    <RouterProvider router={router} />
  </React.StrictMode>
);
