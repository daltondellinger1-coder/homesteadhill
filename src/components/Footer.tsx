import { Link } from "react-router-dom";
import { Home, Phone, Mail, MapPin, Star } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border">
      {/* House Roof Decorative Element */}
      <div className="flex justify-center -mt-px">
        <div className="relative">
          <svg width="80" height="32" viewBox="0 0 80 32" fill="none" className="text-primary">
            <path
              d="M40 4L76 28H4L40 4Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>

      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Home className="w-6 h-6 text-primary" />
              <span className="font-serif text-xl font-semibold text-foreground">
                Homestead Hill
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Fully furnished apartments and cottages in Vincennes, Indiana. 
              Perfect for traveling professionals seeking comfort and convenience.
            </p>
            <p className="text-primary text-sm font-medium">
              Book Direct – No Platform Fees
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
{[
                { href: "/units", label: "View Units" },
                { href: "/amenities", label: "Amenities" },
                { href: "/gallery", label: "Gallery" },
                { href: "/location", label: "Location" },
                { href: "/faq", label: "FAQ" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:booking@homestead-hill.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  booking@homestead-hill.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+18127683108"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  (812) 768-3108
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Vincennes, Indiana 47591</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Book Direct CTA */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              Ready to Book?
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
              Skip the platform fees and book directly with us for the best rates.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Book Your Stay
              </Link>
              <a
                href="https://g.page/r/Cds-Iu5q8sofEBM/review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
              >
                <Star className="w-4 h-4" />
                Leave a Review
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Homestead Hill. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/admin" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors text-xs">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
