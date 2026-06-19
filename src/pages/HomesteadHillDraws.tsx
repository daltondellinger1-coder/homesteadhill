import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Banknote, ExternalLink, FileSpreadsheet, RefreshCw, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { homesteadHillDrawSnapshot } from "@/data/homesteadHillDrawSnapshot";

type UnitSummaryRow = {
  unit: string;
  budget: number;
  actual: number;
  drawsApplied: number;
  ownerCashApplied: number;
  openCommitted: number;
  variance: number;
  fundingPosition: number;
  notes?: string;
};

type DrawRow = {
  row: number;
  unit: string;
  category: string;
  scope: string;
  actualCostToDate: number;
  paidFromDraws: number;
  paidFromOwnerCash: number;
  openCommitted: number;
  vendor: string;
  sourceLink?: string;
  drawNumber?: string;
  status: string;
  sourceAccount: string;
  notes?: string;
  requestedAmount?: number;
  holdbackAmount?: number;
};

type DrawDashboardData = {
  source: string;
  sourceSpreadsheetName: string;
  sourceSheetName: string;
  sourceUrl: string;
  refreshedAt: string;
  summary: {
    totalBudget: number;
    totalActual: number;
    summaryPaidFromDraws: number;
    totalPaidFromOwnerCash: number;
    openCommitted: number;
    netFundingPosition: number;
    status: string;
    ledgerActualCostToDate: number;
    ledgerDrawsReceived: number;
    ledgerOwnerCash: number;
    ledgerOpenCommitted: number;
    paidOutVsLedgerDrawGap: number;
    cashNeededForActualsAndOpenCommitted: number;
    summaryDrawMismatch: number;
  };
  unitSummary: UnitSummaryRow[];
  draws: DrawRow[];
  ledger?: DrawRow[];
  dataQuality: string[];
  recommendedNextActions: string[];
};

const fallbackData = homesteadHillDrawSnapshot as unknown as DrawDashboardData;
const LIVE_CSV_URL = "https://docs.google.com/spreadsheets/d/1O4QXwt5SxDRf9c8FLaqyvK6813DAvO1pb5eiD77fW50/gviz/tq?tqx=out:csv&gid=949151202";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

const exactMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

const dateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
};

const parseCsv = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
};

const parseNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  const parsed = Number(String(value ?? "").replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCell = (row: string[], index: number) => row[index] ?? "";

const buildDashboardDataFromParsedRows = (rows: string[][]): DrawDashboardData => {
  const summaryRow = rows[1] ?? [];
  const unitRows = rows.slice(5, 12).filter((row) => getCell(row, 0) && getCell(row, 0) !== "Unit / Area");
  const ledgerRows = rows.slice(13).filter((row) => getCell(row, 0) && getCell(row, 2));

  const unitSummary = unitRows.map((row) => ({
    unit: getCell(row, 0),
    budget: parseNumber(getCell(row, 1)),
    actual: parseNumber(getCell(row, 2)),
    drawsApplied: parseNumber(getCell(row, 3)),
    ownerCashApplied: parseNumber(getCell(row, 4)),
    openCommitted: parseNumber(getCell(row, 5)),
    variance: parseNumber(getCell(row, 6)),
    fundingPosition: parseNumber(getCell(row, 7)),
    notes: getCell(row, 8),
  }));

  const ledger = ledgerRows.map((row, index) => {
    const item = {
      row: index + 14,
      unit: getCell(row, 0),
      category: getCell(row, 1),
      scope: getCell(row, 2),
      actualCostToDate: parseNumber(getCell(row, 4)),
      paidFromDraws: parseNumber(getCell(row, 5)),
      paidFromOwnerCash: parseNumber(getCell(row, 6)),
      openCommitted: parseNumber(getCell(row, 7)),
      vendor: getCell(row, 10),
      sourceLink: getCell(row, 11),
      drawNumber: getCell(row, 12),
      status: getCell(row, 13),
      sourceAccount: getCell(row, 14),
      notes: getCell(row, 15),
    };

    const drawMatch = `${item.scope} ${item.notes}`.match(/80% of \$?([0-9,]+(?:\.\d{2})?)/i);
    const requestedAmount = drawMatch ? parseNumber(drawMatch[1]) : 0;
    return {
      ...item,
      requestedAmount,
      holdbackAmount: requestedAmount && item.paidFromDraws ? Number((requestedAmount - item.paidFromDraws).toFixed(2)) : 0,
    };
  });

  const draws = ledger.filter((row) => row.paidFromDraws || row.drawNumber || `${row.category} ${row.scope} ${row.notes}`.toLowerCase().includes("draw"));
  const ledgerActualCostToDate = ledger.reduce((total, row) => total + row.actualCostToDate, 0);
  const ledgerDrawsReceived = ledger.reduce((total, row) => total + row.paidFromDraws, 0);
  const ledgerOwnerCash = ledger.reduce((total, row) => total + row.paidFromOwnerCash, 0);
  const ledgerOpenCommitted = ledger.reduce((total, row) => total + row.openCommitted, 0);
  const openCommitted = parseNumber(getCell(summaryRow, 9));
  const summaryPaidFromDraws = parseNumber(getCell(summaryRow, 5));

  return {
    ...fallbackData,
    source: "live-google-sheet-csv",
    refreshedAt: new Date().toISOString(),
    summary: {
      totalBudget: parseNumber(getCell(summaryRow, 1)),
      totalActual: parseNumber(getCell(summaryRow, 3)),
      summaryPaidFromDraws,
      totalPaidFromOwnerCash: parseNumber(getCell(summaryRow, 7)),
      openCommitted,
      netFundingPosition: parseNumber(getCell(summaryRow, 11)),
      status: getCell(summaryRow, 13),
      ledgerActualCostToDate: Number(ledgerActualCostToDate.toFixed(2)),
      ledgerDrawsReceived: Number(ledgerDrawsReceived.toFixed(2)),
      ledgerOwnerCash: Number(ledgerOwnerCash.toFixed(2)),
      ledgerOpenCommitted: Number(ledgerOpenCommitted.toFixed(2)),
      paidOutVsLedgerDrawGap: Number((ledgerActualCostToDate - ledgerDrawsReceived - ledgerOwnerCash).toFixed(2)),
      cashNeededForActualsAndOpenCommitted: Number((ledgerActualCostToDate + openCommitted - ledgerDrawsReceived - ledgerOwnerCash).toFixed(2)),
      summaryDrawMismatch: Number((summaryPaidFromDraws - ledgerDrawsReceived).toFixed(2)),
    },
    unitSummary,
    draws,
    ledger,
    dataQuality: [
      `Top summary says paid from draws is ${exactMoney(summaryPaidFromDraws)}, but ledger rows currently prove ${exactMoney(ledgerDrawsReceived)}; mismatch ${exactMoney(summaryPaidFromDraws - ledgerDrawsReceived)}.`,
      "Draw request/holdback amounts are only populated where the row notes include request math, e.g. 80% of $20,384.26.",
      "Actuals include imported Unit 14 placeholders marked needs receipt/QBO verification; do not treat all actuals as receipt-proven yet.",
    ],
  };
};

const fetchLiveDashboardData = async () => {
  const response = await fetch(`${LIVE_CSV_URL}&_=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Google Sheet CSV fetch failed: ${response.status}`);
  const text = await response.text();
  return buildDashboardDataFromParsedRows(parseCsv(text));
};

function MetricCard({
  title,
  value,
  description,
  tone = "neutral",
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  tone?: "neutral" | "good" | "warn" | "bad";
  icon: typeof Banknote;
}) {
  const toneClass = {
    neutral: "border-slate-200 bg-white",
    good: "border-emerald-200 bg-emerald-50",
    warn: "border-amber-200 bg-amber-50",
    bad: "border-red-200 bg-red-50",
  }[tone];

  return (
    <Card className={`${toneClass} overflow-hidden`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className="h-5 w-5 text-slate-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{value}</div>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}

const HomesteadHillDraws = () => {
  const [showAllUnits, setShowAllUnits] = useState(false);

  const query = useQuery({
    queryKey: ["homestead-hill-draws"],
    queryFn: fetchLiveDashboardData,
    retry: 1,
    staleTime: 60 * 1000,
  });

  const data = query.data ?? fallbackData;
  const usingFallback = !query.data;
  const s = data.summary;
  const visibleUnits = showAllUnits ? data.unitSummary : data.unitSummary.filter((unit) => unit.actual || unit.drawsApplied || unit.openCommitted || unit.fundingPosition);

  const drawTotals = useMemo(() => {
    return data.draws.reduce(
      (totals, draw) => ({
        requested: totals.requested + (draw.requestedAmount || 0),
        received: totals.received + (draw.paidFromDraws || 0),
        holdback: totals.holdback + (draw.holdbackAmount || 0),
      }),
      { requested: 0, received: 0, holdback: 0 },
    );
  }, [data.draws]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="outline" className="w-fit border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
              Back to admin
            </Link>
          </Button>
          <Button onClick={() => query.refetch()} disabled={query.isFetching} className="w-fit">
            <RefreshCw className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} />
            Refresh dashboard
          </Button>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-5 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-blue-500/20 text-blue-100 hover:bg-blue-500/20">Homestead Hill · Draw Funding</Badge>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">Paid out vs. bank draws received</h1>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                Bookmark this page to see the current funding gap, draw receipts, holdbacks, and unit-level exposure from the Homestead Hill cost tracker.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
              <div className="font-semibold text-white">Data source</div>
              <div>{data.sourceSpreadsheetName}</div>
              <div>{data.sourceSheetName}</div>
              <div className="mt-2">Updated: {dateTime(data.refreshedAt)}</div>
              <a href={data.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-blue-300 hover:text-blue-200">
                Open source Sheet <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>

        {usingFallback && (
          <div className="mt-5 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
              <div>
                <strong>Using embedded fallback snapshot.</strong> The permanent page is in place, but the Supabase live feed needs deployment/configuration before this refreshes directly from a hosted JSON feed. The numbers below are from the latest verified Sheet snapshot.
              </div>
            </div>
          </div>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Paid out / actuals" value={exactMoney(s.ledgerActualCostToDate)} description="Actual cost entered in the ledger to date." icon={Wallet} tone="neutral" />
          <MetricCard title="Draws received" value={exactMoney(s.ledgerDrawsReceived)} description="Confirmed draw funding rows in the ledger." icon={Banknote} tone="good" />
          <MetricCard title="Behind on actuals" value={exactMoney(s.paidOutVsLedgerDrawGap)} description="Actual paid out minus confirmed draw receipts and owner cash." icon={TrendingDown} tone="bad" />
          <MetricCard title="Cash needed incl. open commitments" value={exactMoney(s.cashNeededForActualsAndOpenCommitted)} description="Actuals + open commitments minus confirmed draw receipts." icon={FileSpreadsheet} tone="warn" />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="border-slate-200 lg:col-span-2">
            <CardHeader>
              <CardTitle>Draw ledger</CardTitle>
              <CardDescription>Every bank draw row currently visible in the tracker.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-100 p-3"><div className="text-xs text-slate-500">Requested</div><div className="text-xl font-bold">{exactMoney(drawTotals.requested)}</div></div>
                <div className="rounded-xl bg-emerald-50 p-3"><div className="text-xs text-emerald-700">Received</div><div className="text-xl font-bold text-emerald-900">{exactMoney(drawTotals.received)}</div></div>
                <div className="rounded-xl bg-amber-50 p-3"><div className="text-xs text-amber-700">Holdback / not received</div><div className="text-xl font-bold text-amber-900">{exactMoney(drawTotals.holdback)}</div></div>
              </div>

              {data.draws.map((draw) => (
                <article key={`${draw.row}-${draw.scope}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{draw.drawNumber || "Draw row"} · {draw.unit}</div>
                      <div className="mt-1 text-sm text-slate-600">{draw.scope}</div>
                    </div>
                    <Badge variant="outline">{draw.status}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div><div className="text-xs text-slate-500">Requested</div><div className="font-semibold">{exactMoney(draw.requestedAmount || 0)}</div></div>
                    <div><div className="text-xs text-slate-500">Received</div><div className="font-semibold text-emerald-700">{exactMoney(draw.paidFromDraws || 0)}</div></div>
                    <div><div className="text-xs text-slate-500">Holdback</div><div className="font-semibold text-amber-700">{exactMoney(draw.holdbackAmount || 0)}</div></div>
                    <div><div className="text-xs text-slate-500">Source</div><div className="font-semibold">{draw.sourceAccount || draw.vendor}</div></div>
                  </div>
                  {draw.notes && <p className="mt-3 text-sm leading-6 text-slate-600">{draw.notes}</p>}
                </article>
              ))}
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-950"><AlertTriangle className="h-5 w-5" /> Data checks</CardTitle>
              <CardDescription className="text-red-800">Items to clean up before using this as bank-invoice source of truth.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-red-900">
              {data.dataQuality.map((item) => (
                <div key={item} className="rounded-xl bg-white/70 p-3 leading-6">{item}</div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Unit funding exposure</h2>
              <p className="text-sm text-slate-400">Shows actuals, draw coverage, commitments, and current funding position by unit/area.</p>
            </div>
            <Button variant="outline" onClick={() => setShowAllUnits((v) => !v)} className="w-fit border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-800">
              {showAllUnits ? "Show active only" : "Show all units"}
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleUnits.map((unit) => (
              <Card key={unit.unit} className="border-slate-700 bg-slate-950 text-slate-100">
                <CardHeader className="pb-3">
                  <CardTitle>{unit.unit}</CardTitle>
                  <CardDescription className="text-slate-400">Funding position: {exactMoney(unit.fundingPosition)}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-slate-500">Budget</div><div className="font-semibold">{money(unit.budget)}</div></div>
                  <div><div className="text-slate-500">Actual</div><div className="font-semibold">{money(unit.actual)}</div></div>
                  <div><div className="text-slate-500">Draws</div><div className="font-semibold text-emerald-300">{money(unit.drawsApplied)}</div></div>
                  <div><div className="text-slate-500">Open</div><div className="font-semibold text-amber-300">{money(unit.openCommitted)}</div></div>
                  {unit.notes && <p className="col-span-2 mt-2 text-xs leading-5 text-slate-400">{unit.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>What to do next</CardTitle>
              <CardDescription>Operational cleanup so future draw invoices stay ahead of spend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recommendedNextActions.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{index + 1}</span>
                  <span className="leading-6">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bookmark path</CardTitle>
              <CardDescription>This is the permanent admin page route once deployed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <code className="block rounded-xl bg-slate-100 p-3 text-slate-950">/admin/draws</code>
              <p>Use this route as the saved link on desktop or phone after the app deployment picks up this change. The page will fetch the Edge Function first and fall back to the embedded Sheet snapshot if the live feed is not configured yet.</p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomesteadHillDraws;
