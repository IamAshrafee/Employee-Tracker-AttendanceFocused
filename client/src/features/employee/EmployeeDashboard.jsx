import { LogOut, BarChart3 } from "lucide-react";
import { authService } from "../../services/authService";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AttendanceWidget } from "./AttendanceWidget";
import { BreakManager } from "./BreakManager";
import { RestDaySelector } from "./RestDaySelector";

export const EmployeeDashboard = () => {
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/login";
  };

  const upcomingFeatures = [
    {
      icon: BarChart3,
      title: "Reports",
      description: "View your attendance history",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              Employee Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome,{" "}
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
            <CardTitle className="text-3xl">
              Welcome back, {user?.name}! 👋
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-base">
              Your attendance tracking system is ready to use
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Main Widgets Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <AttendanceWidget />
              <BreakManager />
            </div>
          </div>
          <div>
            <RestDaySelector />
          </div>
        </div>

        {/* Upcoming Features */}
        {upcomingFeatures.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">More Features</h2>
            <div className="grid gap-6">
              {upcomingFeatures.map((feature) => (
                <Card
                  key={feature.title}
                  className="group cursor-not-allowed opacity-60"
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground italic bg-muted/50 px-3 py-2 rounded-md">
                      Coming soon...
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
