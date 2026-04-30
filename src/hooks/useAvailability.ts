import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CalendarEvent {
  unit_id: string;
  start_date: string;
  end_date: string;
}

export function useAvailability(unitId?: string) {
  return useQuery({
    queryKey: ["availability", unitId],
    queryFn: async () => {
      // Public site uses the sanitized SECURITY DEFINER RPCs that only
      // return date ranges — no guest names, no source data. Direct
      // SELECT on calendar_events is now restricted to admins.
      const { data, error } = unitId
        ? await supabase.rpc("get_blocked_ranges", { p_unit_id: unitId })
        : await supabase.rpc("get_all_blocked_ranges");

      if (error) {
        console.error("Error fetching availability:", error);
        throw error;
      }

      return (data ?? []) as CalendarEvent[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function isDateBlocked(
  events: CalendarEvent[] | undefined,
  date: Date,
  unitId?: string
): boolean {
  if (!events) return false;
  
  const dateStr = date.toISOString().split("T")[0];
  
  return events.some((event) => {
    if (unitId && event.unit_id !== unitId) return false;
    return dateStr >= event.start_date && dateStr < event.end_date;
  });
}

export function getBlockedDatesForUnit(
  events: CalendarEvent[] | undefined,
  unitId: string
): Date[] {
  if (!events) return [];
  
  const blockedDates: Date[] = [];
  const unitEvents = events.filter((e) => e.unit_id === unitId);
  
  for (const event of unitEvents) {
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    
    const current = new Date(start);
    while (current < end) {
      blockedDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }
  
  return blockedDates;
}
