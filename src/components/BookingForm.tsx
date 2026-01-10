import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Send, CheckCircle, AlertCircle } from "lucide-react";
import { units } from "@/data/units";
import { toast } from "sonner";
import { useAvailability, isDateBlocked } from "@/hooks/useAvailability";

export function BookingForm() {
  const [searchParams] = useSearchParams();
  const preselectedUnit = searchParams.get("unit") || "";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    unit: preselectedUnit,
    checkIn: "",
    checkOut: "",
    guests: "1",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch availability data
  const { data: events, isLoading: isLoadingAvailability } = useAvailability(formData.unit || undefined);

  // Check if selected dates conflict with blocked dates
  const dateConflict = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut || !formData.unit || !events) {
      return false;
    }
    
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const current = new Date(checkIn);
    
    while (current < checkOut) {
      if (isDateBlocked(events, current, formData.unit)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return false;
  }, [formData.checkIn, formData.checkOut, formData.unit, events]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dateConflict) {
      toast.error("Selected dates are not available. Please choose different dates.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Booking request submitted! We'll be in touch soon.");
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
          Request Received!
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Thank you for your booking request. We'll review your dates and get back to you within 24 hours with confirmation and payment details.
        </p>
        <Button onClick={() => setIsSubmitted(false)} variant="outline">
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Smith"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="(812) 555-1234"
          />
        </div>

        {/* Unit Selection */}
        <div className="space-y-2">
          <Label htmlFor="unit">Preferred Unit</Label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Any Available Unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} - Sleeps {unit.sleeps}
              </option>
            ))}
          </select>
        </div>

        {/* Check-in Date */}
        <div className="space-y-2">
          <Label htmlFor="checkIn">Check-in Date *</Label>
          <div className="relative">
            <Input
              id="checkIn"
              name="checkIn"
              type="date"
              required
              value={formData.checkIn}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Check-out Date */}
        <div className="space-y-2">
          <Label htmlFor="checkOut">Check-out Date *</Label>
          <div className="relative">
            <Input
              id="checkOut"
              name="checkOut"
              type="date"
              required
              value={formData.checkOut}
              onChange={handleChange}
              min={formData.checkIn || new Date().toISOString().split("T")[0]}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Number of Guests */}
        <div className="space-y-2">
          <Label htmlFor="guests">Number of Guests *</Label>
          <select
            id="guests"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
          </select>
        </div>
      </div>

      {/* Date Conflict Warning */}
      {dateConflict && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Dates Not Available</p>
            <p className="text-sm text-destructive/80">
              The selected dates overlap with an existing booking. Please choose different dates or select a different unit.
            </p>
          </div>
        </div>
      )}

      {/* Availability Status */}
      {formData.unit && !dateConflict && formData.checkIn && formData.checkOut && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <CheckCircle className="w-4 h-4" />
          Dates appear to be available!
        </div>
      )}

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Additional Message</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your stay - purpose of visit, special requests, questions..."
          rows={4}
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        size="lg" 
        className="w-full" 
        disabled={isSubmitting || dateConflict}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Booking Request
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Book Direct – No Platform Fees. We'll respond within 24 hours.
      </p>
    </form>
  );
}
