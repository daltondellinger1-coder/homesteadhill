import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Page not found | Homestead Hill" description="The page you requested could not be found." noindex />
      <Header />
      <main className="container pt-32 pb-24 text-center">
        <p className="mb-4 text-lg text-primary">404</p>
        <h1 className="mb-6 font-serif text-3xl font-semibold text-foreground">Page not found</h1>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild><Link to="/">Home</Link></Button>
          <Button asChild variant="outline"><Link to="/units">Units</Link></Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
