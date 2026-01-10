import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { units } from "@/data/units";
import { 
  Bed, Bath, Users, Home, ArrowLeft, Check, 
  Star, Wifi, Car, KeyRound, Thermometer 
} from "lucide-react";

const UnitDetail = () => {
  const { id } = useParams();
  const unit = units.find(u => u.id === id);

  if (!unit) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 md:pt-28 pb-16 md:pb-24">
          <div className="container text-center">
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
              Unit Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The unit you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/units">View All Units</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16 md:pb-24">
        <div className="container">
          {/* Back Link */}
          <Link 
            to="/units" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Units
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Image Placeholder */}
              <div className="aspect-video bg-navy-light rounded-2xl flex items-center justify-center mb-8 relative overflow-hidden">
                <Home className="w-24 h-24 text-primary/30" />
                {unit.featured && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-full">
                    <Star className="w-4 h-4" />
                    Featured
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-secondary text-foreground text-sm font-medium px-4 py-2 rounded-full capitalize">
                    {unit.type}
                  </span>
                </div>
              </div>

              {/* Unit Title */}
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                {unit.name}
              </h1>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Sleeps {unit.sleeps}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" />
                  <span>{unit.bedrooms} Bedroom{unit.bedrooms > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-primary" />
                  <span>{unit.baths} Bath</span>
                </div>
                <div className="flex items-center gap-2 text-primary font-medium">
                  {unit.bedType} Bed
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                  About This Unit
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {unit.description}
                </p>
                {unit.priceNote && (
                  <p className="text-primary mt-3 font-medium">{unit.priceNote}</p>
                )}
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {unit.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* House Rules */}
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  House Rules
                </h2>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Check-in: 3:00 PM / Check-out: 11:00 AM</li>
                  <li>• Self check-in with smart lock</li>
                  <li>• No smoking</li>
                  <li>• Quiet hours: 10:00 PM – 8:00 AM</li>
                  <li>• No parties or events</li>
                </ul>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-2">
              <div className="sticky top-28 bg-gradient-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">
                  Book This Unit
                </h3>

                {/* Key Features */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wifi className="w-4 h-4 text-primary" />
                    Fast Wi-Fi
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="w-4 h-4 text-primary" />
                    Free Parking
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <KeyRound className="w-4 h-4 text-primary" />
                    Self Check-in
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Thermometer className="w-4 h-4 text-primary" />
                    A/C & Heat
                  </div>
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    Contact us for rates and availability
                  </p>
                </div>

                <Button asChild size="lg" className="w-full mb-3">
                  <Link to={`/contact?unit=${unit.id}`}>Book Now</Link>
                </Button>

                <p className="text-center text-xs text-primary font-medium">
                  Book Direct – No Platform Fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnitDetail;
