"use server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ZodStringDef, z } from "zod";
import prisma from "./lib/db";
import { type CategoryTypes } from "@prisma/client";
import { redirect } from "next/navigation";

export type State = {
  status: "error" | "success" | undefined;
  errors?: {
    [key: string]: string[];
  };
  message?: string | null;
};

const productSchema = z.object({
  name: z
    .string()
    .min(3, { message: "The name has to be a min charackter length of 5" }),
  category: z.string().min(1, { message: "Category is required" }),
  price: z.number().min(1, { message: "The Price has to be bigger then 1" }),
  smallDescription: z
    .string()
    .min(10, { message: "Please summerize your product more" }),
  description: z.any().optional(),
  images: z.array(z.string(), { message: "Images are required" }),
  productVideo: z
    .string()
    .optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  listingType: z.enum(["EXPRESS", "MARKET"]).default("MARKET"),
});

const userSettingsSchema = z.object({
  firstName: z
    .string()
    .min(3, { message: "Minimum length of 3 required" })
    .or(z.literal(""))
    .optional(),

  lastName: z
    .string()
    .min(3, { message: "Minimum length of 3 required" })
    .or(z.literal(""))
    .optional(),
});

export async function SellProduct(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("Something went wrong");
  }

  // Check if user exists in database, create if not
  let dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        firstName: user.given_name ?? "",
        lastName: user.family_name ?? "",
        email: user.email ?? "",
        profileImage:
          user.picture ?? `https://avatar.vercel.sh/${user.given_name}`,
      },
    });
  }

  // Parse description safely
  let descriptionValue = null;
  const descriptionRaw = formData.get("description") as string;
  if (descriptionRaw && descriptionRaw !== "null" && descriptionRaw !== "undefined") {
    try {
      descriptionValue = JSON.parse(descriptionRaw);
    } catch (e) {
      console.error("Error parsing description:", e);
      descriptionValue = null;
    }
  }

  // Parse images safely
  let imagesValue = [];
  const imagesRaw = formData.get("images") as string;
  if (imagesRaw && imagesRaw !== "null" && imagesRaw !== "undefined") {
    try {
      imagesValue = JSON.parse(imagesRaw);
    } catch (e) {
      console.error("Error parsing images:", e);
      imagesValue = [];
    }
  }

  const validateFields = productSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    price: Number(formData.get("price")),
    smallDescription: formData.get("smallDescription"),
    description: descriptionValue,
    images: imagesValue,
    productVideo: formData.get("productVideo"),
    phoneNumber: formData.get("phoneNumber"),
    location: formData.get("location"),
    listingType: formData.get("listingType") || "MARKET",
  });

  if (!validateFields.success) {
    const state: State = {
      status: "error",
      errors: validateFields.error.flatten().fieldErrors,
      message: "Oops, I think there is a mistake with your inputs.",
    };

    return state;
  }

  const data = await prisma.product.create({
    data: {
      name: validateFields.data.name,
      category: validateFields.data.category as CategoryTypes,
      smallDescription: validateFields.data.smallDescription,
      price: validateFields.data.price,
      images: validateFields.data.images,
      productVideo: validateFields.data.productVideo,
      phoneNumber: validateFields.data.phoneNumber,
      location: validateFields.data.location,
      listingType: validateFields.data.listingType,
      userId: user.id,
      description: descriptionValue || {},
    },
  });

  return redirect(`/product/${data.id}`);
}

export async function UpdateUserSettings(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("something went wrong");
  }

  const validateFields = userSettingsSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });

  if (!validateFields.success) {
    const state: State = {
      status: "error",
      errors: validateFields.error.flatten().fieldErrors,
      message: "Oops, I think there is a mistake with your inputs.",
    };

    return state;
  }

  const data = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      firstName: validateFields.data.firstName,
      lastName: validateFields.data.lastName,
    },
  });

  const state: State = {
    status: "success",
    message: "Your Settings have been updated",
  };

  return state;
}

export async function getCategories() {
  const categories = await prisma.product.findMany({
    select: {
      category: true,
    },
    distinct: ['category'],
  });

  const uniqueCategories = Array.from(new Set(categories.map(c => c.category)));

  return ["All", ...uniqueCategories.map(cat =>
    cat.charAt(0).toUpperCase() + cat.slice(1)
  )];
}

export async function BuyProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const data = await prisma.product.findUnique({
    where: {
      id: id,
    },
    select: {
      name: true,
      smallDescription: true,
      price: true,
      images: true,
      productVideo: true,
    },
  });

  // TODO: Implement your own payment logic here
  // For now, redirect to a success page
  return redirect(`/payment/success`);
}

export async function MarkProductAsSold(productId: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      isSold: true,
      revenue: product.price,
    },
  });

  return updatedProduct;
}

export async function getUserRevenue(userId: string) {
  const products = await prisma.product.findMany({
    where: {
      userId: userId,
      isSold: true,
    },
    select: {
      revenue: true,
      price: true,
      name: true,
      createdAt: true,
      listingType: true,
    },
  });

  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0);
  const expressRevenue = products
    .filter(p => p.listingType === 'EXPRESS')
    .reduce((sum, product) => sum + product.revenue, 0);
  const marketRevenue = products
    .filter(p => p.listingType === 'MARKET')
    .reduce((sum, product) => sum + product.revenue, 0);

  return {
    totalRevenue,
    expressRevenue,
    marketRevenue,
    soldProducts: products,
  };
}

export async function getDashboardData() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const revenueData = await getUserRevenue(user.id);
  const totalProducts = await prisma.product.count({
    where: { userId: user.id },
  });
  const soldProducts = await prisma.product.count({
    where: {
      userId: user.id,
      isSold: true,
    },
  });
  const activeProducts = totalProducts - soldProducts;

  return {
    ...revenueData,
    totalProducts,
    soldProductsCount: soldProducts,
    activeProducts,
  };
}


