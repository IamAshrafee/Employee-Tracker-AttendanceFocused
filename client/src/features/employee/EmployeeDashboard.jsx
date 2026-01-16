import { authService } from "../../services/authService";
import "./EmployeeDashboard.css";

export const EmployeeDashboard = () => {
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/login";
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <h1>Employee Dashboard</h1>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="welcome-card card">
            <h2>Welcome, {user?.name}! 👋</h2>
            <p>Your attendance tracking system is ready.</p>
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <h3>📋 Attendance</h3>
              <p>Clock in and out for your workday</p>
              <div className="placeholder-notice">Coming soon...</div>
            </div>

            <div className="card">
              <h3>☕ Breaks</h3>
              <p>Manage your break time</p>
              <div className="placeholder-notice">Coming soon...</div>
            </div>

            <div className="card">
              <h3>🏖️ Rest Days</h3>
              <p>Select your monthly rest days</p>
              <div className="placeholder-notice">Coming soon...</div>
            </div>

            <div className="card">
              <h3>📊 Reports</h3>
              <p>View your attendance history</p>
              <div className="placeholder-notice">Coming soon...</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
