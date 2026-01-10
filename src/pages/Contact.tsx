import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookingForm } from "@/components/BookingForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16 md:pb-24">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Book Your Stay
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Ready to experience Homestead Hill? Submit your booking request below 
              and we'll get back to you within 24 hours.
            </p>
            <p className="text-primary font-medium mt-4">
              Book Direct – No Platform Fees
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-card rounded-2xl border border-border p-6">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Contact Information
                </h3>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <a 
                        href="mailto:info@homestead-hill.com"
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        info@homestead-hill.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <a 
                        href="tel:+18125551234"
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        (812) 555-1234
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <p className="text-foreground">
                        Vincennes, Indiana 47591
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Check-in/out</p>
                      <p className="text-foreground text-sm">
                        Check-in: 2:00 PM<br />
                        Check-out: 11:00 AM<br />
                        <span className="text-primary">Self check-in available 24/7</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Book Direct */}
              <div className="bg-secondary rounded-2xl border border-border p-6">
                <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
                  Why Book Direct?
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    No platform service fees
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    Best available rates
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    Flexible booking terms
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    Direct communication
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    Corporate invoicing available
                  </li>
                </ul>
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-card rounded-2xl border border-border p-6 md:p-8">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Booking Request Form
                </h3>
                <BookingForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
