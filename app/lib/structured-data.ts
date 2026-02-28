import { Product, Review, User, Category } from '@prisma/client';

// Base structured data with context
function createBaseStructuredData(type: string, data: any) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
}

// Product structured data
export function createProductStructuredData(product: {
  id: string;
  name: string;
  description: string;
  smallDescription: string;
  price: number;
  images: string[];
  category: { name: string };
  location?: string;
  createdAt: Date;
  user: { firstName: string; profileImage?: string };
  reviews?: Array<{
    rating: number;
    comment: string;
    createdAt: Date;
    user: { firstName: string };
  }>;
}) {
  const reviews = product.reviews?.map(review => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.user.firstName,
    },
    datePublished: review.createdAt.toISOString(),
    reviewBody: review.comment,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
  })) || [];

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.reviewRating.ratingValue, 0) / reviews.length
    : undefined;

  return createBaseStructuredData('Product', {
    name: product.name,
    description: product.smallDescription,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: 'Heywhymarketplace',
    },
    category: product.category.name,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Person',
        name: product.user.firstName,
        image: product.user.profileImage,
      },
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.id}`,
    },
    ...(product.location && {
      areaServed: {
        '@type': 'Place',
        name: product.location,
      },
    }),
    datePosted: product.createdAt.toISOString(),
    ...(reviews.length > 0 && {
      aggregateRating: averageRating ? {
        '@type': 'AggregateRating',
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      } : undefined,
      review: reviews,
    }),
  });
}

// Breadcrumb structured data
export function createBreadcrumbStructuredData(breadcrumbs: Array<{
  name: string;
  url: string;
}>) {
  return createBaseStructuredData('BreadcrumbList', {
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  });
}

// Organization structured data
export function createOrganizationStructuredData() {
  return createBaseStructuredData('Organization', {
    name: 'Heywhymarketplace',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    description: 'Buy and sell products online - Your trusted marketplace for quality products',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+234-906-656-2639',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://twitter.com/heywhymarket',
      'https://facebook.com/heywhymarket',
      'https://instagram.com/heywhymarket',
    ],
  });
}

// Website structured data
export function createWebsiteStructuredData() {
  return createBaseStructuredData('WebSite', {
    name: 'Heywhymarketplace',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    description: 'Buy and sell products online - Your trusted marketplace for quality products',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  });
}

// Local business structured data
export function createLocalBusinessStructuredData() {
  return createBaseStructuredData('LocalBusiness', {
    name: 'Heywhymarketplace',
    description: 'Online marketplace for buying and selling products',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    telephone: '+234-906-656-2639',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG',
    },
    openingHours: 'Mo-Su 00:00-23:59',
    priceRange: '$$',
  });
}

// Review structured data
export function createReviewStructuredData(review: {
  rating: number;
  comment: string;
  createdAt: Date;
  user: { firstName: string };
  product: {
    name: string;
    id: string;
  };
}) {
  return createBaseStructuredData('Review', {
    author: {
      '@type': 'Person',
      name: review.user.firstName,
    },
    datePublished: review.createdAt.toISOString(),
    reviewBody: review.comment,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    itemReviewed: {
      '@type': 'Product',
      name: review.product.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${review.product.id}`,
    },
  });
}

// FAQ structured data
export function createFAQStructuredData(faqs: Array<{
  question: string;
  answer: string;
}>) {
  return createBaseStructuredData('FAQPage', {
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  });
}

// Generate JSON-LD script
export function generateJSONLD(data: any) {
  return {
    __html: JSON.stringify(data, null, 2),
  };
}
