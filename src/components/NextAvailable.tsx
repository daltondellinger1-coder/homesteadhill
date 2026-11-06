import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import {
  findCatalogUnit,
  formatAvailableFrom,
  getUnitNumber,
  getVacancies,
  vacancyCta,
  vacancyHref,
} from "@/lib/vacancies";

export function NextAvailable() {
  const vacancies = getVacancies();
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
