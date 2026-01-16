import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Users, Plus, Trash2, LogOut, Settings, BarChart3 } from "lucide-react";
import { authService } from "../../services/authService";
import { adminService } from "../../services/adminService";
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

export const AdminDashboard = () => {
  const [teamName, setTeamName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/login";
  };

  // Fetch all teams
  const { data: teamsData, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: adminService.getAllTeams,
  });

  // Fetch system settings
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: adminService.getSettings,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: (name) => adminService.createTeam(name),
    onSuccess: () => {
      toast.success("Team created successfully");
      setTeamName("");
      setShowCreateForm(false);
      queryClient.invalidateQueries(["teams"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create team");
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: (teamId) => adminService.deleteTeam(teamId),
    onSuccess: () => {
      toast.success("Team deleted successfully");
      queryClient.invalidateQueries(["teams"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete team");
    },
  });

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (teamName.trim()) {
      createTeamMutation.mutate(teamName);
    }
  };

  const teams = teamsData?.teams || [];
  const settings = settingsData?.settings;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {user?.name}
                </span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl">Admin Control Panel</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-base">
              Manage your organization's teams and settings
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Hours</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {settings?.jobStartTime} - {settings?.jobEndTime}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Grace Period
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {settings?.graceMinutes} min
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Create and manage your teams</CardDescription>
              </div>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Create Team Form */}
            {showCreateForm && (
              <form
                onSubmit={handleCreateTeam}
                className="mb-6 p-4 border rounded-lg bg-muted/50"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input
                      id="teamName"
                      placeholder="Enter team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createTeamMutation.isPending}
                    >
                      Create Team
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setTeamName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Teams List */}
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">
                Loading teams...
              </p>
            ) : teams.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No teams yet. Create your first team to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.employees?.length || 0} employees •{" "}
                        {team.leaders?.length || 0} leaders
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete team "${team.name}"?`,
                          )
                        ) {
                          deleteTeamMutation.mutate(team._id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Current system configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Job Start Time</p>
                <p className="text-2xl font-bold">{settings?.jobStartTime}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Job End Time</p>
                <p className="text-2xl font-bold">{settings?.jobEndTime}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Grace Period</p>
                <p className="text-2xl font-bold">
                  {settings?.graceMinutes} minutes
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Max Break Time</p>
                <p className="text-2xl font-bold">
                  {settings?.maxBreakMinutesPerDay} min/day
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Rest Days Per Month</p>
                <p className="text-2xl font-bold">
                  {settings?.restDaysPerMonth} days
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Auto-Absent After</p>
                <p className="text-2xl font-bold">
                  {settings?.autoAbsentAfterHours} hours
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="outline" disabled>
                <Settings className="mr-2 h-4 w-4" />
                Edit Settings (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
