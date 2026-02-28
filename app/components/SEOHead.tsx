'use client';

import { generateJSONLD } from '@/app/lib/seo';
import Script from 'next/script';

interface SEOHeadProps {
  structuredData: any;
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
}

export function SEOHead({ structuredData, title, description, canonical, noIndex }: SEOHeadProps) {
  return (
    <>
      {structuredData && (
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={generateJSONLD(structuredData)}
        />
      )}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </>
  );
}
