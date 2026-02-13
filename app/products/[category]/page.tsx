import { ProductCard } from "@/app/components/ProductCard";
import prisma from "@/app/lib/db";
import { type CategoryTypes } from "@prisma/client";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

async function getData(category: string) {
  let input: CategoryTypes | undefined;

  switch (category) {
    case "properties": {
      input = "properties";
      break;
    }
    case "gadgets": {
      input = "gadgets";
      break;
    }
    case "cars": {
      input = "cars";
      break;
    }
    case "others": {
      input = "others";
      break;
    }
    case "all": {
      input = undefined;
      break;
    }
    default: {
      return notFound();
    }
  }

  const data = await prisma.product.findMany({
    where: {
      ...(input && { category: input }),
      status: "APPROVED",
    },
    select: {
      id: true,
      images: true,
      smallDescription: true,
      name: true,
      price: true,
    },
  });

  return data;
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  noStore();
  const data = await getData(params.category);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "properties": return "Properties";
      case "gadgets": return "Gadgets";
      case "cars": return "Cars";
      case "others": return "Others";
      case "all": return "All Products";
      default: return "Products";
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8">
      <h1 className="text-3xl font-bold mt-8 mb-6">
        {getCategoryTitle(params.category)}
      </h1>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-muted-foreground"
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
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            There are currently no products in this category. Check back later or be the first to add a product!
          </p>
          <a
            href="/sell"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Sell a Product
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-10 mt-4">
          {data.map((product) => (
            <ProductCard
              key={product.id}
              images={product.images}
              price={product.price}
              name={product.name}
              id={product.id}
              smallDescription={product.smallDescription}
            />
          ))}
        </div>
      )}
    </section>
  );
}
