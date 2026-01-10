import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { PerfectFor } from "@/components/PerfectFor";
import { UnitCard } from "@/components/UnitCard";
import { Button } from "@/components/ui/button";
import { units } from "@/data/units";
import { ArrowRight, Shield, DollarSign, Clock } from "lucide-react";

const Index = () => {
  const featuredUnits = units.filter(u => u.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <Hero />
        
        {/* Perfect For Section */}
        <PerfectFor />
        
        {/* Featured Units Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Featured Units
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse our selection of fully furnished apartments and cottages, 
                each designed with traveling professionals in mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {featuredUnits.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/units">
                  View All {units.length} Units
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Book Direct Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Why Book Direct?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Skip the middleman and enjoy a better experience when you book directly with Homestead Hill.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No Platform Fees
                </h3>
                <p className="text-muted-foreground text-sm">
                  Save money by avoiding booking platform service fees that can add 15%+ to your stay.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Flexible Terms
                </h3>
                <p className="text-muted-foreground text-sm">
                  Get customized stay lengths, invoicing options, and pricing tailored to your needs.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Direct Communication
                </h3>
                <p className="text-muted-foreground text-sm">
                  Get faster responses and personalized service when you work directly with us.
                </p>
              </div>
            </div>

            <div className="text-center mt-10">
              <Button asChild size="lg">
                <Link to="/contact">Book Direct Today</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
