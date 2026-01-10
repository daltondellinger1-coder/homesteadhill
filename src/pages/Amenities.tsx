import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { amenitiesData } from "@/data/units";
import { 
  UtensilsCrossed, Laptop, Wifi, Tv, Thermometer, Fan, 
  Car, KeyRound, Shield, Camera, Sparkles, WashingMachine 
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed className="w-8 h-8" />,
  Laptop: <Laptop className="w-8 h-8" />,
  Wifi: <Wifi className="w-8 h-8" />,
  Tv: <Tv className="w-8 h-8" />,
  Thermometer: <Thermometer className="w-8 h-8" />,
  Fan: <Fan className="w-8 h-8" />,
  Car: <Car className="w-8 h-8" />,
  KeyRound: <KeyRound className="w-8 h-8" />,
  Shield: <Shield className="w-8 h-8" />,
  Camera: <Camera className="w-8 h-8" />,
  Sparkles: <Sparkles className="w-8 h-8" />,
};

const Amenities = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16 md:pb-24">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Amenities
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Every unit at Homestead Hill comes fully equipped with everything 
              you need for a comfortable extended stay.
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {amenitiesData.map((amenity, index) => (
              <div 
                key={index}
                className="bg-gradient-card rounded-2xl border border-border p-6 hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  {iconMap[amenity.icon] || <Sparkles className="w-8 h-8" />}
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {amenity.label}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {amenity.description}
                </p>
              </div>
            ))}
          </div>

          {/* Not Included Note */}
          <div className="bg-secondary rounded-2xl border border-border p-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                <WashingMachine className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  Laundry Facilities
                </h3>
                <p className="text-muted-foreground text-sm">
                  Washer/dryer is not included in units, but there's a convenient 
                  laundromat located just 5 minutes away. We're happy to provide 
                  directions and recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">
              Ready to Experience Homestead Hill?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Book directly with us and enjoy all these amenities without platform fees.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/contact">Book Direct</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/units">View Units</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Amenities;
