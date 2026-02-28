import { ProductRow } from "./components/ProductRow";
import Hero from "./components/Hero";
import prisma from "./lib/db";
import { createPageMetadata, generateJSONLD, createBreadcrumbStructuredData } from "./lib/seo";
import { Metadata } from "next";

// SEO metadata for home page
export const metadata: Metadata = createPageMetadata({
  title: "Home - Buy and Sell Products Online",
  description: "Discover amazing products for sale in our trusted marketplace. Browse categories, find great deals, and sell your items easily.",
  keywords: ["marketplace", "buy and sell", "online shopping", "classifieds", "local marketplace"],
});

async function getCategoriesWithApprovedProducts() {
  try {
    // Get categories that have approved products
    const categoriesWithProducts = await prisma.category.findMany({
      where: {
        isActive: true,
        Product: {
          some: {
            status: "APPROVED"
          }
        }
      },
      select: { name: true },
      orderBy: { name: 'asc' },
      take: 5 // Limit to 5 categories to avoid overcrowding the homepage
    });

    return categoriesWithProducts.map(cat => cat.name);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // Return empty array on error
  }
}

export default async function Home() {
  try {
    const categoriesWithProducts = await getCategoriesWithApprovedProducts();

    return (
      <main>
        <Hero />
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
          <ProductRow category="newest" />
          {categoriesWithProducts.length > 0 ? (
            categoriesWithProducts.map((category: string) => (
              <ProductRow key={category} category={category} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
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
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No products available yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Products will appear here once they are approved by administrators.
              </p>
            </div>
          )}
        </section>
      </main>
    );
  } catch (error) {
    console.error('Home page error:', error);

    // Fallback UI if something goes wrong
    return (
      <main>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <h1 className="text-4xl font-bold text-center mb-8">
            Welcome to Marketplace
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            Loading products...
          </p>
        </div>
      </main>
    );
  }
}
