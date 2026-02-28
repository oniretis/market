import PaymentCheckout from "@/app/components/PaymentCheckout";
import prisma from "@/app/lib/db";
import { notFound, redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Truck, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import ProductImage from "../../components/ProductImage";

// Type definitions for better TypeScript safety
interface ProductUser {
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface Product {
  id: string;
  name: string;
  smallDescription: string;
  price: number;
  images: string[];
  isSold: boolean;
  User: ProductUser;
}

interface CheckoutPageProps {
  searchParams: { productId?: string };
}

// Loading component for Suspense with accessibility
function PaymentCheckoutLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading checkout form">
      <div className="animate-pulse">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/4 mb-6"></div>
        <div className="space-y-4">
          <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
          <div className="h-16 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl"></div>
        </div>
      </div>
      <p className="sr-only">Loading payment checkout form...</p>
    </div>
  );
}

// Enhanced product info component with proper image handling
function ProductInfo({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 transform hover:-translate-y-1">
      <div className="relative h-56 w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
        <ProductImage
          src={product.images && product.images.length > 0 ? product.images[0] : ''}
          alt={product.name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.isSold && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive" className="text-sm px-4 py-2 bg-red-600 text-white shadow-lg">
              Sold Out
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
              {product.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
              {product.smallDescription}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white dark:ring-gray-800">
                {product.User.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {product.User.firstName} {product.User.lastName}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Verified Seller
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Naira</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced trust badges with better UX
function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Secure Payment",
      description: "256-bit SSL encryption",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconBg: "bg-blue-100 dark:bg-blue-800"
    },
    {
      icon: Truck,
      title: "Fast Processing",
      description: "Instant confirmation",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconBg: "bg-green-100 dark:bg-green-800"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Always here to help",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconBg: "bg-purple-100 dark:bg-purple-800"
    }
  ];

  return (
    <div className="space-y-4">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className="flex items-center space-x-4 p-4 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-gray-100 dark:border-gray-700"
          >
            <div className={`w-12 h-12 ${badge.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
              <Icon className={`h-6 w-6 ${badge.color}`} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {badge.title}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {badge.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

async function getData(productId: string): Promise<Product> {
  noStore();

  // Input validation
  if (!productId || typeof productId !== 'string' || productId.length < 1) {
    notFound();
  }

  // Basic UUID format validation (simple check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(productId)) {
    notFound();
  }

  try {
    const data = await prisma.product.findUnique({
      where: {
        id: productId,
        status: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        smallDescription: true,
        price: true,
        images: true,
        isSold: true,
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!data) {
      notFound();
    }

    return data as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  // Validate search params
  const productId = searchParams.productId;

  if (!productId) {
    redirect('/');
  }

  // Get user authentication status
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Require authentication for checkout
  if (!user) {
    const encodedProductId = encodeURIComponent(productId);
    redirect(`/api/auth/login?post_login_redirect_url=/payment/checkout?productId=${encodedProductId}`);
  }

  // Get product data with error handling
  let product: Product;
  try {
    product = await getData(productId);
  } catch (error) {
    console.error('Failed to load product:', error);
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link
            href={`/product/${productId}`}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Back to product page"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to product
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Secure Checkout
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Complete your purchase safely and securely with industry-leading encryption
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <section className="lg:col-span-2">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg" aria-hidden="true">
                    1
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Payment Information
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      All transactions are encrypted and secure
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <Suspense fallback={<PaymentCheckoutLoading />}>
                  <PaymentCheckout
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      smallDescription: product.smallDescription,
                      images: product.images as string[],
                      isSold: product.isSold,
                      User: {
                        firstName: product.User.firstName || '',
                        lastName: product.User.lastName || '',
                        email: product.User.email,
                      }
                    }}
                    user={{
                      id: user.id,
                      email: user.email || '',
                      firstName: user.given_name || '',
                      lastName: user.family_name || '',
                    }}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Product Info */}
            <ProductInfo product={product} />

            {/* Trust Badges */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Why Choose Us
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                <TrustBadges />
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  );
}
