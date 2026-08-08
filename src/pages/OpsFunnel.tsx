import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

const STAGES = [
  { key: "booking_request_started", label: "Request started" },
  { key: "unit_selected", label: "Unit selected" },
  { key: "checkin_date_selected", label: "Check-in selected" },
  { key: "checkout_date_selected", label: "Checkout selected" },
  { key: "guest_count_selected", label: "Guest count selected" },
  { key: "booking_request_submit_attempted", label: "Submit attempted" },
  { key: "booking_request_submitted", label: "Submitted" },
  { key: "booking_request_submit_failed", label: "Submit failed" },
] as const;

type StageKey = (typeof STAGES)[number]["key"];
type StageCounts = Record<StageKey, number>;

interface DailyRow {
  event_date: string;
  event_type: string;
  event_count: number;
}

interface UnitRow {
  unit_id: string;
  event_type: string;
  event_count: number;
}

type OpsRow = Tables<"booking_requests_ops">;

const OPS_STATUSES = [
  "received",
  "responded",
  "qualified",
  "deposit_requested",
  "deposit_paid",
  "booked",
  "lost",
] as const;

const emptyCounts = (): StageCounts =>
  Object.fromEntries(STAGES.map((s) => [s.key, 0])) as StageCounts;

const utcDate = (d: Date) => d.toISOString().slice(0, 10);

const daysAgo = (n: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return utcDate(d);
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 48) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

