import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { Button } from "@/components/ui/button";
import { MarkProductAsSold } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardRoute() {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dashboardData = await getDashboardData();

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 mb-14">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From all sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Express Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.expressRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From express listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.marketRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From market listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.soldProducts} sold out of {dashboardData.totalProducts}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sold Products</CardTitle>
          <CardDescription>
            Products you have successfully sold
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.soldProducts.length === 0 ? (
            <p className="text-muted-foreground">No products sold yet.</p>
          ) : (
            <div className="space-y-4">
              {dashboardData.soldProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Sold on {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                    <Badge variant={product.listingType === 'EXPRESS' ? 'default' : 'secondary'}>
                      {product.listingType}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatCurrency(product.revenue)}</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
