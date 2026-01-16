import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Coffee, Play, Square, AlertCircle, Clock } from "lucide-react";
import { employeeService } from "../../services/employeeService";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { format } from "date-fns";

const BREAK_TYPES = [
  { value: "lunch", label: "Lunch Break", icon: "🍽️" },
  { value: "toilet", label: "Toilet Break", icon: "🚻" },
  { value: "cooking", label: "Cooking Break", icon: "👨‍🍳" },
  { value: "personal", label: "Personal Break", icon: "👤" },
  { value: "other", label: "Other", icon: "⏸️" },
];

export const BreakManager = () => {
  const [selectedBreakType, setSelectedBreakType] = useState("lunch");
  const queryClient = useQueryClient();

  // Fetch today's breaks
  const { data, isLoading } = useQuery({
    queryKey: ["breaks", "today"],
    queryFn: employeeService.getTodayBreaks,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const activeBreak = data?.breaks?.find((b) => b.isActive);
  const totalMinutes = data?.totalMinutes || 0;
  const remainingMinutes = data?.remainingMinutes || 60;
  const limitExceeded = data?.limitExceeded || false;

  // Start break mutation
  const startBreakMutation = useMutation({
    mutationFn: () => employeeService.startBreak(selectedBreakType),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["breaks", "today"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to start break");
    },
  });

  // End break mutation
  const endBreakMutation = useMutation({
    mutationFn: () => employeeService.endBreak(activeBreak._id),
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.warning) {
        toast.error(data.warning, { duration: 5000 });
      }
      queryClient.invalidateQueries(["breaks", "today"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to end break");
    },
  });

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-amber-600" />
          <CardTitle>Break Manager</CardTitle>
        </div>
        <CardDescription>Manage your daily break time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Break Time Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Used Today</p>
            <p className="text-lg font-semibold">{totalMinutes} min</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p
              className={`text-lg font-semibold ${limitExceeded ? "text-destructive" : "text-green-600"}`}
            >
              {limitExceeded ? "0" : remainingMinutes} min
            </p>
          </div>
        </div>

        {/* Limit Exceeded Warning */}
        {limitExceeded && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-destructive">
              You have exceeded your daily break limit of 60 minutes
            </p>
          </div>
        )}

        {/* Active Break Display */}
        {activeBreak && (
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-semibold text-amber-900">
                  {BREAK_TYPES.find((t) => t.value === activeBreak.breakType)
                    ?.label || "Break"}{" "}
                  Active
                </span>
              </div>
              <span className="text-sm text-amber-700">
                {format(new Date(activeBreak.breakOut), "hh:mm a")}
              </span>
            </div>
            <Button
              onClick={() => endBreakMutation.mutate()}
              disabled={endBreakMutation.isPending}
              variant="destructive"
              className="w-full"
              size="sm"
            >
              <Square className="mr-2 h-4 w-4" />
              End Break
            </Button>
          </div>
        )}

        {/* Start Break Form */}
        {!activeBreak && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="breakType">Break Type</Label>
              <Select
                value={selectedBreakType}
                onValueChange={setSelectedBreakType}
              >
                <SelectTrigger id="breakType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BREAK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => startBreakMutation.mutate()}
              disabled={startBreakMutation.isPending || isLoading}
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Break
            </Button>
          </div>
        )}

        {/* Break History */}
        {!isLoading && data?.breaks && data.breaks.length > 0 && (
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Today's Breaks
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.breaks.map((brk) => (
                <div
                  key={brk._id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                >
                  <span className="font-medium">
                    {BREAK_TYPES.find((t) => t.value === brk.breakType)
                      ?.label || brk.breakType}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {format(new Date(brk.breakOut), "hh:mm a")}
                    </span>
                    {!brk.isActive && (
                      <span className="font-semibold text-amber-600">
                        {brk.durationMinutes} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
