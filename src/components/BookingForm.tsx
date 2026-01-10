import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Send, CheckCircle, DollarSign } from "lucide-react";
import { units } from "@/data/units";
import { toast } from "sonner";
import { useAvailability, getBlockedDatesForUnit } from "@/hooks/useAvailability";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Helper to calculate pricing based on stay duration
function calculatePricing(monthlyPrice: number, nights: number) {
  const dailyMonthlyRate = monthlyPrice / 30;
  const dailyWeeklyRate = dailyMonthlyRate * 1.25;
  const nightlyRate = 95; // Fixed nightly rate for short stays
  const minimumNights = 3;
  
  if (nights >= 30) {
    // Monthly rate
    const months = Math.floor(nights / 30);
    const remainingDays = nights % 30;
    const monthlyTotal = months * monthlyPrice;
    const remainingTotal = remainingDays * dailyMonthlyRate;
    return {
      total: Math.round(monthlyTotal + remainingTotal),
      rateType: "monthly" as const,
      perNight: Math.round(dailyMonthlyRate),
    };
  } else if (nights >= 7) {
    // Weekly rate
    return {
      total: Math.round(nights * dailyWeeklyRate),
      rateType: "weekly" as const,
      perNight: Math.round(dailyWeeklyRate),
    };
  } else if (nights >= minimumNights) {
    // Nightly rate ($95/night)
    return {
      total: nights * nightlyRate,
      rateType: "nightly" as const,
      perNight: nightlyRate,
    };
  } else {
    // Minimum 3 nights required
    return {
      total: minimumNights * nightlyRate,
      rateType: "minimum" as const,
      perNight: nightlyRate,
      minimumNights,
    };
  }
}

export function BookingForm() {
  const [searchParams] = useSearchParams();
  const preselectedUnit = searchParams.get("unit") || "";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    unit: preselectedUnit,
    guests: "1",
    message: "",
  });
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch availability data
  const { data: events } = useAvailability(formData.unit || undefined);

  // Get blocked dates for the selected unit
  const blockedDates = useMemo(() => {
    if (!formData.unit || !events) return [];
    return getBlockedDatesForUnit(events, formData.unit);
  }, [formData.unit, events]);

  // Create a Set of blocked date strings for faster lookup
  const blockedDateStrings = useMemo(() => {
    return new Set(blockedDates.map(d => d.toDateString()));
  }, [blockedDates]);

  // Disable dates that are blocked or in the past
  const isDateDisabled = useCallback((date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    
    // Check if date is in blocked dates using the Set
    return blockedDateStrings.has(date.toDateString());
  }, [blockedDateStrings]);

  // Disable checkout dates
  const isCheckoutDisabled = useCallback((date: Date): boolean => {
    if (!checkInDate) return true;
    if (date <= checkInDate) return true;
    return isDateDisabled(date);
  }, [checkInDate, isDateDisabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Reset dates when unit changes
    if (name === 'unit') {
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
    }
  };

  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckInDate(date);
    setCheckInOpen(false);
    // Reset checkout if it's before the new checkin
    if (checkOutDate && date && checkOutDate <= date) {
      setCheckOutDate(undefined);
    }
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    setCheckOutDate(date);
    setCheckOutOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates.");
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
          <Label htmlFor="unit">Preferred Unit *</Label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select a Unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} - Sleeps {unit.sleeps}
              </option>
            ))}
          </select>
        </div>

        {/* Check-in Date */}
        <div className="space-y-2">
          <Label>Check-in Date *</Label>
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkInDate && "text-muted-foreground"
                )}
                disabled={!formData.unit}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkInDate ? format(checkInDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={handleCheckInSelect}
                disabled={isDateDisabled}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {!formData.unit && (
            <p className="text-xs text-muted-foreground">Select a unit first to see availability</p>
          )}
        </div>

        {/* Check-out Date */}
        <div className="space-y-2">
          <Label>Check-out Date *</Label>
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOutDate && "text-muted-foreground"
                )}
                disabled={!checkInDate}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={handleCheckOutSelect}
                disabled={isCheckoutDisabled}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {!checkInDate && formData.unit && (
            <p className="text-xs text-muted-foreground">Select check-in date first</p>
          )}
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

      {/* Selected Dates Summary with Pricing */}
      {checkInDate && checkOutDate && (() => {
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        const selectedUnit = units.find(u => u.id === formData.unit);
        const pricing = selectedUnit ? calculatePricing(selectedUnit.monthlyPrice, nights) : null;
        
        return (
          <div className="bg-primary/5 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle className="w-4 h-4" />
              <span>
                {format(checkInDate, "MMM d, yyyy")} → {format(checkOutDate, "MMM d, yyyy")} 
                {" "}({nights} night{nights !== 1 ? 's' : ''})
              </span>
            </div>
            
            {pricing && selectedUnit && (
              <div className="border-t border-primary/20 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {pricing.rateType === "monthly" && "Monthly rate"}
                      {pricing.rateType === "weekly" && "Weekly rate"}
                      {pricing.rateType === "nightly" && "Nightly rate"}
                      {pricing.rateType === "minimum" && `Minimum stay (3 nights)`}
                      {" · "}${pricing.perNight}/night
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-primary">
                      ${pricing.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">estimated total</div>
                  </div>
                </div>
                {nights >= 30 && (
                  <p className="text-xs text-primary mt-2">
                    🎉 You qualify for our best monthly rate!
                  </p>
                )}
                {nights >= 7 && nights < 30 && (
                  <p className="text-xs text-primary mt-2">
                    💡 Stay 30+ nights for our best monthly rate!
                  </p>
                )}
                {nights < 3 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Minimum stay is 3 nights. Price shown for 3 nights.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })()}

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
        disabled={isSubmitting || !checkInDate || !checkOutDate}
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
