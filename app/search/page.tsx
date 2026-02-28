import { Metadata } from 'next';
import { SearchResults } from '@/app/components/SearchResults';

interface SearchPageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';

  if (query) {
    return {
      title: `Search Results for "${query}" - Market`,
      description: `Find products matching "${query}" in our marketplace`,
    };
  }

  return {
    title: 'Search Products - Market',
    description: 'Search for products in our marketplace',
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  return <SearchResults initialQuery={query} />;
}
