import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Terms of Service | Homestead Hill"
        description="Terms of Service for Homestead Hill furnished apartments and cottages in Vincennes, Indiana. Review our rental policies, guest responsibilities, and booking terms."
      />
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16">
        <div className="container max-w-3xl">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-slate max-w-none space-y-8">
            <p className="text-muted-foreground">
              <strong>Last Updated:</strong> January 13, 2026
            </p>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Agreement to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing our website or booking a stay at Homestead Hill, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Booking and Reservations
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>All reservations are subject to availability and confirmation by Homestead Hill.</li>
                <li>A booking is confirmed only after you receive written confirmation from us.</li>
                <li>Rates are subject to change until a reservation is confirmed.</li>
                <li>We reserve the right to refuse service to anyone for any lawful reason.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Payment Terms
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Payment is required to secure your reservation as outlined in your booking confirmation.</li>
                <li>Accepted payment methods will be communicated during the booking process.</li>
                <li>All prices are in US dollars unless otherwise stated.</li>
                <li>A cleaning fee of $100 applies to all stays.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Cancellation Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Our cancellation policy varies based on the length of stay:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Weekly Stays:</strong> Cancellations made 7+ days before check-in receive a full refund. Cancellations within 7 days are non-refundable.</li>
                <li><strong>Monthly Stays:</strong> Cancellations made 14+ days before check-in receive a full refund. Cancellations within 14 days forfeit the first week's payment.</li>
                <li>No-shows forfeit the entire booking amount.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Check-In and Check-Out
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Check-in time is 3:00 PM local time.</li>
                <li>Check-out time is 11:00 AM local time.</li>
                <li>Early check-in or late check-out may be available upon request and is subject to availability.</li>
                <li>Self check-in instructions will be provided prior to your arrival.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Guest Responsibilities
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                As a guest, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Treat the property with care and respect.</li>
                <li>Not exceed the maximum occupancy listed for your unit.</li>
                <li>Comply with all applicable laws and regulations.</li>
                <li>Refrain from smoking inside the units (smoking is prohibited in all indoor areas).</li>
                <li>Keep noise to reasonable levels and respect neighbors.</li>
                <li>Report any damages or maintenance issues promptly.</li>
                <li>Not host events or parties without prior written approval.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Pet Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pets may be allowed in select units with prior approval. A pet deposit or additional cleaning fee may apply. Service animals are welcome in accordance with applicable laws. Please contact us before booking if you plan to bring a pet.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Damages and Liability
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Guests are responsible for any damage caused to the property during their stay.</li>
                <li>Homestead Hill is not liable for loss, theft, or damage to guests' personal belongings.</li>
                <li>We recommend guests obtain travel insurance for their protection.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Property Access
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Homestead Hill reserves the right to enter the property for emergency repairs, scheduled maintenance (with reasonable notice), or if we have reason to believe these Terms of Service are being violated.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on this website, including text, images, logos, and design elements, is the property of Homestead Hill and is protected by copyright laws. You may not reproduce, distribute, or use any content without our written permission.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, Homestead Hill shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or stay at our properties.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of the State of Indiana, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to this page. Your continued use of our services after changes are posted constitutes your acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-3 text-muted-foreground">
                <p><strong>Homestead Hill</strong></p>
                <p>Vincennes, Indiana 47591</p>
                <p>Email: <a href="mailto:booking@homestead-hill.com" className="text-primary hover:underline">booking@homestead-hill.com</a></p>
                <p>Phone: <a href="tel:+18127683108" className="text-primary hover:underline">(812) 768-3108</a></p>
              </div>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-muted-foreground text-sm">
                See also our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> for information on how we handle your personal data.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
