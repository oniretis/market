"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navbarLinks = [
  {
    id: 0,
    name: "Home",
    href: "/",
  },
  {
    id: 1,
    name: "Properties",
    href: "/products/properties",
  },
  {
    id: 2,
    name: "Gadgets",
    href: "/products/gadgets",
  },
  {
    id: 3,
    name: "Cars",
    href: "/products/cars",
  },
  {
    id: 4,
    name: "Others",
    href: "/products/others",
  },
];

export function NavbarLinks() {
  const location = usePathname();

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
