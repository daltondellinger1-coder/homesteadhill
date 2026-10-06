import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { UNIT13_VIDEO } from "@/data/unit13Video";

/**
 * Unit 13 video tour section. Rendered on /units/unit-13 only, directly after
 * the photo gallery and before amenities. The vertical video is never cropped
 * or stretched: the player keeps a 9:16 frame with object-contain.
 */
export const Unit13Video = () => {
  const { videoUrl, posterUrl } = UNIT13_VIDEO;

  if (!videoUrl) return null;

  return (
    <section className="mt-10 mb-12" aria-label="Unit 13 video tour">
      <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-3">
        Make yourself at home in Vincennes
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
        Get a closer look at Unit 13, a furnished one-bedroom cottage at
        Homestead Hill. See the living room, private bedroom, both sides of the
        kitchen, desk, bathroom, and your entrance. Guests also have access to
        free shared laundry on the property.
      </p>

      <div className="bg-gradient-card rounded-2xl border border-border p-4 sm:p-6">
        <div
          className="mx-auto w-full"
          style={{ maxWidth: "min(100%, 420px)" }}
        >
          <video
            controls
            playsInline
            preload="metadata"
            poster={posterUrl || undefined}
            className="w-full h-auto rounded-xl bg-background block"
            style={{ aspectRatio: "9 / 16", objectFit: "contain" }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        </div>

        <div className="mt-6 text-center">
          <Button asChild size="lg">
            <Link to="/contact?unit=unit-13">Ask about monthly availability</Link>
          </Button>
        </div>

        <details className="mt-4 group text-center">
          <summary className="inline-flex items-center gap-1 cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground transition-colors list-none">
            Music
            <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
          </summary>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Funkorama by Kevin MacLeod (
            <a
              href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100474"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              incompetech.com
            </a>
            ), licensed under{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CC BY 4.0
            </a>
            . Edited, excerpted and mixed for Homestead Hill.
          </p>
        </details>
      </div>
  </section>
  );
};
