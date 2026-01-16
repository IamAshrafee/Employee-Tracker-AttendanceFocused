import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Users,
  UserCheck,
  Calendar,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { leaderService } from "../../services/leaderService";
import { authService } from "../../services/authService";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { format } from "date-fns";

export const LeaderDashboard = () => {
  const [unlockReason, setUnlockReason] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const queryClient = useQueryClient();
  const user = authService.getCurrentUser();
  const currentDate = format(new Date(), "yyyy-MM-dd");

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/login";
  };

  // Fetch team members
  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ["team", "members"],
    queryFn: leaderService.getTeamMembers,
  });

  // Fetch team attendance
  const { data: attendanceData } = useQuery({
    queryKey: ["team", "attendance", currentDate],
    queryFn: () => leaderService.getTeamAttendance(currentDate),
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch pending approvals
  const { data: approvalsData } = useQuery({
    queryKey: ["approvals", "pending"],
    queryFn: leaderService.getPendingApprovals,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Unlock employee mutation
  const unlockMutation = useMutation({
    mutationFn: ({ employeeId, reason }) =>
      leaderService.unlockEmployee(employeeId, reason),
    onSuccess: () => {
      toast.success("Employee unlocked successfully");
      setUnlockReason("");
      setSelectedEmployee(null);
      queryClient.invalidateQueries(["approvals", "pending"]);
      queryClient.invalidateQueries(["team", "members"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to unlock employee");
    },
  });

  // Approve emergency off mutation
  const approveEmergencyOffMutation = useMutation({
    mutationFn: ({ employeeId, month, date }) =>
      leaderService.approveEmergencyOff(employeeId, month, date),
    onSuccess: () => {
      toast.success("Emergency off approved");
      queryClient.invalidateQueries(["approvals", "pending"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to approve emergency off",
      );
    },
  });

  const handleUnlock = (employee) => {
    setSelectedEmployee(employee);
  };

  const confirmUnlock = () => {
    if (!unlockReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    unlockMutation.mutate({
      employeeId: selectedEmployee._id,
      reason: unlockReason,
    });
  };

  const team = teamData?.team;
  const employees = teamData?.employees || [];
  const attendance = attendanceData?.attendance || [];
  const lockedEmployees = approvalsData?.lockedEmployees || [];
  const pendingEmergencyOffs = approvalsData?.pendingEmergencyOffs || [];

  // Calculate stats
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const lateCount = attendance.filter((a) => a.dutyIn?.isLate).length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Team Leader Dashboard
              </h1>
              {team && (
                <p className="text-sm text-muted-foreground">
                  Team: {team.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {user?.name}
                </span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {teamLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : !team ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">
                No Team Assigned
              </CardTitle>
              <CardDescription>
                You are not assigned as a leader to any team
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employees.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Present Today
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {presentCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Late Today
                  </CardTitle>
                  <Clock className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {lateCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Approvals
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {lockedEmployees.length + pendingEmergencyOffs.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Approvals */}
            {(lockedEmployees.length > 0 ||
              pendingEmergencyOffs.length > 0) && (
              <Card className="mb-8 border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <CardTitle>Pending Approvals</CardTitle>
                  </div>
                  <CardDescription>
                    Action required from team leader
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Locked Employees */}
                  {lockedEmployees.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        Locked Employees ({lockedEmployees.length})
                      </h3>
                      <div className="space-y-2">
                        {lockedEmployees.map((employee) => (
                          <div
                            key={employee._id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                          >
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {employee.lockReason}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleUnlock(employee)}
                              disabled={unlockMutation.isPending}
                            >
                              Unlock
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Unlock Dialog */}
                      {selectedEmployee && (
                        <div className="mt-4 p-4 bg-white border-2 border-primary rounded-lg">
                          <h4 className="font-semibold mb-2">
                            Unlock {selectedEmployee.name}
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="unlockReason">
                                Reason for unlocking
                              </Label>
                              <Input
                                id="unlockReason"
                                placeholder="Provide a reason..."
                                value={unlockReason}
                                onChange={(e) =>
                                  setUnlockReason(e.target.value)
                                }
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={confirmUnlock}
                                disabled={unlockMutation.isPending}
                              >
                                Confirm Unlock
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedEmployee(null);
                                  setUnlockReason("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Emergency Off Requests */}
                  {pendingEmergencyOffs.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Emergency Off Requests ({pendingEmergencyOffs.length})
                      </h3>
                      <div className="space-y-2">
                        {pendingEmergencyOffs.map((request, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                          >
                            <div>
                              <p className="font-medium">
                                {request.userId.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Date: {request.date} • Reason: {request.reason}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() =>
                                approveEmergencyOffMutation.mutate({
                                  employeeId: request.userId._id,
                                  month: request.month,
                                  date: request.date,
                                })
                              }
                              disabled={approveEmergencyOffMutation.isPending}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>View and manage your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employees.map((employee) => {
                    const empAttendance = attendance.find(
                      (a) => a.userId._id === employee._id,
                    );
                    const isLocked = employee.status === "locked";

                    return (
                      <div
                        key={employee._id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          isLocked
                            ? "bg-destructive/5 border-destructive"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {empAttendance ? (
                            <div className="text-sm">
                              <span
                                className={`px-2 py-1 rounded ${
                                  empAttendance.status === "present"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {empAttendance.status}
                              </span>
                              {empAttendance.dutyIn?.isLate && (
                                <span className="ml-2 text-amber-600 text-xs">
                                  Late ({empAttendance.dutyIn.lateMinutes} min)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No attendance
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-destructive text-sm font-medium">
                              🔒 Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};
