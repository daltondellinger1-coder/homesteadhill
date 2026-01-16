import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/units", label: "Units" },
  { href: "/amenities", label: "Amenities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/location", label: "Location" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <svg width="40" height="24" viewBox="0 0 80 48" fill="none" className="text-primary transition-transform group-hover:scale-110">
            <path
              d="M40 8L72 36H8L40 8Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <rect x="16" y="36" width="48" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-semibold text-foreground leading-tight">
              Homestead Hill
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground tracking-wider uppercase hidden sm:block">
              Vincennes, Indiana
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-secondary hover:text-foreground",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button asChild variant="default" size="default">
            <Link to="/contact">Book Direct</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-foreground hover:bg-secondary rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-background border-b border-border animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-secondary",
                  location.pathname === link.href
                    ? "text-primary bg-secondary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-border">
              <Button asChild variant="default" size="lg" className="w-full">
                <Link to="/contact" onClick={() => setIsOpen(false)}>
                  Book Direct – No Platform Fees
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
