import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format, parseISO, addDays, differenceInCalendarDays } from "date-fns";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { units } from "@/data/units";
import { useAvailability, isDateBlocked } from "@/hooks/useAvailability";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, AlertCircle, Loader2, BedDouble, ArrowRight } from "lucide-react";

type Step = "lookup" | "dates" | "scenario" | "confirm" | "done";

interface Booking {
  guestName: string;
  currentCheckOut: string; // YYYY-MM-DD
  unitId: string;
  unitName: string;
}

function rangesOverlap(aStart: Date, aEnd: Date, bStart: string, bEnd: string) {
  const bs = parseISO(bStart);
  const be = parseISO(bEnd);
  return aStart < be && bs < aEnd;
}

const ExtendStay = () => {
  const { unitId = "" } = useParams();
  const { toast } = useToast();
  const unit = units.find((u) => u.id === unitId);

  const [step, setStep] = useState<Step>("lookup");
  const [submitting, setSubmitting] = useState(false);

  // Step 1: lookup
  const [email, setEmail] = useState("");
  const [checkInInput, setCheckInInput] = useState("");
  const [phone, setPhone] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  // Step 2: dates
  const [newCheckOut, setNewCheckOut] = useState<Date | undefined>(undefined);

  // Step 3: scenario
  const [chosenUnitId, setChosenUnitId] = useState<string>("");

  const { data: events } = useAvailability();

  // Sibling units (same group)
  const siblings = useMemo(() => {
    if (!unit) return [];
    const group =
      unit.type === "cottage"
        ? "cottage"
        : unit.bedrooms === 2
        ? "2br"
        : "1br";
    return units.filter((u) => {
      if (u.id === unit.id) return false;
      const g =
        u.type === "cottage" ? "cottage" : u.bedrooms === 2 ? "2br" : "1br";
      return g === group;
    });
  }, [unit]);

  // Compute scenario locally for display purposes
  const { sameAvailable, availableSiblings } = useMemo(() => {
    if (!booking || !newCheckOut || !events) {
      return { sameAvailable: false, availableSiblings: [] as typeof units };
    }
    const start = parseISO(booking.currentCheckOut);
    const end = newCheckOut;

    const sameAvail = !events.some(
      (e) =>
        e.unit_id === booking.unitId &&
        rangesOverlap(start, end, e.start_date, e.end_date),
    );

    const availSibs = siblings.filter((s) => {
      return !events.some(
        (e) =>
          e.unit_id === s.id &&
          rangesOverlap(start, end, e.start_date, e.end_date),
      );
    });

    return { sameAvailable: sameAvail, availableSiblings: availSibs };
  }, [booking, newCheckOut, events, siblings]);

  useEffect(() => {
    // Default chosen unit when scenario screen opens
    if (booking) setChosenUnitId(booking.unitId);
  }, [booking]);

  if (!unit) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 md:pt-28 pb-16 container">
          <h1 className="font-serif text-3xl text-foreground mb-4">Unknown unit</h1>
          <p className="text-muted-foreground">
            The QR code you scanned doesn't match a unit we recognize. Please contact us at booking@homestead-hill.com.
          </p>
          <Link to="/" className="text-primary mt-4 inline-block">Return home</Link>
        </main>
        <Footer />
      </div>
    );
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError(null);

    if (!email || !checkInInput) {
      setLookupError("Please enter your email and check-in date.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "submit-extension-request",
        {
          body: {
            action: "lookup",
            email: email.trim().toLowerCase(),
            checkIn: checkInInput,
            unitId,
          },
        },
      );

      if (error) throw error;

      if (!data?.found) {
        setLookupError(
          data?.message ||
            "We couldn't find a booking matching that info. Please contact us at booking@homestead-hill.com.",
        );
        return;
      }

      setBooking({
        guestName: data.guestName || "Guest",
        currentCheckOut: data.currentCheckOut,
        unitId: unit!.id,
        unitName: unit!.name,
      });
      setStep("dates");
    } catch (err: any) {
      console.error(err);
      setLookupError("Something went wrong. Please try again or contact us.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit() {
    if (!booking || !newCheckOut || !chosenUnitId) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "submit-extension-request",
        {
          body: {
            action: "submit",
            email: email.trim().toLowerCase(),
            phone: phone.trim() || undefined,
            guestName: booking.guestName,
            unitId: booking.unitId,
            currentCheckIn: checkInInput,
            currentCheckOut: booking.currentCheckOut,
            newCheckOut: format(newCheckOut, "yyyy-MM-dd"),
            chosenUnitId,
          },
        },
      );

      if (error) throw error;

      setStep("done");
      toast({
        title: "Request sent",
        description: "We'll be in touch shortly.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Something went wrong",
        description: "Please try again or call us at (812) 768-3108.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Disabled dates for the date picker (anything <= current checkout, or
  // already booked for the current unit AND all siblings — i.e. nothing
  // available anywhere in the group is disabled to avoid pure dead-ends)
  const disabledDates = (date: Date) => {
    if (!booking) return true;
    const minDate = addDays(parseISO(booking.currentCheckOut), 1);
    if (date < minDate) return true;
    return false;
  };

  const nights = booking && newCheckOut
    ? differenceInCalendarDays(newCheckOut, parseISO(booking.currentCheckOut))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Extend Your Stay | Homestead Hill"
        description="Already staying with us? Extend your stay at Homestead Hill in Vincennes, Indiana."
        canonical={`https://homestead-hill.com/extend/${unitId}`}
        noindex
      />
      <Header />

      <main className="pt-24 md:pt-28 pb-16 md:pb-24">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3">
              {unit.name}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-3">
              Extend Your Stay
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Enjoying your time with us? Let us know how much longer you'd like to stay and we'll take it from there.
            </p>
          </div>

          {/* STEP 1 — Lookup */}
          {step === "lookup" && (
            <Card>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleLookup} className="space-y-5">
                  <div>
                    <Label htmlFor="email">Email on your booking</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkin">Original check-in date</Label>
                    <Input
                      id="checkin"
                      type="date"
                      required
                      value={checkInInput}
                      onChange={(e) => setCheckInInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(812) 555-1234"
                    />
                  </div>
                  {lookupError && (
                    <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{lookupError}</span>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking…</>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* STEP 2 — Pick new checkout */}
          {step === "dates" && booking && (
            <Card>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Welcome back, {booking.guestName}.</p>
                  <p className="text-foreground mt-1">
                    Your current checkout is{" "}
                    <strong>{format(parseISO(booking.currentCheckOut), "PPP")}</strong>.
                  </p>
                </div>

                <div>
                  <Label className="mb-3 block">Pick your new checkout date</Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={newCheckOut}
                      onSelect={setNewCheckOut}
                      disabled={disabledDates}
                      className="rounded-md border"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("lookup")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep("scenario")}
                    disabled={!newCheckOut}
                    className="flex-1"
                  >
                    Continue ({nights} extra {nights === 1 ? "night" : "nights"})
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3 — Scenario */}
          {step === "scenario" && booking && newCheckOut && (
            <Card>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Extension window</p>
                  <p className="text-foreground text-lg font-medium mt-1">
                    {format(parseISO(booking.currentCheckOut), "PPP")}{" "}
                    <ArrowRight className="inline w-4 h-4 mx-1 text-primary" />{" "}
                    {format(newCheckOut, "PPP")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {nights} extra {nights === 1 ? "night" : "nights"}
                  </p>
                </div>

                {sameAvailable && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Good news — your unit is free!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.unitName} is available for those nights. Submit your request and we'll confirm pricing.
                      </p>
                    </div>
                  </div>
                )}

                {!sameAvailable && availableSiblings.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium text-foreground">{booking.unitName} is booked for those nights.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose how you'd like to proceed:
                      </p>
                    </div>

                    <RadioGroup value={chosenUnitId} onValueChange={setChosenUnitId} className="space-y-3">
                      {/* Stay in same unit (request shuffle) */}
                      <Label
                        htmlFor={`choice-${booking.unitId}`}
                        className="flex items-start gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
                      >
                        <RadioGroupItem value={booking.unitId} id={`choice-${booking.unitId}`} className="mt-1" />
                        <div>
                          <p className="font-medium text-foreground">Stay in {booking.unitName}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            We'll see if we can move the incoming guest to another unit so you can stay put.
                          </p>
                        </div>
                      </Label>

                      {/* Switch to a sibling */}
                      {availableSiblings.map((s) => (
                        <Label
                          key={s.id}
                          htmlFor={`choice-${s.id}`}
                          className="flex items-start gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
                        >
                          <RadioGroupItem value={s.id} id={`choice-${s.id}`} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <BedDouble className="w-4 h-4 text-primary" />
                              <p className="font-medium text-foreground">Switch to {s.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {s.bedrooms} bedroom · sleeps {s.sleeps} · {s.bedType} bed
                            </p>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {!sameAvailable && availableSiblings.length === 0 && (
                  <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">We're fully booked for those nights.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Submit your request anyway — we'll let you know if anything opens up.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("dates")} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                    ) : (
                      "Submit request"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* DONE */}
          {step === "done" && (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-serif text-2xl text-foreground">Request received!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Thanks — we got your extension request and we'll be in touch shortly to confirm next steps and pricing. A confirmation email is on the way.
                </p>
                <Link to="/" className="inline-block text-primary mt-2">Return home</Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExtendStay;