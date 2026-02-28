import { ProductDescription } from "@/app/components/ProductDescription";
import { ProductReviews } from "@/app/components/ProductReviews";
import PaymentCheckout from "@/app/components/PaymentCheckout";
import ChatWidget from "@/app/components/ChatWidget";
import prisma from "@/app/lib/db";
import { Button } from "@/components/ui/button";
import { unstable_noStore as noStore } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createProductMetadata } from "@/app/lib/seo";
import { generateJSONLD, createProductStructuredData, createBreadcrumbStructuredData } from "@/app/lib/structured-data";
import { Metadata } from "next";
import Head from "next/head";
import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { JSONContent } from "@tiptap/react";
import Image from "next/image";

async function getData(id: string) {
  const data = await prisma.product.findUnique({
    where: {
      id: id,
      status: "APPROVED",
    },
    select: {
      Category: {
        select: {
          name: true,
        },
      },
      description: true,
      smallDescription: true,
      name: true,
      images: true,
      productVideo: true,
      price: true,
      createdAt: true,
      id: true,
      isSold: true,
      location: true,
      listingType: true,
      phoneNumber: true,
      User: {
        select: {
          profileImage: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      Review: {
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          User: {
            select: {
              firstName: true,
            },
          },
        },
        where: {
          isApproved: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });
  return data;
}

// Generate metadata for the product
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getData(params.id);

  if (!data) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return createProductMetadata({
    name: data.name,
    smallDescription: data.smallDescription,
    price: data.price,
    images: data.images as string[],
    category: data.Category.name,
    location: data.location || undefined,
    id: data.id,
  });
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  noStore();

  // Get user authentication status (same pattern as other pages)
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const data = await getData(params.id);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground">The requested product could not be found.</p>
      </div>
    );
  }

  // Create structured data
  const productStructuredData = createProductStructuredData({
    id: data.id,
    name: data.name,
    description: data.description as string,
    smallDescription: data.smallDescription,
    price: data.price,
    images: data.images as string[],
    category: data.Category,
    location: data.location || undefined,
    createdAt: data.createdAt,
    user: data.User,
    reviews: data.Review?.map(review => ({
      rating: review.rating,
      comment: review.comment || '',
      createdAt: review.createdAt,
      user: {
        firstName: review.User?.firstName || '',
      },
    })) || [],
  });

  const breadcrumbStructuredData = createBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: data.Category.name, url: `/products/${data.Category.name.toLowerCase()}` },
    { name: data.name, url: `/product/${data.id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJSONLD(productStructuredData)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJSONLD(breadcrumbStructuredData)}
      />
      <section className="mx-auto px-4  lg:mt-10 max-w-7xl lg:px-8 lg:grid lg:grid-rows-1 lg:grid-cols-7 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
        <Carousel className=" lg:row-end-1 lg:col-span-4">
          <CarouselContent>
            {/* Show video first if it exists */}
            {data?.productVideo && (
              <CarouselItem>
                <div className="aspect-w-4 aspect-h-3 rounded-lg bg-gray-100 overflow-hidden">
                  <video
                    src={data.productVideo}
                    controls
                    className="w-full h-full rounded-lg object-cover"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CarouselItem>
            )}
            {/* Show images */}
            {data?.images.map((item, index) => (
              <CarouselItem key={index}>
                <div className="aspect-w-4 aspect-h-3 rounded-lg bg-gray-100 overflow-hidden">
                  <Image
                    src={item as string}
                    alt="Product image"
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

        <div className="max-w-2xl mx-auto mt-5 lg:max-w-none lg:mt-0 lg:row-end-2 lg:row-span-2 lg:col-span-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {data?.name}
          </h1>

          <p className="mt-2 text-muted-foreground">{data?.smallDescription}</p>

          {/* Payment Button - Redirect to Payment Page */}
          <div className="mt-6">
            <Button
              asChild
              className="w-full"
              size="lg"
            >
              <Link href={`/payment/checkout?productId=${data?.id}`}>
                Proceed to Payment
              </Link>
            </Button>
          </div>

          <div className="border-t border-gray-200 mt-10 pt-10">
            <div className="grid grid-cols-2 w-full gap-y-3">
              <h3 className="text-sm font-medium text-muted-foreground col-span-1">
                Released:
              </h3>
              <h3 className="text-sm font-medium col-span-1">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "long",
                }).format(data?.createdAt)}
              </h3>

              <h3 className="text-sm font-medium text-muted-foreground col-span-1">
                Category:
              </h3>

              <h3 className="text-sm font-medium col-span-1">{data?.Category?.name}</h3>

              {data?.listingType && (
                <>
                  <h3 className="text-sm font-medium text-muted-foreground col-span-1">
                    Listing Type:
                  </h3>
                  <h3 className="text-sm font-medium col-span-1">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/10">
                      {data.listingType}
                    </span>
                  </h3>
                </>
              )}

              {data?.location && (
                <>
                  <h3 className="text-sm font-medium text-muted-foreground col-span-1">
                    Location:
                  </h3>
                  <h3 className="text-sm font-medium col-span-1 text-foreground">
                    📍 {data.location}
                  </h3>
                </>
              )}

              {data?.phoneNumber && (
                <>
                  <h3 className="text-sm font-medium text-muted-foreground col-span-1">
                    Contact:
                  </h3>
                  {/* <h3 className="text-sm font-medium col-span-1">
                  <a
                    href={`tel:${data.phoneNumber}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    📞 {data.phoneNumber}
                  </a>
                </h3> */}
                  <h3 className="text-sm font-medium col-span-1">
                    <a
                      href={`tel:+234 906 656 2639`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                    >
                      📞 +234 906 656 2639
                    </a>
                  </h3>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-10"></div>
        </div>

        <div className="w-full max-w-2xl mx-auto mt-16 lg:max-w-none lg:mt-0 lg:col-span-4 dark:text-white">
          <ProductDescription content={data?.description as JSONContent} />
        </div>

        <div className="w-full max-w-2xl mx-auto mt-5 lg:max-w-none lg:mt-0 lg:col-span-7">
          <ProductReviews
            productId={params.id}
            isAuthenticated={!!user}
            user={user ? {
              id: user.id,
              firstName: user.given_name,
              lastName: user.family_name,
              email: user.email || ""
            } : undefined}
          />
        </div>

        {/* Chat Widget */}
        {data && (
          <ChatWidget
            productId={data.id}
            productName={data.name}
            productImage={data.images[0] as string}
            category={data.Category?.name}
            isAuthenticated={!!user}
            user={user ? {
              id: user.id,
              firstName: user.given_name,
              lastName: user.family_name,
              email: user.email || ""
            } : undefined}
          />
        )}
      </section>
    </>
  );
}
