"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";

interface NavbarLink {
  id: number;
  name: string;
  href: string;
}

export function MobileMenu() {
  const [navbarLinks, setNavbarLinks] = useState<NavbarLink[]>([
    {
      id: 0,
      name: "Home",
      href: "/",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const location = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          const categories = data.categories || [];

          // Only show categories that have approved products
          const categoriesWithProducts = categories
            .filter((cat: any) => cat.count > 0)
            .map((cat: any, index: number) => ({
              id: index + 1,
              name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
              href: `/products/${cat.name}`,
            }));

          setNavbarLinks(prev => [...prev, ...categoriesWithProducts]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="mt-5 flex px-2 space-y-1 flex-col">
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="mt-5 flex px-2 space-y-1 flex-col">
          {/* Mobile Search */}
          <div className="mb-4">
            <SearchBar />
          </div>

          {/* Navigation Links */}
          {navbarLinks.map((item) => (
            <Link
              href={item.href}
              key={item.id}
              className={cn(
                location === item.href
                  ? "bg-muted"
                  : "hover:bg-muted hover:bg-opacity-75",
                "group flex items-center px-2 py-2 font-medium rounded-md"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
