import { notFound } from "next/navigation";
import prisma from "../lib/db";
import { LoadingProductCard, ProductCard } from "./ProductCard";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface iAppProps {
  category: "newest" | "properties" | "gadgets" | "cars" | "others";
}

async function getData({ category }: iAppProps) {
  switch (category) {
    case "others": {
      const data = await prisma.product.findMany({
        where: {
          category: "others",
          status: "APPROVED",
        },
        select: {
          price: true,
          name: true,
          smallDescription: true,
          id: true,
          images: true,
          productVideo: true,
          location: true,
          listingType: true,
          phoneNumber: true,
        },
        take: 3,
      });

      return {
        data: data,
        title: "Others",
        link: "/products/others",
      };
    }
    case "newest": {
      const data = await prisma.product.findMany({
        where: {
          status: "APPROVED",
        },
        select: {
          price: true,
          name: true,
          smallDescription: true,
          id: true,
          images: true,
          productVideo: true,
          location: true,
          listingType: true,
          phoneNumber: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      });

      return {
        data: data,
        title: "Newest Products",
        link: "/products/all",
      };
    }
    case "properties": {
      const data = await prisma.product.findMany({
        where: {
          category: "properties",
          status: "APPROVED",
        },
        select: {
          id: true,
          name: true,
          price: true,
          smallDescription: true,
          images: true,
          productVideo: true,
          location: true,
          listingType: true,
          phoneNumber: true,
        },
        take: 3,
      });

      return {
        title: "Properties",
        data: data,
        link: "/products/properties",
      };
    }
    case "gadgets": {
      const data = await prisma.product.findMany({
        where: {
          category: "gadgets",
          status: "APPROVED",
        },
        select: {
          id: true,
          name: true,
          price: true,
          smallDescription: true,
          images: true,
          productVideo: true,
          location: true,
          listingType: true,
          phoneNumber: true,
        },
        take: 3,
      });

      return {
        title: "Gadgets",
        data: data,
        link: "/products/gadgets",
      };
    }
    case "cars": {
      const data = await prisma.product.findMany({
        where: {
          category: "cars",
          status: "APPROVED",
        },
        select: {
          id: true,
          name: true,
          price: true,
          smallDescription: true,
          images: true,
          productVideo: true,
          location: true,
          listingType: true,
          phoneNumber: true,
        },
        take: 3,
      });

      return {
        title: "Cars",
        data: data,
        link: "/products/cars",
      };
    }
    default: {
      return notFound();
    }
  }
}

export function ProductRow({ category }: iAppProps) {
  return (
    <section className="mt-12">
      <Suspense fallback={<LoadingState />}>
        <LoadRows category={category} />
      </Suspense>
    </section>
  );
}

async function LoadRows({ category }: iAppProps) {
  const data = await getData({ category: category });
  return (
    <>
      <div className="md:flex md:items-center md:justify-between">
        <h2 className="text-2xl font-extrabold tracking-tighter ">
          {data.title}
        </h2>
        <Link
          href={data.link}
          className="text-sm hidden font-medium text-primary hover:text-primary/90 md:block"
        >
          All Products <span>&rarr;</span>
        </Link>
      </div>

      {data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No products found
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            No products available in this category yet.
          </p>
          <Link
            href={data.link}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            View all products
          </Link>
        </div>
      ) : (
        <div className="grid gird-cols-1 lg:grid-cols-3 sm:grid-cols-2 mt-4 gap-10">
          {data.data.map((product) => (
            <ProductCard
              images={product.images}
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              smallDescription={product.smallDescription}
              productVideo={product.productVideo}
              location={product.location}
              listingType={product.listingType}
              phoneNumber={product.phoneNumber}
            />
          ))}
        </div>
      )}
    </>
  );
}

function LoadingState() {
  return (
    <div>
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-10 lg:grid-cols-3">
        <LoadingProductCard />
        <LoadingProductCard />
        <LoadingProductCard />
      </div>
    </div>
  );
}
