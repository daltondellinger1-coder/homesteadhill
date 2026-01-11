import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UnitCard } from "@/components/UnitCard";
import { units } from "@/data/units";
import { Button } from "@/components/ui/button";
import { SEO, pageSEO } from "@/components/SEO";

const Units = () => {
  const apartments = units.filter(u => u.type === 'apartment');
  const cottages = units.filter(u => u.type === 'cottage');

  return (
    <div className="min-h-screen bg-background">
      <SEO {...pageSEO.units} />
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16 md:pb-24">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Our Units
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Choose from {units.length} fully furnished apartments and cottages, 
              each equipped for comfortable extended stays.
            </p>
          </div>

          {/* Apartments Section */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <span className="w-12 h-px bg-primary" />
              Apartments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          </section>

          {/* Cottages Section */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <span className="w-12 h-px bg-primary" />
              Cottages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cottages.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="text-center bg-gradient-card rounded-2xl border border-border p-8 md:p-12">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Ready to Book Your Stay?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Book directly with us and save on platform fees. We offer flexible terms for 
              short-term and extended stays.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/contact">Book Direct</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Units;
