import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Home } from "lucide-react";

const categories = ["All", "Living", "Bedroom", "Kitchen", "Bath", "Exterior"];

// Placeholder gallery items
const galleryItems = [
  { id: 1, category: "Living", alt: "Stylish living room with comfortable seating" },
  { id: 2, category: "Bedroom", alt: "Cozy bedroom with queen bed" },
  { id: 3, category: "Kitchen", alt: "Full kitchen with modern appliances" },
  { id: 4, category: "Bath", alt: "Modern bathroom" },
  { id: 5, category: "Exterior", alt: "Cottage exterior view" },
  { id: 6, category: "Living", alt: "Open living space" },
  { id: 7, category: "Bedroom", alt: "Premium king bed suite" },
  { id: 8, category: "Kitchen", alt: "Kitchen with Keurig and amenities" },
  { id: 9, category: "Exterior", alt: "Property entrance" },
  { id: 10, category: "Living", alt: "Dedicated workspace area" },
  { id: 11, category: "Bath", alt: "Clean modern bathroom" },
  { id: 12, category: "Bedroom", alt: "Comfortable twin bedroom" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
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
                onClick={() => setActiveCategory(category)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedImage(item.id)}
                className="group relative aspect-[4/3] bg-navy-light rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Home className="w-12 h-12 text-primary/20 group-hover:text-primary/30 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm text-foreground">{item.alt}</span>
                  <span className="block text-xs text-primary mt-1">{item.category}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Lightbox */}
          {selectedImage && (
            <div 
              className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-4xl w-full aspect-video bg-navy-light rounded-2xl flex items-center justify-center">
                <Home className="w-24 h-24 text-primary/30" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 text-foreground hover:text-primary transition-colors text-2xl"
                >
                  ×
                </button>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="text-foreground">
                    {galleryItems.find(i => i.id === selectedImage)?.alt}
                  </span>
                </div>
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
