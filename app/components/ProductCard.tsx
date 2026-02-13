"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Video } from "lucide-react";
import { useState } from "react";

interface iAppProps {
  images: string[];
  name: string;
  price: number;
  smallDescription: string;
  id: string;
  productVideo?: string | null;
  location?: string | null;
  listingType?: "EXPRESS" | "MARKET" | null;
  phoneNumber?: string | null;
}

export function ProductCard({
  images,
  id,
  price,
  smallDescription,
  name,
  productVideo,
  location,
  listingType,
  phoneNumber,
}: iAppProps) {
  const hasVideo = !!productVideo;
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="rounded-lg relative">
      <Carousel className="w-full mx-auto">
        <CarouselContent>
          {/* Show video first if it exists */}
          {hasVideo && !videoError && (
            <CarouselItem>
              <div className="relative h-[230px] bg-muted">
                <video
                  src={productVideo}
                  className="w-full h-full object-cover rounded-lg"
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  poster=""
                  onError={() => setVideoError(true)}
                >
                  Your browser does not support the video tag.
                </video>
                {/* Video indicator badge */}
                <div className="absolute top-2 left-2 bg-black/70 text-foreground px-2 py-1 rounded-full flex items-center gap-1 text-xs pointer-events-none">
                  <Video className="h-3 w-3 text-white" />
                  <span>Video</span>
                </div>
              </div>
            </CarouselItem>
          )}

          {/* Show video error fallback */}
          {hasVideo && videoError && (
            <CarouselItem>
              <div className="relative h-[230px] bg-muted flex flex-col items-center justify-center">
                <Video className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center px-4">
                  Video unavailable
                </p>
                <div className="absolute top-2 left-2 bg-black/70 text-foreground px-2 py-1 rounded-full flex items-center gap-1 text-xs pointer-events-none">
                  <Video className="h-3 w-3" />
                  <span>Video</span>
                </div>
              </div>
            </CarouselItem>
          )}

          {/* Show images */}
          {images.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[230px]">
                <Image
                  alt="Product image"
                  src={item}
                  fill
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-16" />
        <CarouselNext className="mr-16" />
      </Carousel>

      <div className="flex justify-between items-center mt-2">
        <h1 className="font-semibold text-xl">{name}</h1>
        <h3 className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset  ring-primary/10">
          ₦{price.toLocaleString()}
        </h3>
      </div>

      <p className="text-muted-foreground line-clamp-2 text-sm mt-2">
        {smallDescription}
      </p>

      {/* Display additional product information */}
      <div className="flex flex-wrap gap-2 mt-3">
        {listingType && (
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/10">
            {listingType}
          </span>
        )}
        {location && (
          <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-muted/20">
            📍 {location}
          </span>
        )}
        {/* {phoneNumber && (
          <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
            📞 {phoneNumber}
          </span>
        )} */}

        <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
          📞 +234 906 656 2639
        </span>
      </div>

      <Button asChild className="w-full mt-5">
        <Link href={`/product/${id}`}>View</Link>
      </Button>
    </div>
  );
}

export function LoadingProductCard() {
  return (
    <div className="flex flex-col">
      <Skeleton className="w-full h-[230px]" />
      <div className="flex flex-col mt-2 gap-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="w-full h-6" />
      </div>

      <Skeleton className="w-full h-10 mt-5" />
    </div>
  );
}
