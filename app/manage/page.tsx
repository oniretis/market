import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import prisma from "@/app/lib/db";
import { ProductManager } from "@/app/components/ProductManager";

export default async function ManageProductsRoute() {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const products = await prisma.product.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      images: true,
      phoneNumber: true,
      location: true,
      listingType: true,
      isSold: true,
      createdAt: true,
    },
  });

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 mb-14">
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Products</CardTitle>
          <CardDescription>
            View and manage all your product listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-muted-foreground">No products listed yet.</p>
          ) : (
            <ProductManager 
              products={products} 
              onProductSold={() => {
                // This will be handled by the component itself
                // In a real app, you might want to revalidate the page
              }} 
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
