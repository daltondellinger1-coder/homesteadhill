import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Users, Home, Star } from "lucide-react";
import type { Unit } from "@/data/units";
import { getUnitPrimaryImage, getUnitGalleryImages } from "@/data/unitImages";
import { ImageLightbox } from "@/components/ImageLightbox";

interface UnitCardProps {
  unit: Unit;
}

export function UnitCard({ unit }: UnitCardProps) {
  const primaryImage = getUnitPrimaryImage(unit.id);
  const galleryImages = getUnitGalleryImages(unit.id);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className="group relative bg-gradient-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
        {/* Featured Badge */}
        {unit.featured && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full">
            <Star className="w-3 h-3" />
            Featured
          </div>
        )}

        {/* Unit Image - Clickable for lightbox */}
        <button
          onClick={() => galleryImages.length > 0 && setLightboxOpen(true)}
          className="w-full aspect-[4/3] bg-navy-light relative overflow-hidden cursor-pointer"
          aria-label={`View ${unit.name} photos`}
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={unit.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="w-16 h-16 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          
          {/* Photo count indicator */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-background/80 text-foreground text-xs font-medium px-2 py-1 rounded-full">
              +{galleryImages.length - 1} photos
            </div>
          )}
          
          {/* Unit Type Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-secondary text-foreground text-xs font-medium px-3 py-1.5 rounded-full capitalize">
              {unit.type}
            </span>
          </div>
        </button>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
            {unit.name}
          </h3>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Sleeps {unit.sleeps}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span>{unit.beds} {unit.beds === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span>{unit.baths} Bath</span>
            </div>
          </div>

          {/* Bed Type */}
          <p className="text-sm text-primary mb-3">{unit.bedType} Bed</p>

          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {unit.description}
          </p>

          {/* Price Note */}
          {unit.priceNote && (
            <p className="text-xs text-primary mb-4">{unit.priceNote}</p>
          )}

          {/* CTA */}
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link to={`/units/${unit.id}`}>View Details</Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link to={`/contact?unit=${unit.id}`}>Book Now</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={galleryImages}
        initialIndex={0}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}