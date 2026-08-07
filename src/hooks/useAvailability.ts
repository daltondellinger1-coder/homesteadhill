import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CalendarEvent {
  unit_id: string;
  start_date: string;
  end_date: string;
}

/**
 * Format a user-selected local Date as YYYY-MM-DD using its local calendar
 * fields. toISOString() would convert to UTC and shift the day for negative
 * offsets (e.g. America/New_York), blocking/unblocking the wrong night.
 */
function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD calendar date into a local midnight Date.
 * new Date("2026-09-05") parses as UTC midnight and renders as Sep 4 locally.
 */
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
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

  const dateStr = toLocalDateString(date);

  return events.some((event) => {
    if (unitId && event.unit_id !== unitId) return false;
    // Exclusive end date: the checkout day itself stays selectable.
    return dateStr >= event.start_date && dateStr < event.end_date;
  });
}

export interface CalendarFreshness {
  unit_id: string;
  configured: boolean;
  last_synced_at: string | null;
  is_fresh: boolean;
}

/**
 * Freshness of a unit's imported availability feed. Never exposes the feed URL —
 * the SECURITY DEFINER RPC returns only booleans and a timestamp.
 */
export function useCalendarFreshness(unitId?: string) {
  return useQuery({
    queryKey: ["calendar-freshness", unitId],
    enabled: !!unitId,
    queryFn: async (): Promise<CalendarFreshness | null> => {
      if (!unitId) return null;
      const { data, error } = await supabase.rpc("get_calendar_freshness", {
        p_unit_id: unitId,
      });
      if (error) {
        console.error("Error fetching calendar freshness");
        throw error;
      }
      const row = (data ?? [])[0] as CalendarFreshness | undefined;
      return row ?? null;
    },
    staleTime: 5 * 60 * 1000,
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
    const start = parseLocalDate(event.start_date);
    const end = parseLocalDate(event.end_date);
    
    const current = new Date(start);
    // Exclusive end date: stop before the checkout day.
    while (current < end) {
      blockedDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }
  
  return blockedDates;
}
