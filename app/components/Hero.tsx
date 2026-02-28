"use client"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Heading from "./base/common/heading";
import Tags from "./base/common/tags";
import CounterBox from "./containers/store/counter-box";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCategories } from "@/app/actions";

const defaultImages = [
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1974&auto=format&fit=crop",
].slice(0, 5); // Ensure max 5 default images

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl?: string;
  linkUrl?: string;
  description?: string;
  position: number;
}

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState<string[]>(["All", "Properties", "Cars", "Mobiles"]);
  const [carouselAds, setCarouselAds] = useState<Advertisement[]>([]);
  const [carouselLinks, setCarouselLinks] = useState<string[]>([]);
  const [imageError, setImageError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentVideoRef, setCurrentVideoRef] = useState<HTMLVideoElement | null>(null);
  const router = useRouter();



  const goToPrevious = () => {
    // Pause current video if playing
    if (currentVideoRef && isVideoPlaying) {
      currentVideoRef.pause();
      setIsVideoPlaying(false);
    }

    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselAds.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    // Pause current video if playing
    if (currentVideoRef && isVideoPlaying) {
      currentVideoRef.pause();
      setIsVideoPlaying(false);
    }

    setCurrentIndex((prevIndex) =>
      prevIndex === carouselAds.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleSlideClick = () => {
    const currentLink = carouselLinks[currentIndex];
    if (currentLink) {
      window.open(currentLink, '_blank');
    }
  };

  const handleVideoPlay = (videoRef: HTMLVideoElement) => {
    setCurrentVideoRef(videoRef);
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  // Fetch advertisements from database
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await fetch("/api/ads");
        if (response.ok) {
          const data = await response.json();
          const ads = data.ads || [];

          if (ads.length > 0) {
            // Limit to maximum 5 advertisements
            const limitedAds = ads.slice(0, 5);
            setCarouselAds(limitedAds);
            setCarouselLinks(limitedAds.map((ad: Advertisement) => ad.linkUrl || ""));
          } else {
            // Use default images if no ads found (limit to 5)
            const defaultAds = defaultImages.slice(0, 5).map((url, index) => ({
              id: `default-${index}`,
              title: `Default Slide ${index + 1}`,
              imageUrl: url,
              videoUrl: undefined,
              linkUrl: "",
              description: "",
              position: index
            }));
            setCarouselAds(defaultAds);
            setCarouselLinks([]);
          }
        } else {
          // Use default images if API fails (limit to 5)
          const defaultAds = defaultImages.slice(0, 5).map((url, index) => ({
            id: `default-${index}`,
            title: `Default Slide ${index + 1}`,
            imageUrl: url,
            videoUrl: undefined,
            linkUrl: "",
            description: "",
            position: index
          }));
          setCarouselAds(defaultAds);
          setCarouselLinks([]);
        }
      } catch (error) {
        console.error("Failed to fetch advertisements:", error);
        // Use default images if fetch fails (limit to 5)
        const defaultAds = defaultImages.slice(0, 5).map((url, index) => ({
          id: `default-${index}`,
          title: `Default Slide ${index + 1}`,
          imageUrl: url,
          videoUrl: undefined,
          linkUrl: "",
          description: "",
          position: index
        }));
        setCarouselAds(defaultAds);
        setCarouselLinks([]);
      }
    };

    fetchAdvertisements();
  }, []);

  // Reset currentIndex when carouselAds changes to prevent out-of-bounds
  useEffect(() => {
    if (currentIndex >= carouselAds.length && carouselAds.length > 0) {
      setCurrentIndex(0);
    }
  }, [carouselAds, currentIndex]);

  // Auto-slide every 4 seconds (only if video is not playing)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isVideoPlaying) {
        setCurrentIndex((prevIndex) => {
          const length = carouselAds.length;
          return length === 0 ? 0 : (prevIndex === length - 1 ? 0 : prevIndex + 1);
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [carouselAds.length, isVideoPlaying]);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        // Extract category names from the array of objects
        const categoryNames = fetchedCategories.map((cat: any) =>
          typeof cat === 'string' ? cat : cat.name || cat
        );
        setCategories(categoryNames);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Keep default categories if fetch fails
      }
    };

    fetchCategories();
  }, []);

  const handleShopNow = () => {
    router.push('/products/all');
  };

  const handleCategoryClick = (category: string) => {
    const categoryPath = category.toLowerCase() === "all" ? "all" : category.toLowerCase();
    router.push(`/products/${categoryPath}`);
  };

  return (
    <section className="@container container mx-auto space-y-8 px-4 pt-[10px]">
      <div className="relative rounded-2xl border border-dashed">
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl rounded-b-none h-[420px]">
            {carouselAds[currentIndex] && (
              <div className="relative w-full h-full">
                {carouselAds[currentIndex].videoUrl ? (
                  <video
                    src={carouselAds[currentIndex].videoUrl}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${carouselLinks[currentIndex] ? 'cursor-pointer' : ''}`}
                    onClick={handleSlideClick}
                    onPlay={(e) => handleVideoPlay(e.currentTarget)}
                    onPause={handleVideoPause}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : carouselAds[currentIndex].imageUrl ? (
                  <Image
                    src={carouselAds[currentIndex].imageUrl}
                    alt={carouselAds[currentIndex].title || `Hero slide ${currentIndex + 1}`}
                    fill
                    className={`object-cover transition-opacity duration-500 ${carouselLinks[currentIndex] ? 'cursor-pointer' : ''}`}
                    onClick={handleSlideClick}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="h-[420px] bg-gray-200 flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}

                {/* Advertisement title overlay */}
                {carouselAds[currentIndex].title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h2 className="text-white text-2xl font-bold mb-2">
                      {carouselAds[currentIndex].title}
                    </h2>
                    {carouselAds[currentIndex].description && (
                      <p className="text-white/90 text-sm">
                        {carouselAds[currentIndex].description}
                      </p>
                    )}
                  </div>
                )}

                {/* Video playing indicator */}
                {carouselAds[currentIndex].videoUrl && isVideoPlaying && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Playing Video
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-foreground hover:bg-black/70 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-foreground hover:bg-black/70 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {carouselAds.map((_: Advertisement, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${index === currentIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/70"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Show link indicator if current slide has a link */}
            {carouselLinks[currentIndex] && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10 flex items-center">
                <ArrowRight className="h-3 w-3 mr-1" />
                Click to visit
              </div>
            )}
          </div>

          <div className="-translate-x-1/2 -bottom-12 absolute left-1/2">
            <div className="relative flex h-[94px] w-[198px] items-center justify-center rounded-2xl bg-background">
              <div className="flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  type="button"
                  className="@6xl:h-14 h-12 @6xl:px-6 py-3 text-lg border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-md hover:scale-105 transition-all duration-300 group"
                  onClick={handleShopNow}
                >
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    Shop now
                  </span>
                  <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid @4xl:grid-cols-2 grid-cols-1 gap-8">
          <div className="space-y-8 @4xl:p-12 @6xl:p-[60px] @7xl:p-20 p-3 pt-14">
            <Tags items={categories} onItemClick={handleCategoryClick} />
          </div>
        </div>
      </div>
    </section>
  );
}
