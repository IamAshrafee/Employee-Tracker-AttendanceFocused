import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { LoginForm } from "./features/auth/LoginForm";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { EmployeeDashboard } from "./features/employee/EmployeeDashboard";
import "./index.css";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Simple placeholder for admin and leader dashboards
const AdminDashboard = () => (
  <div className="dashboard">
    <div className="container">
      <h1>Admin Dashboard</h1>
      <p>Coming soon...</p>
    </div>
  </div>
);
const LeaderDashboard = () => (
  <div className="dashboard">
    <div className="container">
      <h1>Team Leader Dashboard</h1>
      <p>Coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leader"
            element={
              <ProtectedRoute allowedRoles={["team_leader"]}>
                <LeaderDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#111827",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
