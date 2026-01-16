import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Calendar, Clock, TrendingUp, Award } from "lucide-react";
import { employeeService } from "../../services/employeeService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { format } from "date-fns";

export const MonthlyReportCard = () => {
  const currentMonth = format(new Date(), "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Fetch monthly report
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "monthly", selectedMonth],
    queryFn: () => employeeService.getMonthlyReport(selectedMonth),
  });

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Monthly Report</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const stats = data?.attendanceStats || {};
  const breakStats = data?.breakStats || {};
  const restDayStats = data?.restDayStats || {};

  const statCards = [
    {
      label: "Total Days",
      value: stats.totalDays || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Present Days",
      value: stats.presentDays || 0,
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Late Days",
      value: stats.lateDays || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Avg Hours/Day",
      value: stats.averageWorkingHours || "0.00",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <CardTitle>Monthly Report</CardTitle>
        </div>
        <CardDescription>
          {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attendance Stats */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Attendance Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className={`p-3 rounded-lg ${stat.bgColor}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Break Summary */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Break Usage</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm">Total Breaks</span>
              <span className="font-semibold">
                {breakStats.totalBreaks || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm">Total Break Time</span>
              <span className="font-semibold">
                {breakStats.totalBreakMinutes || 0} min
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm">Avg Break Duration</span>
              <span className="font-semibold">
                {breakStats.averageBreakMinutes || 0} min
              </span>
            </div>
          </div>

          {/* Break Types */}
          {breakStats.breaksByType &&
            Object.keys(breakStats.breaksByType).length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">By Type:</p>
                <div className="space-y-1">
                  {Object.entries(breakStats.breaksByType).map(
                    ([type, data]) => (
                      <div
                        key={type}
                        className="flex justify-between items-center text-xs p-1.5 bg-muted/30 rounded"
                      >
                        <span className="capitalize">{type}</span>
                        <span>
                          {data.count}x • {data.totalMinutes} min
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Rest Days */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Rest Days</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-green-50 rounded text-center">
              <p className="text-xs text-muted-foreground">Selected</p>
              <p className="text-xl font-bold text-green-600">
                {restDayStats.selectedDays || 0}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded text-center">
              <p className="text-xs text-muted-foreground">Emergency</p>
              <p className="text-xl font-bold text-blue-600">
                {restDayStats.emergencyOffs || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
            <div>
              <p className="text-sm font-medium">Total Working Hours</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <p className="text-2xl font-bold text-primary">
              {((stats.totalWorkingMinutes || 0) / 60).toFixed(1)}h
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
