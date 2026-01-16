import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Calendar as CalendarIcon, Check, X, AlertCircle } from "lucide-react";
import { employeeService } from "../../services/employeeService";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isBefore,
  startOfDay,
} from "date-fns";

export const RestDaySelector = () => {
  const currentMonth = format(new Date(), "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDates, setSelectedDates] = useState([]);
  const queryClient = useQueryClient();

  // Fetch rest days for selected month
  const { data: restDayData } = useQuery({
    queryKey: ["restDays", selectedMonth],
    queryFn: () => employeeService.getRestDays(selectedMonth),
    onSuccess: (data) => {
      if (data.restDay?.selectedDates) {
        setSelectedDates(data.restDay.selectedDates);
      }
    },
  });

  // Fetch available dates
  const { data: availabilityData } = useQuery({
    queryKey: ["availableDates", selectedMonth],
    queryFn: () => employeeService.getAvailableDates(selectedMonth),
  });

  // Save rest days mutation
  const saveRestDaysMutation = useMutation({
    mutationFn: () =>
      employeeService.selectRestDays(selectedMonth, selectedDates),
    onSuccess: () => {
      toast.success("Rest days saved successfully!");
      queryClient.invalidateQueries(["restDays", selectedMonth]);
      queryClient.invalidateQueries(["availableDates", selectedMonth]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save rest days");
    },
  });

  const monthStart = startOfMonth(new Date(selectedMonth + "-01"));
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const fullyBookedDates = availabilityData?.fullyBookedDates || [];
  const MAX_REST_DAYS = 4;

  const handleDateClick = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    // Don't allow selecting past dates
    if (isBefore(date, startOfDay(new Date()))) {
      toast.error("Cannot select past dates");
      return;
    }

    // Check if date is fully booked
    if (fullyBookedDates.includes(dateStr)) {
      toast.error("This date is fully booked");
      return;
    }

    if (selectedDates.includes(dateStr)) {
      // Remove date
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      // Add date
      if (selectedDates.length >= MAX_REST_DAYS) {
        toast.error(`You can only select ${MAX_REST_DAYS} rest days per month`);
        return;
      }
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleSave = () => {
    saveRestDaysMutation.mutate();
  };

  const canSave =
    selectedDates.length > 0 && selectedDates.length <= MAX_REST_DAYS;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-green-600" />
          <CardTitle>Rest Day Selection</CardTitle>
        </div>
        <CardDescription>
          Select up to {MAX_REST_DAYS} rest days for{" "}
          {format(monthStart, "MMMM yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Counter */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Selected Days</span>
          <span
            className={`text-lg font-bold ${selectedDates.length === MAX_REST_DAYS ? "text-green-600" : "text-muted-foreground"}`}
          >
            {selectedDates.length} / {MAX_REST_DAYS}
          </span>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {daysInMonth.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const isSelected = selectedDates.includes(dateStr);
              const isFullyBooked = fullyBookedDates.includes(dateStr);
              const isPast = isBefore(date, startOfDay(new Date()));
              const isDisabled = isFullyBooked || isPast;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled && !isSelected}
                  className={`
                    aspect-square rounded-md text-sm font-medium transition-all
                    ${
                      isSelected
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : isDisabled
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          : "bg-background border border-border hover:bg-muted hover:border-green-300"
                    }
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span>{format(date, "d")}</span>
                    {isSelected && <Check className="h-3 w-3 mt-0.5" />}
                    {isFullyBooked && !isSelected && (
                      <X className="h-3 w-3 mt-0.5 text-destructive" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-600" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted border" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted opacity-50" />
            <span>Fully Booked</span>
          </div>
        </div>

        {/* Warning */}
        {selectedDates.length === 0 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              Select your rest days for the month. Maximum 4 employees per team
              can take rest on the same date (first come, first served).
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!canSave || saveRestDaysMutation.isPending}
          className="w-full"
        >
          {saveRestDaysMutation.isPending ? "Saving..." : "Save Rest Days"}
        </Button>
      </CardContent>
    </Card>
  );
};
