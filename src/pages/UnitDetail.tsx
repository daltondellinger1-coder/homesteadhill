import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { SEO, getUnitSEO } from "@/components/SEO";
import { units } from "@/data/units";
import { getUnitPrimaryImage, getUnitGalleryImages } from "@/data/unitImages";
import { ImageLightbox } from "@/components/ImageLightbox";
import { 
  Bed, Bath, Users, Home, ArrowLeft, Check, 
  Star, Wifi, Car, KeyRound, Thermometer, ChevronLeft, ChevronRight
} from "lucide-react";

const UnitDetail = () => {
  const { id } = useParams();
  const unit = units.find(u => u.id === id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const primaryImage = id ? getUnitPrimaryImage(id) : null;
  const galleryImages = id ? getUnitGalleryImages(id) : [];
  const hasImages = galleryImages.length > 0;

  if (!unit) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 md:pt-28 pb-16 md:pb-24">
          <div className="container text-center">
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
              Unit Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The unit you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/units">View All Units</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const unitSEO = getUnitSEO(unit);

  return (
    <div className="min-h-screen bg-background">
      <SEO {...unitSEO} />
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16 md:pb-24">
        <div className="container">
          {/* Back Link */}
          <Link 
            to="/units" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Units
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Main Image - Clickable */}
              <button
                onClick={() => hasImages && setLightboxOpen(true)}
                className="w-full aspect-video bg-navy-light rounded-2xl mb-4 relative overflow-hidden cursor-pointer group"
                aria-label="View all photos"
              >
                {hasImages ? (
                  <img
                    src={galleryImages[activeImageIndex].src}
                    alt={galleryImages[activeImageIndex].alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-24 h-24 text-primary/30" />
                  </div>
                )}
                {unit.featured && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-full">
                    <Star className="w-4 h-4" />
                    Featured
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-secondary text-foreground text-sm font-medium px-4 py-2 rounded-full capitalize">
                    {unit.type}
                  </span>
                </div>
                
                {/* Click to view hint */}
                {hasImages && (
                  <div className="absolute bottom-4 right-4 bg-background/80 text-foreground text-sm font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view all {galleryImages.length} photos
                  </div>
                )}
                
                {/* Navigation arrows */}
                {hasImages && galleryImages.length > 1 && (
                  <>
                    {activeImageIndex > 0 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(activeImageIndex - 1);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 transition-colors cursor-pointer"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </div>
                    )}
                    {activeImageIndex < galleryImages.length - 1 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(activeImageIndex + 1);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 transition-colors cursor-pointer"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    )}
                  </>
                )}
              </button>
              {/* Image Thumbnails */}
              {hasImages && galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                  {galleryImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        activeImageIndex === index 
                          ? "border-primary" 
                          : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Unit Title */}
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                {unit.name}
              </h1>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Sleeps {unit.sleeps}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" />
                  <span>{unit.bedrooms} Bedroom{unit.bedrooms > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-primary" />
                  <span>{unit.baths} Bath</span>
                </div>
                <div className="flex items-center gap-2 text-primary font-medium">
                  {unit.bedType} Bed
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                  About This Unit
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {unit.description}
                </p>
                {unit.priceNote && (
                  <p className="text-primary mt-3 font-medium">{unit.priceNote}</p>
                )}
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {unit.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* House Rules */}
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  House Rules
                </h2>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Check-in: 2:00 PM / Check-out: 11:00 AM</li>
                  <li>• Self check-in with smart lock</li>
                  <li>• No smoking</li>
                  <li>• Quiet hours: 10:00 PM – 8:00 AM</li>
                  <li>• No parties or events</li>
                </ul>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-2">
              <div className="sticky top-28 bg-gradient-card rounded-2xl border border-border p-6">
              {/* Price Display */}
                <div className="text-center mb-6 pb-6 border-b border-border">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xl font-semibold text-primary">
                        ${unit.monthlyPrice.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground text-xs">per month</div>
                    </div>
                    <div className="border-l border-r border-border px-4">
                      <div className="text-xl font-semibold text-foreground">
                        ${Math.round(unit.monthlyPrice / 3.75).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground text-xs">per week</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-foreground">
                        $95
                      </div>
                      <div className="text-muted-foreground text-xs">per night</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">3 night minimum</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Direct booking rates include furnishings, utilities, Wi-Fi, and flexible terms.
                  </p>
                  {unit.priceNote && (
                    <p className="text-xs text-primary mt-1">{unit.priceNote}</p>
                  )}
                </div>

                <h3 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">
                  Book This Unit
                </h3>

                {/* Key Features */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wifi className="w-4 h-4 text-primary" />
                    Fast Wi-Fi
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="w-4 h-4 text-primary" />
                    Free Parking
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <KeyRound className="w-4 h-4 text-primary" />
                    Self Check-in
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Thermometer className="w-4 h-4 text-primary" />
                    A/C & Heat
                  </div>
                </div>

                <Button asChild size="lg" className="w-full mb-3">
                  <Link to={`/contact?unit=${unit.id}`}>Book Now</Link>
                </Button>

                <p className="text-center text-xs text-primary font-medium">
                  Book Direct – No Platform Fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      <ImageLightbox
        images={galleryImages}
        initialIndex={activeImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

export default UnitDetail;
