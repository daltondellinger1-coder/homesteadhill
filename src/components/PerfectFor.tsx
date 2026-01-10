import { Stethoscope, HardHat, Briefcase, GraduationCap } from "lucide-react";

const audiences = [
  { Icon: Stethoscope, label: "Traveling Nurses" },
  { Icon: HardHat, label: "Contractors" },
  { Icon: Briefcase, label: "Corporate Travelers" },
  { Icon: GraduationCap, label: "Visiting Professors" },
];

export function PerfectFor() {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Perfect For
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our furnished units are designed for professionals who need comfortable, 
            convenient accommodations for extended stays.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {audiences.map(({ Icon, label }, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 bg-gradient-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <span className="text-foreground font-medium text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
