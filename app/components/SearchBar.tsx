"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, TrendingUp, Clock, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  smallDescription: string;
  images: string[];
  averageRating: number;
  reviewCount: number;
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
  suggestions?: string[];
  categories?: { name: string; count: number }[];
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage when it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const addToSearchHistory = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 2) return;

    setSearchHistory(prev => {
      const newHistory = [trimmedQuery, ...prev.filter(item => item !== trimmedQuery)];
      return newHistory.slice(0, 5); // Keep only last 5 searches
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data: SearchResult = await response.json();

        if (response.ok) {
          setResults(data.products);
          setSuggestions(data.suggestions || []);
          setCategories(data.categories || []);
          setIsOpen(data.products.length > 0 || data.suggestions.length > 0 || data.categories.length > 0);
        } else {
          setResults([]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setSuggestions([]);
        setCategories([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setCategories([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + suggestions.length + searchHistory.length + (categories.length > 0 ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        // Handle selection from dropdown
        const categoriesOffset = categories.length > 0 ? 1 : 0;

        if (activeIndex < results.length) {
          // Select product
          router.push(`/product/${results[activeIndex].id}`);
          handleClear();
        } else if (activeIndex < results.length + suggestions.length) {
          // Select suggestion
          const suggestionIndex = activeIndex - results.length;
          setQuery(suggestions[suggestionIndex]);
          inputRef.current?.focus();
        } else if (activeIndex < results.length + suggestions.length + searchHistory.length) {
          // Select search history item
          const historyIndex = activeIndex - results.length - suggestions.length;
          const historyQuery = searchHistory[historyIndex];
          setQuery(historyQuery);
          addToSearchHistory(historyQuery);
          inputRef.current?.focus();
        }
      } else if (query.trim().length >= 2) {
        // Navigate to search results page
        addToSearchHistory(query);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-xs ${i < fullStars
              ? 'text-yellow-400'
              : i === fullStars && hasHalfStar
                ? 'text-yellow-400'
                : 'text-gray-300'
              }`}
          >
            ★
          </span>
        ))}
        <span className="text-xs text-gray-500 ml-1">
          {rating.toFixed(1)} ({results[0]?.reviewCount || 0})
        </span>
      </div>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative group">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200">
          <Search className="h-4 w-4" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products, categories..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2 && (results.length > 0 || suggestions.length > 0 || categories.length > 0 || searchHistory.length > 0)) {
              setIsOpen(true);
            } else if (query.trim() === '' && searchHistory.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-20 h-11 bg-background border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200 text-sm"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 hover:bg-muted/50 transition-colors duration-200"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isLoading && (
            <div className="h-7 w-7 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-xl border-border/50 backdrop-blur-sm">
          <CardContent className="p-0">
            {results.length > 0 || suggestions.length > 0 || categories.length > 0 || searchHistory.length > 0 ? (
              <>
                {/* Categories Section */}
                {categories.length > 0 && (
                  <div className="p-3 border-b border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Popular Categories</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category, index) => (
                        <Link
                          key={category.name}
                          href={`/products/${category.name.toLowerCase()}`}
                          onClick={() => {
                            setIsOpen(false);
                            handleClear();
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-muted/50 hover:bg-muted transition-colors duration-200 ${activeIndex === 0 ? 'ring-2 ring-primary/50 bg-primary/10' : ''
                            }`}
                        >
                          {category.name}
                          <span className="text-muted-foreground">({category.count})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search History Section */}
                {searchHistory.length > 0 && query.trim() === '' && (
                  <div className="p-3 border-b border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                    </div>
                    <div className="space-y-1">
                      {searchHistory.map((historyItem, index) => {
                        const categoriesOffset = categories.length > 0 ? 1 : 0;
                        const globalIndex = results.length + suggestions.length + index + categoriesOffset;
                        return (
                          <button
                            key={historyItem}
                            onClick={() => {
                              setQuery(historyItem);
                              addToSearchHistory(historyItem);
                              inputRef.current?.focus();
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors duration-200 flex items-center gap-2 ${activeIndex === globalIndex ? 'bg-muted/50 ring-1 ring-primary/50' : ''
                              }`}
                          >
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{historyItem}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggestions Section */}
                {suggestions.length > 0 && (
                  <div className="p-3 border-b border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Suggestions</span>
                    </div>
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => {
                        const categoriesOffset = categories.length > 0 ? 1 : 0;
                        const globalIndex = results.length + index + categoriesOffset + (query.trim() === '' && searchHistory.length > 0 ? searchHistory.length : 0);
                        return (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setQuery(suggestion);
                              inputRef.current?.focus();
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors duration-200 flex items-center gap-2 ${activeIndex === globalIndex ? 'bg-muted/50 ring-1 ring-primary/50' : ''
                              }`}
                          >
                            <Search className="h-3 w-3 text-muted-foreground" />
                            <span>{suggestion}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Products Section */}
                {results.length > 0 && (
                  <>
                    <div className="px-3 py-2 border-b border-border/30">
                      <span className="text-xs font-medium text-muted-foreground">Products</span>
                    </div>
                    <div className="divide-y divide-border/30">
                      {results.slice(0, 5).map((product, index) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => {
                            setIsOpen(false);
                            handleClear();
                          }}
                          className={`block p-3 hover:bg-muted/50 transition-colors duration-150 ${activeIndex === index ? 'bg-muted/50 ring-1 ring-primary/50' : ''
                            }`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border/30">
                                {product.images[0] ? (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    No Image
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                                <span className="text-sm font-semibold text-primary whitespace-nowrap">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                                {product.smallDescription}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-2 py-0.5"
                                  style={{ backgroundColor: `${product.Category.color}20`, color: product.Category.color }}
                                >
                                  {product.Category.name}
                                </Badge>
                                {product.averageRating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs text-gray-600">{product.averageRating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                by {product.User.firstName} {product.User.lastName}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {/* View All Results */}
                {results.length > 5 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    onClick={() => {
                      setIsOpen(false);
                      handleClear();
                    }}
                    className="block p-3 text-center text-sm text-primary hover:bg-muted/50 transition-colors duration-150 border-t border-border/30 font-medium"
                  >
                    View all {results.length} results →
                  </Link>
                )}
              </>
            ) : query.trim().length >= 2 && !isLoading ? (
              <div className="p-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No products found for "{query}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try different keywords or browse categories
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
