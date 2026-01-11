import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, pageSEO } from "@/components/SEO";
import { Home, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllGalleryImages, type UnitImage } from "@/data/unitImages";

const categories = ["All", "Living", "Bedroom", "Kitchen", "Bath", "Dining", "Exterior"];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Get all gallery images from units
  const allImages = getAllGalleryImages();

  const filteredItems = activeCategory === "All" 
    ? allImages 
    : allImages.filter(item => item.category === activeCategory);

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredItems.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setSelectedIndex(null);
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO {...pageSEO.gallery} />
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16 md:pb-24">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Gallery
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Take a virtual tour of our fully furnished apartments and cottages.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setSelectedIndex(null);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item, index) => (
                <button
                  key={`${item.unitId}-${index}`}
                  onClick={() => setSelectedIndex(index)}
                  className="group relative aspect-[4/3] bg-navy-light rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm text-foreground font-medium">{item.alt}</span>
                    <span className="block text-xs text-primary mt-1">{item.category}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Home className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No images available in this category yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-2">More photos coming soon!</p>
            </div>
          )}

          {/* Lightbox */}
          {selectedIndex !== null && filteredItems[selectedIndex] && (
            <div 
              className="fixed inset-0 z-50 bg-background/98 flex items-center justify-center p-4"
              onClick={() => setSelectedIndex(null)}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="dialog"
              aria-modal="true"
            >
              <div 
                className="relative max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-navy-light rounded-2xl overflow-hidden">
                  <img
                    src={filteredItems[selectedIndex].src}
                    alt={filteredItems[selectedIndex].alt}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Caption */}
                <div className="mt-4 text-center">
                  <span className="text-foreground font-medium">
                    {filteredItems[selectedIndex].alt}
                  </span>
                  <span className="block text-sm text-muted-foreground mt-1">
                    {selectedIndex + 1} of {filteredItems.length}
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="absolute -top-2 -right-2 md:top-4 md:right-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-full p-2 transition-colors"
                  aria-label="Close lightbox"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Navigation */}
                {selectedIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevious();
                    }}
                    className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 bg-secondary hover:bg-secondary/80 text-foreground rounded-full p-3 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {selectedIndex < filteredItems.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 bg-secondary hover:bg-secondary/80 text-foreground rounded-full p-3 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
