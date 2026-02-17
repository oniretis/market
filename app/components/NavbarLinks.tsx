"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavbarLink {
  id: number;
  name: string;
  href: string;
}

export function NavbarLinks() {
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
      <div className="hidden md:flex justify-center items-center col-span-6 gap-x-1">
        <div className="animate-pulse flex gap-x-1">
          <div className="h-10 w-20 bg-muted rounded"></div>
          <div className="h-10 w-24 bg-muted rounded"></div>
          <div className="h-10 w-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex justify-center items-center col-span-6 gap-x-1">
      {navbarLinks.map((item) => (
        <Link
          href={item.href}
          key={item.id}
          className={cn(
            location === item.href
              ? " text-primary "
              : "text-muted-foreground hover:text-foreground ",
            "group flex items-center text-sm px-5 py-2.5 font-bold transition-all duration-300 relative hover:scale-105"
          )}
        >
          {item.name}
          {location === item.href && (
            <div className="absolute inset-x-0 -bottom-0.5 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
          )}
        </Link>
      ))}
    </div>
  );
}
