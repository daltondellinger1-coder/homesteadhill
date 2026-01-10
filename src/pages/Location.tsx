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
            {/* Interactive Map */}
            <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[400px] rounded-2xl border border-border overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3093.8!2d-87.5186!3d38.6847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x886de5c1f3e8df0d%3A0x0!2s2818%20Washington%20Ave%2C%20Vincennes%2C%20IN%2047591!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Homestead Hill Location - 2818 Washington Ave, Vincennes, IN 47591"
              />
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
              2818 Washington Ave<br />
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
