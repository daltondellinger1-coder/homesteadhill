import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  findCatalogUnit,
  formatAvailableFrom,
  getUnitNumber,
  vacancyCta,
  vacancyHref,
  type Vacancy,
} from "@/lib/vacancies";

// Fixed, anonymous placeholder count: the skeleton must not read the offline
// seed file, or its stale dates would ship inside the client bundle.
const SKELETON_CARDS = [0, 1, 2, 3, 4];

export function NextAvailable() {
  // Start empty: the prerendered HTML must never carry seed dates, which go
  // stale as soon as the vacancies table changes.
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadVacancies() {
      try {
        const { data, error } = await supabase
          .from("vacancies")
          .select("unit_id, available_from, label, note, has_detail_page, bedrooms, furnished, product")
          .or("status.eq.open,status.is.null")
          .order("available_from", { ascending: true });

        if (!active) return;

        if (error || !data?.length) {
          setLoading(false);
          return;
        }

        setVacancies(data.map((row) => ({
          unitId: row.unit_id,
          availableFrom: row.available_from,
          label: row.label,
          note: row.note ?? undefined,
          hasDetailPage: row.has_detail_page,
        })).sort((a, b) => a.availableFrom.localeCompare(b.availableFrom)));
      } catch {
        // Request could not complete: fall back to the empty state, never dates.
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadVacancies();
    return () => { active = false; };
  }, []);

  if (loading) {
    // Same card layout, no dates, until the query returns.
    return (
      <section className="py-16 md:py-24" aria-busy="true">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Next Available
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upcoming openings at Homestead Hill. Dates update as units fill.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {SKELETON_CARDS.map((index) => (
              <div
                key={index}
                aria-hidden="true"
                className="flex flex-col p-5 bg-gradient-card rounded-2xl border border-border animate-pulse"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="h-5 w-20 rounded bg-muted" />
                  <span className="h-3 w-12 rounded bg-muted" />
                </div>
                <span className="mt-2 h-3.5 w-16 rounded bg-muted" />
                <span className="mt-4 h-4 w-32 rounded bg-muted" />
                <span className="mt-5 h-4 w-24 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (vacancies.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Next Available
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upcoming openings at Homestead Hill. Dates update as units fill.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {vacancies.map((vacancy) => {
            const unit = findCatalogUnit(vacancy.unitId);
            return (
              <div
                key={vacancy.unitId}
                className="flex flex-col p-5 bg-gradient-card rounded-2xl border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {getUnitNumber(vacancy.unitId)}
                  </h3>
                  {unit && (
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {unit.type}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-primary">{vacancy.label}</p>

                <p className="mt-3 flex items-center gap-2 text-sm text-foreground">
                  <CalendarDays className="w-4 h-4 shrink-0 text-primary" />
                  Available {formatAvailableFrom(vacancy.availableFrom)}
                </p>

                {vacancy.note && (
                  <p className="mt-2 text-xs text-muted-foreground">{vacancy.note}</p>
                )}

                <Link
                  to={vacancyHref(vacancy)}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {vacancyCta(vacancy)}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
