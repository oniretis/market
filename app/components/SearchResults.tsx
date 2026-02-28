"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, ArrowLeft, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  smallDescription: string;
  images: string[];
  averageRating: number;
  reviewCount: number;
  createdAt?: string;
  Category: {
    name: string;
    color: string;
  };
  User: {
    firstName: string;
    lastName: string;
  };
}

interface SearchResult {
  products: Product[];
  query: string;
}

interface SearchResultsProps {
  initialQuery: string;
}

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  rating: number;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
}

export function SearchResults({ initialQuery }: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100000],
    rating: 0,
    sortBy: 'relevance'
  });
  const [maxPrice, setMaxPrice] = useState(100000);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setHasSearched(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data: SearchResult = await response.json();

      if (response.ok) {
        setResults(data.products);
        setHasSearched(true);

        // Extract available categories and max price
        const categories = Array.from(new Set(data.products.map(p => p.Category.name)));
        setAvailableCategories(categories);
        const maxProductPrice = Math.max(...data.products.map(p => p.price), 100000);
        setMaxPrice(maxProductPrice);
        setFilters(prev => ({ ...prev, priceRange: [0, maxProductPrice] }));

        // Update URL if query changed
        if (searchQuery.trim() !== (searchParams?.get('q') || '')) {
          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
      } else {
        setResults([]);
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    let filtered = [...results];

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.Category.name)
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Filter by rating
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.averageRating >= filters.rating);
    }

    // Sort results
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      // 'relevance' - keep original order
    }

    setFilteredResults(filtered);
  }, [results, filters]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, maxPrice],
      rating: 0,
      sortBy: 'relevance'
    });
  };

  const activeFilterCount =
    filters.categories.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.sortBy !== 'relevance' ? 1 : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold mb-2">Search Products</h1>
          <p className="text-muted-foreground">
            Find exactly what you&apos;re looking for in our marketplace
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={handleInputChange}
                className="pl-10 text-lg"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || query.trim().length < 2}
              className="px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Results */}
        <div>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching products...</span>
              </div>
            </div>
          )}

          {!isLoading && hasSearched && (
            <>
              {query.trim().length >= 2 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">
                    {results.length > 0
                      ? `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
                      : `No results found for "${query}"`
                    }
                  </h2>
                  {results.length === 0 && (
                    <p className="text-muted-foreground mt-2">
                      Try adjusting your search terms or browse our categories.
                    </p>
                  )}
                </div>
              )}

              {query.trim().length < 2 && hasSearched && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Enter a search term</h3>
                  <p className="text-muted-foreground">
                    Please enter at least 2 characters to search for products.
                  </p>
                </div>
              )}

              {filteredResults.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredResults.map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-0">
                        <Link href={`/product/${product.id}`}>
                          <div className="aspect-square rounded-t-lg overflow-hidden bg-muted">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={300}
                                height={300}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs"
                                style={{ backgroundColor: `${product.Category.color}20`, color: product.Category.color }}
                              >
                                {product.Category.name}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {product.smallDescription}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(product.price)}
                              </span>
                              <div className="text-xs text-gray-500">
                                {product.averageRating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-400">★</span>
                                    <span>{product.averageRating.toFixed(1)}</span>
                                    <span>({product.reviewCount})</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              by {product.User.firstName} {product.User.lastName}
                            </p>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {!hasSearched && !isLoading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Start your search</h3>
              <p className="text-muted-foreground">
                Enter keywords to find products in our marketplace.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
