import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./ui/AppShell";
import { DetailSkeleton } from "./ui/components";
import { ErrorBoundary } from "./ui/ErrorBoundary";
import { authStorage } from "./api/authStorage";
import "./styles.css";

const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const TestFormPage = lazy(() => import("./pages/TestFormPage").then((module) => ({ default: module.TestFormPage })));
const QuestionsPage = lazy(() => import("./pages/QuestionsPage").then((module) => ({ default: module.QuestionsPage })));
const PreviewPublishPage = lazy(() => import("./pages/PreviewPublishPage").then((module) => ({ default: module.PreviewPublishPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return authStorage.getToken() ? <>{children}</> : <Navigate to="/login" replace />;
};

const RouteView = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5"><DetailSkeleton /></div>}>{children}</Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  { path: "/login", element: <RouteView><LoginPage /></RouteView> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RouteView>
          <AppShell />
        </RouteView>
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
  { path: "*", element: <RouteView><NotFoundPage /></RouteView> }
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
          iconTheme: { primary: "#FF7F7F", secondary: "#fff" }
        }
      }}
    />
    <RouterProvider router={router} />
  </React.StrictMode>
);
