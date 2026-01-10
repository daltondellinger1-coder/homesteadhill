import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const trustPoints = [
  "Furnished Turnkey Units",
  "Self Check-in (Smart Locks)",
  "Free Parking",
  "Dedicated Workspaces + Fast Wi-Fi",
  "Full Kitchens",
  "Flexible Short/Mid-Term Stays",
];

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A35C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative House Icon */}
          <div className="flex justify-center mb-8">
            <svg width="80" height="48" viewBox="0 0 80 48" fill="none" className="text-primary animate-fade-in">
              <path
                d="M40 8L72 36H8L40 8Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <rect x="16" y="36" width="48" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-6 animate-slide-up">
            Welcome to{" "}
            <span className="text-gradient-gold">Homestead Hill</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Fully Furnished Rentals in Vincennes, Indiana
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button asChild variant="hero" size="xl">
              <Link to="/contact">Book Direct</Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <Link to="/units">View Units</Link>
            </Button>
          </div>

          {/* Trust Points */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {trustPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm md:text-base text-muted-foreground"
              >
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