const OpsFunnel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [unitRows, setUnitRows] = useState<UnitRow[]>([]);
  const [opsRows, setOpsRows] = useState<OpsRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { status: string; notes: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const start30 = daysAgo(29);
  const today = daysAgo(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [dailyRes, unitRes, opsRes] = await Promise.all([
      supabase.rpc("get_booking_funnel_stats", { p_start: start30, p_end: today }),
      supabase.rpc("get_funnel_unit_stats", { p_start: start30, p_end: today }),
      supabase
        .from("booking_requests_ops")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(50),
    ]);

    if (dailyRes.error || unitRes.error || opsRes.error) {
      toast({
        title: "Failed to load report",
        description: "You may not have operator access.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setDaily((dailyRes.data ?? []) as DailyRow[]);
    setUnitRows((unitRes.data ?? []) as UnitRow[]);
    setOpsRows(opsRes.data ?? []);
    setDrafts(
      Object.fromEntries(
        (opsRes.data ?? []).map((r) => [r.id, { status: r.status, notes: r.notes ?? "" }])
      )
    );
    setLoading(false);
  }, [start30, today, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const countsForWindow = useCallback(
    (fromDate: string): StageCounts => {
      const counts = emptyCounts();
      for (const row of daily) {
        if (row.event_date >= fromDate && row.event_date <= today) {
          const key = row.event_type as StageKey;
          if (key in counts) counts[key] += Number(row.event_count);
        }
      }
      return counts;
    },
    [daily, today]
  );

  const windows = useMemo(
    () => [
      { label: "Today", counts: countsForWindow(today) },
      { label: "Last 7 days", counts: countsForWindow(daysAgo(6)) },
      { label: "Last 30 days", counts: countsForWindow(start30) },
    ],
    [countsForWindow, today, start30]
  );

  const trend = useMemo(() => {
    const byDate = new Map<string, StageCounts>();
    for (const row of daily) {
      if (!byDate.has(row.event_date)) byDate.set(row.event_date, emptyCounts());
      const c = byDate.get(row.event_date)!;
      const key = row.event_type as StageKey;
      if (key in c) c[key] += Number(row.event_count);
    }
    return [...byDate.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 14);
  }, [daily]);

  const unitBreakdown = useMemo(() => {
    const byUnit = new Map<string, StageCounts>();
    for (const row of unitRows) {
      if (!byUnit.has(row.unit_id)) byUnit.set(row.unit_id, emptyCounts());
      const c = byUnit.get(row.unit_id)!;
      const key = row.event_type as StageKey;
      if (key in c) c[key] += Number(row.event_count);
    }
    return [...byUnit.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [unitRows]);

  const responseStats = useMemo(() => {
    const hours = opsRows
      .filter((r) => r.first_response_at)
      .map(
        (r) =>
          (new Date(r.first_response_at!).getTime() - new Date(r.submitted_at).getTime()) /
          3_600_000
      )
      .filter((h) => h >= 0);
    if (hours.length === 0) return null;
    const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
    const med = median(hours);
    return { count: hours.length, avg, median: med };
  }, [opsRows]);

  const saveOpsRow = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    setSaving(id);
    const { error } = await supabase
      .from("booking_requests_ops")
      .update({
        status: draft.status,
        notes: draft.notes.trim() || null,
      })
      .eq("id", id);
    setSaving(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved" });
    await load();
  };

  const pct = (part: number, whole: number) =>
    whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              Booking Funnel
            </h1>
            <p className="text-muted-foreground mt-1">
              Private operator report. Counts come from durable backend records.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stage counts & conversion */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Stage counts &amp; conversion</CardTitle>
            <CardDescription>
              Percentages are relative to "Request started" within each window.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Stage</th>
                  {windows.map((w) => (
                    <th key={w.label} className="py-2 px-4 font-medium text-right" colSpan={2}>
                      {w.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAGES.map((s) => (
                  <tr key={s.key} className="border-b border-border/50">
                    <td className="py-2 pr-4 text-foreground">{s.label}</td>
                    {windows.map((w) => (
                      <td key={w.label} className="py-2 px-4 text-right" colSpan={2}>
                        <span className="font-medium text-foreground">{w.counts[s.key]}</span>
                        <span className="text-muted-foreground ml-2">
                          {pct(w.counts[s.key], w.counts.booking_request_started)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily trend</CardTitle>
              <CardDescription>Last 14 days (UTC).</CardDescription>
            </CardHeader>
            <CardContent>
              {trend.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 font-medium">Date</th>
                      <th className="py-2 font-medium text-right">Started</th>
                      <th className="py-2 font-medium text-right">Submitted</th>
                      <th className="py-2 font-medium text-right">Failed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trend.map(([date, c]) => (
                      <tr key={date} className="border-b border-border/50">
                        <td className="py-1.5 text-foreground">{date}</td>
                        <td className="py-1.5 text-right">{c.booking_request_started}</td>
                        <td className="py-1.5 text-right">{c.booking_request_submitted}</td>
                        <td className="py-1.5 text-right">{c.booking_request_submit_failed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Unit breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Unit breakdown</CardTitle>
              <CardDescription>Last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
              {unitBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No unit events recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 font-medium">Unit</th>
                      <th className="py-2 font-medium text-right">Started</th>
                      <th className="py-2 font-medium text-right">Submitted</th>
                      <th className="py-2 font-medium text-right">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitBreakdown.map(([unit, c]) => (
                      <tr key={unit} className="border-b border-border/50">
                        <td className="py-1.5 text-foreground">{unit}</td>
                        <td className="py-1.5 text-right">{c.booking_request_started}</td>
                        <td className="py-1.5 text-right">{c.booking_request_submitted}</td>
                        <td className="py-1.5 text-right">
                          {pct(c.booking_request_submitted, c.booking_request_started)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request outcomes */}
        <Card>
          <CardHeader>
            <CardTitle>Request outcomes</CardTitle>
            <CardDescription>
              Non-PII operational records created when a request is submitted. Moving a request
              off "received" stamps its first response time once. Deposits are confirmed
              manually.
              {responseStats && (
                <span className="block mt-2 text-foreground font-medium">
                  First response time ({responseStats.count} responded): median{" "}
                  {formatHours(responseStats.median!)} · average {formatHours(responseStats.avg)}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {opsRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {opsRows.map((r) => {
                  const draft = drafts[r.id] ?? { status: r.status, notes: r.notes ?? "" };
                  return (
                    <div
                      key={r.id}
                      className="border border-border rounded-lg p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4"
                    >
                      <div className="space-y-1 text-sm">
                        <p className="text-foreground font-medium">{r.unit_id}</p>
                        <p className="text-muted-foreground">
                          Submitted {new Date(r.submitted_at).toLocaleString()} · ID{" "}
                          {r.id.slice(0, 8)}
                        </p>
                        <p className="text-muted-foreground">
                          {r.first_response_at
                            ? `First response ${new Date(r.first_response_at).toLocaleString()} (${formatHours(
                                (new Date(r.first_response_at).getTime() -
                                  new Date(r.submitted_at).getTime()) /
                                  3_600_000
                              )})`
                            : "No response recorded yet"}
                        </p>
                        <Input
                          className="mt-2"
                          placeholder="Operator notes (internal only)"
                          value={draft.notes}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [r.id]: { ...draft, notes: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="flex md:flex-col gap-2 items-start">
                        <Select
                          value={draft.status}
                          onValueChange={(v) =>
                            setDrafts((d) => ({ ...d, [r.id]: { ...draft, status: v } }))
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPS_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          disabled={saving === r.id}
                          onClick={() => saveOpsRow(r.id)}
                        >
                          {saving === r.id ? "Saving…" : "Save"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OpsFunnel;