import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Clock, LogIn, LogOut, AlertCircle } from "lucide-react";
import { employeeService } from "../../services/employeeService";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { format } from "date-fns";

export const AttendanceWidget = () => {
  const queryClient = useQueryClient();

  // Fetch today's attendance
  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: employeeService.getTodayAttendance,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const attendance = data?.attendance;

  // Duty in mutation
  const dutyInMutation = useMutation({
    mutationFn: () => employeeService.dutyIn(),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["attendance", "today"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to mark duty in");
    },
  });

  // Duty out mutation
  const dutyOutMutation = useMutation({
    mutationFn: () => employeeService.dutyOut(),
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.workingHours) {
        toast.success(`Working hours: ${data.workingHours} hours`);
      }
      queryClient.invalidateQueries(["attendance", "today"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to mark duty out");
    },
  });

  const hasDutyIn = attendance?.dutyIn?.time;
  const hasDutyOut = attendance?.dutyOut?.time;
  const isLate = attendance?.dutyIn?.isLate;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>Today's Attendance</CardTitle>
        </div>
        <CardDescription>Mark your duty in and out</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        {!isLoading && (
          <div className="space-y-3">
            {/* Duty In Status */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Duty In</span>
              </div>
              {hasDutyIn ? (
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {format(new Date(attendance.dutyIn.time), "hh:mm a")}
                  </p>
                  {isLate && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Late by {attendance.dutyIn.lateMinutes} min
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Not marked
                </span>
              )}
            </div>

            {/* Duty Out Status */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Duty Out</span>
              </div>
              {hasDutyOut ? (
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {format(new Date(attendance.dutyOut.time), "hh:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(attendance.workingMinutes / 60).toFixed(2)} hours
                  </p>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Not marked
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={() => dutyInMutation.mutate()}
            disabled={hasDutyIn || dutyInMutation.isPending || isLoading}
            className="w-full"
            variant={hasDutyIn ? "secondary" : "default"}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {hasDutyIn ? "Marked In" : "Duty In"}
          </Button>

          <Button
            onClick={() => dutyOutMutation.mutate()}
            disabled={
              !hasDutyIn || hasDutyOut || dutyOutMutation.isPending || isLoading
            }
            className="w-full"
            variant={hasDutyOut ? "secondary" : "default"}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {hasDutyOut ? "Marked Out" : "Duty Out"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
