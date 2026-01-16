# Employee Tracker System

A comprehensive web-based employee attendance tracking system with team management, anti-abuse controls, and role-based access for Admin, Team Leaders, and Employees.

## Features

- **Role-Based Access Control**: Admin, Team Leader, and Employee roles with specific permissions
- **Smart Attendance Tracking**: Automatic duty in/out with late detection and locking mechanisms
- **Break Management**: Track multiple break types with daily limits
- **Rest Day System**: Monthly rest day selection with team-level limits
- **Anti-Abuse Controls**: Single-device login, server-verified time, offline sync validation
- **Offline Support**: Continue working without internet, auto-sync when reconnected
- **Comprehensive Reports**: Export attendance, breaks, and late records to Excel/PDF

## Tech Stack

### Frontend

- React 18 + Vite
- TanStack Query (data fetching)
- React Hook Form + Zod (forms & validation)
- React Router (routing)
- React Hot Toast (notifications)

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Node-Cron (scheduled jobs)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or connection URI

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd employee-tracker-system
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

Create `.env` file in the `server` directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee-tracker
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

Create `.env` file in the `client` directory:

```
VITE_API_URL=http://localhost:5000/api
```

4. Run the application

```bash
npm run dev
```

This will start:

- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:5173

## Project Structure

```
employee-tracker-system/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── features/    # Feature modules (auth, admin, team-leader, employee)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API client, offline sync
│   │   └── utils/       # Helper functions
│   └── package.json
├── server/              # Node.js backend
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── models/      # Mongoose schemas
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # Auth, validation
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── jobs/        # Cron jobs
│   │   └── server.js
│   └── package.json
└── package.json         # Root workspace config
```

## Key Workflows

### For Employees

1. Login → Duty In → Work → Take Breaks → Duty Out
2. Select monthly rest days at month start
3. View daily/monthly reports

### For Team Leaders

1. Add employees to team
2. Monitor team attendance
3. Approve locked employees
4. Edit attendance with reason
5. Approve emergency off requests

### For Admin

1. Create teams
2. Assign team leaders
3. Configure system settings (job times, limits)
4. View global reports

## License

MIT
