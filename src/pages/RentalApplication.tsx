import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { units } from "@/data/units";
import { CheckCircle, FileText, User, Home, Briefcase, DollarSign, Shield, Send } from "lucide-react";

const RentalApplication = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Booking info from query params
  const bookingName = searchParams.get("name") || "";
  const bookingEmail = searchParams.get("email") || "";
  const bookingPhone = searchParams.get("phone") || "";
  const unitId = searchParams.get("unit") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const nights = parseInt(searchParams.get("nights") || "0");

  const selectedUnit = units.find(u => u.id === unitId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const [form, setForm] = useState({
    // Personal Info
    first_name: bookingName.split(" ")[0] || "",
    middle_initial: "",
    last_name: bookingName.split(" ").slice(1).join(" ") || "",
    ssn: "",
    date_of_birth: "",
    drivers_license: "",
    phone_number: bookingPhone,
    alternate_phone: "",
    email: bookingEmail,
    who_else_living: "",

    // Current Residence
    current_address: "",
    current_city_state_zip: "",
    current_move_in: "",
    current_landlord_name: "",
    current_landlord_phone: "",
    current_monthly_rent: "",
    current_reason_moving: "",

    // Previous Residence 1
    prev1_address: "",
    prev1_city_state_zip: "",
    prev1_move_in: "",
    prev1_move_out: "",
    prev1_landlord_name: "",
    prev1_landlord_phone: "",
    prev1_monthly_rent: "",
    prev1_reason_moving: "",

    // Previous Residence 2
    prev2_address: "",
    prev2_city_state_zip: "",
    prev2_move_in: "",
    prev2_move_out: "",
    prev2_landlord_name: "",
    prev2_landlord_phone: "",
    prev2_monthly_rent: "",
    prev2_reason_moving: "",

    // Employment
    current_employer: "",
    employer_position: "",
    employer_phone: "",
    supervisor_name: "",
    gross_wages: "",
    hire_date: "",
    other_income_sources: "",
    other_income_amount: "",
    other_income_explain: "",

    // General Questions
    how_long_live_here: "",
    pets: "",
    evictions_count: "",
    felonies_count: "",
    broken_lease: "",
    smoke: "",
    vehicles_count: "",
    total_move_in_available: "",
    desired_move_in: "",
    how_heard: "",
    reasons_not_pay_rent: "",
    has_checking_account: "",
    checking_balance: "",
    has_savings_account: "",
    savings_balance: "",

    // Emergency Contact
    emergency_name: "",
    emergency_phone: "",
    emergency_relationship: "",

    // Additional
    why_rent_to_you: "",
    additional_info: "",

    // Signature
    applicant_signature: "",
    signature_date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sections = [
    { title: "Personal Information", icon: User },
    { title: "Rental History", icon: Home },
    { title: "Employment & Income", icon: Briefcase },
    { title: "General Questions", icon: Shield },
    { title: "Authorization & Signature", icon: FileText },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error("Please agree to the terms and authorization before submitting.");
      return;
    }

    if (!form.applicant_signature.trim()) {
      toast.error("Please type your full legal name as your signature.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("submit-rental-application", {
        body: {
          ...form,
          unit_id: unitId,
          booking_name: bookingName,
          booking_email: bookingEmail,
          booking_phone: bookingPhone,
          check_in: checkIn,
          check_out: checkOut,
          nights,
        },
      });

      if (error) {
        console.error("Error submitting application:", error);
        toast.error("Failed to submit application. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to submit application. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 md:pt-28 pb-16 md:pb-24">
          <div className="container max-w-2xl text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Application Submitted!
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Thank you for completing your rental application for {selectedUnit?.name || "your selected unit"}. 
              We'll review your application and get back to you within 48 hours.
            </p>
            <Button onClick={() => navigate("/")} size="lg">
              Return Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const renderField = (label: string, name: string, options?: { type?: string; required?: boolean; placeholder?: string; half?: boolean }) => (
    <div className={`space-y-2 ${options?.half ? "" : "col-span-full sm:col-span-1"}`}>
      <Label htmlFor={name}>
        {label} {options?.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={options?.type || "text"}
        required={options?.required}
        value={(form as any)[name]}
        onChange={handleChange}
        placeholder={options?.placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Rental Application | Homestead Hill"
        description="Complete your rental application for extended stay at Homestead Hill furnished rentals in Vincennes, Indiana."
      />
      <Header />

      <main className="pt-24 md:pt-28 pb-16 md:pb-24">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">
              Rental Application
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Required for stays of 30 nights or longer. Please complete all sections below.
            </p>
            {selectedUnit && (
              <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium">
                <Home className="w-4 h-4" />
                {selectedUnit.name} · {checkIn} → {checkOut} · {nights} nights
              </div>
            )}
          </div>

          {/* Section Nav */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {sections.map((section, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSection(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentSection === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.title}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-gradient-card rounded-2xl border border-border p-6 md:p-8">
              {/* Section 1: Personal Info */}
              {currentSection === 0 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Personal Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderField("First Name", "first_name", { required: true })}
                    {renderField("Middle Initial", "middle_initial")}
                    {renderField("Last Name", "last_name", { required: true })}
                    {renderField("Social Security #", "ssn", { placeholder: "XXX-XX-XXXX" })}
                    {renderField("Date of Birth", "date_of_birth", { type: "date" })}
                    {renderField("Driver's License #", "drivers_license")}
                    {renderField("Phone Number", "phone_number", { required: true, type: "tel" })}
                    {renderField("Alternate Phone", "alternate_phone", { type: "tel" })}
                    {renderField("Email", "email", { required: true, type: "email" })}
                    <div className="col-span-full">
                      <Label htmlFor="who_else_living">Who else will be living with you? (Names & ages)</Label>
                      <Textarea
                        id="who_else_living"
                        name="who_else_living"
                        value={form.who_else_living}
                        onChange={handleChange}
                        placeholder="List all occupants with names and ages"
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Rental History */}
              {currentSection === 1 && (
                <div className="space-y-8">
                  <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" /> Rental History
                  </h2>

                  {/* Current Residence */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Current Residence</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderField("Address", "current_address")}
                      {renderField("City, State, Zip", "current_city_state_zip")}
                      {renderField("Move-in Date", "current_move_in", { type: "date" })}
                      {renderField("Landlord Name", "current_landlord_name")}
                      {renderField("Landlord Phone", "current_landlord_phone", { type: "tel" })}
                      {renderField("Monthly Rent", "current_monthly_rent", { placeholder: "$" })}
                      <div className="col-span-full">
                        {renderField("Reason for Moving", "current_reason_moving")}
                      </div>
                    </div>
                  </div>

                  {/* Previous Residence 1 */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Previous Residence #1</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderField("Address", "prev1_address")}
                      {renderField("City, State, Zip", "prev1_city_state_zip")}
                      {renderField("Move-in Date", "prev1_move_in", { type: "date" })}
                      {renderField("Move-out Date", "prev1_move_out", { type: "date" })}
                      {renderField("Landlord Name", "prev1_landlord_name")}
                      {renderField("Landlord Phone", "prev1_landlord_phone", { type: "tel" })}
                      {renderField("Monthly Rent", "prev1_monthly_rent", { placeholder: "$" })}
                      <div className="col-span-full">
                        {renderField("Reason for Moving", "prev1_reason_moving")}
                      </div>
                    </div>
                  </div>

                  {/* Previous Residence 2 */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Previous Residence #2</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderField("Address", "prev2_address")}
                      {renderField("City, State, Zip", "prev2_city_state_zip")}
                      {renderField("Move-in Date", "prev2_move_in", { type: "date" })}
                      {renderField("Move-out Date", "prev2_move_out", { type: "date" })}
                      {renderField("Landlord Name", "prev2_landlord_name")}
                      {renderField("Landlord Phone", "prev2_landlord_phone", { type: "tel" })}
                      {renderField("Monthly Rent", "prev2_monthly_rent", { placeholder: "$" })}
                      <div className="col-span-full">
                        {renderField("Reason for Moving", "prev2_reason_moving")}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Employment */}
              {currentSection === 2 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" /> Employment & Income
                  </h2>
                  <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                    Please include all sources of income. Use additional information section if needed. <strong>Self-employed:</strong> Please supply tax returns for previous two years and two most recent bank statements.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderField("Current Employer", "current_employer")}
                    {renderField("Position", "employer_position")}
                    {renderField("Employer Phone", "employer_phone", { type: "tel" })}
                    {renderField("Supervisor Name", "supervisor_name")}
                    {renderField("Gross Wages (Monthly)", "gross_wages", { placeholder: "$" })}
                    {renderField("Hire Date", "hire_date", { type: "date" })}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Other Income</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderField("Other Income Sources", "other_income_sources")}
                      {renderField("Amount (Monthly)", "other_income_amount", { placeholder: "$" })}
                      <div className="col-span-full">
                        {renderField("Explain Other Income", "other_income_explain")}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: General Questions */}
              {currentSection === 3 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" /> General Questions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderField("How long do you plan to live here?", "how_long_live_here")}
                    {renderField("Do you have pets? If so, describe", "pets")}
                    {renderField("Number of evictions", "evictions_count", { placeholder: "0" })}
                    {renderField("Number of felonies", "felonies_count", { placeholder: "0" })}
                    {renderField("Have you broken a lease?", "broken_lease", { placeholder: "Yes/No - explain" })}
                    {renderField("Do you smoke?", "smoke", { placeholder: "Yes/No" })}
                    {renderField("Number of vehicles", "vehicles_count", { placeholder: "0" })}
                    {renderField("Total move-in $ available", "total_move_in_available", { placeholder: "$" })}
                    {renderField("Desired move-in date", "desired_move_in", { type: "date" })}
                    {renderField("How did you hear about us?", "how_heard")}
                  </div>

                  <div className="col-span-full">
                    <Label htmlFor="reasons_not_pay_rent">Are there any reasons you may not be able to pay rent on time?</Label>
                    <Textarea
                      id="reasons_not_pay_rent"
                      name="reasons_not_pay_rent"
                      value={form.reasons_not_pay_rent}
                      onChange={handleChange}
                      rows={2}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Financial</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderField("Do you have a checking account?", "has_checking_account", { placeholder: "Yes/No" })}
                      {renderField("Checking balance", "checking_balance", { placeholder: "$" })}
                      {renderField("Do you have a savings account?", "has_savings_account", { placeholder: "Yes/No" })}
                      {renderField("Savings balance", "savings_balance", { placeholder: "$" })}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Emergency Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderField("Emergency Contact Name", "emergency_name")}
                      {renderField("Emergency Contact Phone", "emergency_phone", { type: "tel" })}
                      {renderField("Relationship", "emergency_relationship")}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <Label htmlFor="why_rent_to_you">Why should we rent to you?</Label>
                    <Textarea
                      id="why_rent_to_you"
                      name="why_rent_to_you"
                      value={form.why_rent_to_you}
                      onChange={handleChange}
                      rows={3}
                    />
                    <Label htmlFor="additional_info">Additional information</Label>
                    <Textarea
                      id="additional_info"
                      name="additional_info"
                      value={form.additional_info}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Section 5: Authorization & Signature */}
              {currentSection === 4 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Authorization & Signature
                  </h2>

                  <div className="bg-secondary/50 rounded-xl p-6 text-sm text-muted-foreground space-y-5 max-h-80 overflow-y-auto">
                    <p className="text-foreground">
                      Please read carefully and sign and date below if you agree. Applicant certifies that the information contained in this application is true and correct. Applicant understands that false or misleading information is grounds for immediate disqualification.
                    </p>

                    <div>
                      <p className="font-semibold text-foreground mb-2">AUTHORIZATION</p>
                      <p>
                        Applicant authorizes the Landlord or Landlord's representatives to make any inquiries deemed necessary to verify Applicant is the most qualified based on the below stated qualification standards. This verification includes, but is not limited to, direct contact with Applicant's employers, current landlord, previous landlords, friends, personal and professional references, law enforcement agencies, government agencies, consumer reporting agencies, public records eviction records, and any other sources of information which the Landlord or Landlord's representative may deem necessary.
                      </p>
                      <p className="mt-2">
                        Applicant verifies that the Landlord and Landlord's representatives shall not be held liable for damages of any kind that result from the verification of the information provided. This authorization shall extend through Applicant's tenancy to ensure continued compliance to the terms of tenancy or to recover any financial obligations relating to Applicant's tenancy, and beyond the expiration of Applicant's tenancy for recovery of any financial obligations, or for any other acceptable purpose.
                      </p>
                      <p className="mt-2">
                        Should the Applicant be denied or face other adverse action based on information received in a consumer report, the Applicant has a right to obtain a free copy of the consumer report, and to dispute the accuracy of the information it contains by contacting the Consumer Reporting Agency.
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-foreground mb-2">HOLDING FEE</p>
                      <p>
                        Upon the verbal or written approval of the Applicant's tenancy, if tenant will not be taking occupancy immediately, a Deposit to Hold Agreement will be executed and signed by all parties and a non-refundable holding fee shall be required within 24 hours, hereinafter referred to as "Deposit to Hold" in the amount equal to one month's rent to hold the property until a mutually agreed upon move-in date. Applicant understands that no rental will be held for more than 14 days.
                      </p>
                      <p className="mt-2">
                        The Deposit to Hold removes the property from public offering and holds the home exclusively for the Applicant until all other requirements have been met. After all requirements have been met and a lease for the property completed, the Deposit to Hold will transfer to the security deposit to be held throughout the tenant's entire tenancy.
                      </p>
                      <p className="mt-2">
                        If the Applicant fails to provide the Deposit to Hold within 24 hours of approval, the Applicant may be disqualified and the home will be offered to the next qualified applicant. After approval and before occupancy will be granted, Applicant must supply all the required move-in funds, including the security deposit, first month's rent, and any other additional deposits and fees, all tenant paid utilities must be transferred into Applicant's name, and a lease must be executed and signed by all parties.
                      </p>
                      <p className="mt-2">
                        If for any reason, the Applicant fails to complete all move-in requirements the landlord will return the property to public offering and the entire Deposit to Hold will be forfeited to the Landlord for expenses including, but not limited to, lost rent, holding costs, advertising costs, and marketing costs.
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-foreground mb-2">QUALIFICATION STANDARDS</p>
                      <p className="mb-2">Your Application will be denied if you do not meet the below standards for qualification.</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Applicant must have current photo identification and a valid social security number.</li>
                        <li>Applicant's monthly household income must exceed three times the rent. All income must be from a verifiable source. Unverifiable income will not be considered.</li>
                        <li>Applicants must receive positive references from all previous landlords for the previous 5 years.</li>
                        <li>Applicant may not have any evictions or unpaid judgments from previous landlords.</li>
                        <li>Applicant must exhibit a responsible financial life. Credit score must be a minimum of 600.</li>
                        <li>A background check will be conducted on all applicants over 18. Applicant's background must exhibit a pattern of responsibility.</li>
                        <li>Applicant must be a non-smoker.</li>
                        <li>Occupancy is limited to 2 people per bedroom.</li>
                      </ul>
                      <p className="mt-2">
                        At landlord's discretion, compensating factors such as an additional security deposit or co-signer (guarantor) may be required for qualification if Applicant fails to meet any one of the above requirements. In the event of multiple applicants, tenancy will be granted to the most qualified, based on the above criteria.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agree_terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    />
                    <Label htmlFor="agree_terms" className="text-sm leading-relaxed cursor-pointer">
                      I have read and agree to the above authorization and qualification standards. I certify that all 
                      information provided is true and complete.
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <Label htmlFor="applicant_signature">
                        Applicant Signature (Type Full Legal Name) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="applicant_signature"
                        name="applicant_signature"
                        required
                        value={form.applicant_signature}
                        onChange={handleChange}
                        placeholder="Type your full legal name"
                        className="font-serif italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signature_date">Date</Label>
                      <Input
                        id="signature_date"
                        name="signature_date"
                        type="date"
                        value={form.signature_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  disabled={currentSection === 0}
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Section {currentSection + 1} of {sections.length}
                </span>

                {currentSection < sections.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentSection(currentSection + 1)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !agreedToTerms}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RentalApplication;
