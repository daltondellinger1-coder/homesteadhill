import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, GraduationCap, UtensilsCrossed, ShoppingBag } from "lucide-react";

const Location = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16 md:pb-24">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Location
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Homestead Hill is ideally located in Vincennes, Indiana — 
              close to everything you need.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Map Placeholder */}
            <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[400px] bg-navy-light rounded-2xl border border-border flex items-center justify-center relative overflow-hidden">
              <div className="text-center p-8">
                <MapPin className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Interactive map coming soon
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vincennes, Indiana 47591
                </p>
              </div>
            </div>

            {/* Nearby Locations */}
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                What's Nearby
              </h2>

              <div className="space-y-4">
                <div className="bg-gradient-card rounded-xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Vincennes University
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Just minutes from campus — perfect for visiting professors, 
                        staff, and families of students.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-card rounded-xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Downtown Dining
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Explore local restaurants, cafes, and eateries in historic 
                        downtown Vincennes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-card rounded-xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Shopping & Essentials
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Grocery stores, pharmacies, and essential services are all 
                        within easy reach.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-muted-foreground text-sm mb-4">
                  Need directions or recommendations for local attractions? 
                  We're happy to help!
                </p>
                <Button asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-secondary rounded-2xl border border-border p-8 text-center">
            <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Homestead Hill
            </h3>
            <p className="text-muted-foreground">
              Vincennes, Indiana 47591
            </p>
            <p className="text-primary mt-4 text-sm font-medium">
              Self check-in available 24/7 with smart lock access
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Location;
