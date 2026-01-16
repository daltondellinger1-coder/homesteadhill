import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Privacy Policy | Homestead Hill"
        description="Privacy Policy for Homestead Hill furnished apartments and cottages in Vincennes, Indiana. Learn how we collect, use, and protect your personal information."
      />
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16">
        <div className="container max-w-3xl">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-slate max-w-none space-y-8">
            <p className="text-muted-foreground">
              <strong>Last Updated:</strong> January 13, 2026
            </p>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Homestead Hill ("we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or book a stay with us.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Information We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may collect information about you in a variety of ways, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Personal Data:</strong> Name, email address, phone number, and mailing address when you make a booking inquiry or contact us.</li>
                <li><strong>Booking Information:</strong> Check-in and check-out dates, number of guests, unit preferences, and special requests.</li>
                <li><strong>Payment Information:</strong> Payment details are processed securely through third-party payment processors; we do not store credit card information.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our website, including IP address, browser type, and pages visited.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Process and manage your booking reservations</li>
                <li>Communicate with you about your stay, including confirmations and check-in instructions</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website and services</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Information Sharing
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep this information confidential. We may also disclose your information when required by law or to protect our rights.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Cookies and Tracking
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may use cookies and similar tracking technologies to enhance your browsing experience. You can set your browser to refuse cookies, but some features of our website may not function properly without them.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Your Rights
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>The right to access your personal data</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to request deletion of your data</li>
                <li>The right to opt out of marketing communications</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                To exercise any of these rights, please contact us using the information below.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website is not intended for children under 18 years of age. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-3 text-muted-foreground">
                <p><strong>Homestead Hill</strong></p>
                <p>Vincennes, Indiana 47591</p>
                <p>Email: <a href="mailto:booking@homestead-hill.com" className="text-primary hover:underline">booking@homestead-hill.com</a></p>
                <p>Phone: <a href="tel:+18127683108" className="text-primary hover:underline">(812) 768-3108</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
