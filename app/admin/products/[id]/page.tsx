import { requireAdmin } from "@/app/lib/admin";
import { BuyProduct } from "@/app/actions";
import { ProductDescription } from "@/app/components/ProductDescription";
import { BuyButton } from "@/app/components/SubmitButtons";
import prisma from "@/app/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { JSONContent } from "@tiptap/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, Edit, Trash2 } from "lucide-react";

function StatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" }) {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "APPROVED":
      return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;
    case "FLAGGED":
      return <Badge variant="outline" className="bg-red-100 text-red-800">Flagged</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

async function getData(id: string) {
  const data = await prisma.product.findUnique({
    where: {
      id: id,
    },
    select: {
      Category: {
        select: {
          name: true,
          id: true,
        },
      },
      description: true,
      smallDescription: true,
      name: true,
      images: true,
      productVideo: true,
      price: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      approvedAt: true,
      approvedBy: true,
      id: true,
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
    },
  });

  if (!data) {
    notFound();
  }

  return data;
}

export default async function AdminProductPage({
  params,
}: {
  params: { id: string };
}) {
  noStore();
  await requireAdmin();
  const data = await getData(params.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-6 max-w-7xl lg:px-8">
        {/* Admin Header */}
        <div className="mb-6">
          <Link href="/admin/products" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Product Management
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Product View</h1>
              <p className="text-gray-600">View and manage product details</p>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={data.status} />
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/product/${data.id}`} target="_blank">
                  <Eye className="h-4 w-4 mr-1" />
                  Public View
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <Carousel className="w-full">
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

            {/* Product Description */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Product Description</h2>
              <div className="prose max-w-none">
                <ProductDescription content={data?.description as JSONContent} />
              </div>
            </div>
          </div>

          {/* Product Details Sidebar */}
          <div className="space-y-6">
            {/* Product Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{data?.name}</h2>
              <p className="text-gray-600 mb-4">{data?.smallDescription}</p>

              <div className="text-2xl font-bold text-green-600 mb-6">
                ₦{data?.price}
              </div>

              {/* Admin Actions */}
              <div className="space-y-2 mb-6">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href={`/admin/products/${data.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  asChild
                >
                  <Link href={`/admin/products/${data.id}/delete`}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                  </Link>
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm font-medium">
                      {data?.Category?.name || 'Unknown'}
                    </span>
                  </div>

                  {data?.listingType && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Listing Type:</span>
                      <span className="text-sm font-medium">{data.listingType}</span>
                    </div>
                  )}

                  {data?.location && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm font-medium">📍 {data.location}</span>
                    </div>
                  )}

                  {data?.phoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contact:</span>
                      <a
                        href={`tel:${data.phoneNumber}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        📞 {data.phoneNumber}
                      </a>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(data?.createdAt)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Updated:</span>
                    <span className="text-sm font-medium">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(data?.updatedAt)}
                    </span>
                  </div>

                  {data?.approvedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Approved:</span>
                      <span className="text-sm font-medium">
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                        }).format(data.approvedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
              <div className="flex items-center space-x-3 mb-4">
                {data.User.profileImage ? (
                  <Image
                    src={data.User.profileImage}
                    alt={`${data.User.firstName} ${data.User.lastName}`}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {data.User.firstName[0]}{data.User.lastName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {data.User.firstName} {data.User.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{data.User.email}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {data.status === "PENDING" && (
                  <>
                    <Button
                      variant="default"
                      className="w-full bg-green-600 hover:bg-green-700"
                      asChild
                    >
                      <Link href={`/api/admin/products/${data.id}/approve`}>
                        Approve Product
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/api/admin/products/${data.id}/reject`}>
                        Reject Product
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
