import type { Metadata } from 'next';

// Base site configuration
export const siteConfig = {
  name: 'Heywhymarketplace',
  description: 'Buy and sell products online - Your trusted marketplace for quality products',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://heywhymarketplace.com',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/heywhymarket',
    facebook: 'https://facebook.com/heywhymarket',
    instagram: 'https://instagram.com/heywhymarket',
  },
} as const;

// Create base metadata
export function createBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      template: `%s | ${siteConfig.name}`,
      default: siteConfig.name,
    },
    description: siteConfig.description,
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    keywords: [
      'marketplace',
      'buy and sell',
      'online shopping',
      'products',
      'e-commerce',
      'classifieds',
      'local marketplace',
      'second hand',
      'new products',
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: '@heywhymarket',
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
    },
  };
}

// Create page-specific metadata
export function createPageMetadata(options: {
  title?: string;
  description?: string;
  path?: string;
  images?: string[];
  noIndex?: boolean;
  keywords?: string[];
}): Metadata {
  const {
    title,
    description,
    path = '',
    images,
    noIndex = false,
    keywords = [],
  } = options;

  const baseMetadata = createBaseMetadata();
  const url = `${siteConfig.url}${path}`;

  return {
    ...baseMetadata,
    title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
    description: description || siteConfig.description,
    keywords: [...(baseMetadata.keywords as string[]), ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      url,
      images: images?.length
        ? images.map((img, index) => ({
          url: img,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        }))
        : baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      images: images?.[0] || baseMetadata.twitter?.images,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : baseMetadata.robots,
  };
}

// Product-specific metadata
export function createProductMetadata(product: {
  name: string;
  smallDescription: string;
  price: number;
  images: string[];
  category: string;
  location?: string;
  id: string;
}): Metadata {
  const title = product.name;
  const description = `${product.smallDescription} - ${product.category} for ${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price)}`;

  const path = `/product/${product.id}`;
  const keywords = [
    product.name,
    product.category,
    'buy',
    'sale',
    product.location || '',
    'marketplace',
  ].filter(Boolean);

  return createPageMetadata({
    title,
    description,
    path,
    images: product.images,
    keywords,
  });
}

// Category-specific metadata
export function createCategoryMetadata(category: string, count?: number): Metadata {
  const title = `${category} Products`;
  const description = `Browse ${count ? count : ''} ${category.toLowerCase()} products for sale. Find great deals on quality ${category.toLowerCase()} items in our marketplace.`;
  const path = `/products/${category.toLowerCase()}`;
  const keywords = [
    category,
    `${category} for sale`,
    `buy ${category.toLowerCase()}`,
    `${category} marketplace`,
    `second hand ${category.toLowerCase()}`,
  ];

  return createPageMetadata({
    title,
    description,
    path,
    keywords,
  });
}

// Pagination metadata
export function createPaginationMetadata(basePath: string, page: number, totalPages: number): Metadata {
  const path = page > 1 ? `${basePath}?page=${page}` : basePath;
  const prevPage = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null;
  const nextPage = page < totalPages ? `${basePath}?page=${page + 1}` : null;

  return {
    alternates: {
      canonical: `${siteConfig.url}${path}`,
      ...(prevPage && { previous: `${siteConfig.url}${prevPage}` }),
      ...(nextPage && { next: `${siteConfig.url}${nextPage}` }),
    },
  };
}
