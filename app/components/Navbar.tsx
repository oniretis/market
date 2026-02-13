import Link from "next/link";
import Image from "next/image";
import { NavbarLinks } from "./NavbarLinks";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { UserNav } from "./UserNav";

export async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 ">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:grid md:grid-cols-12 md:px-8 md:py-5">

        {/* Logo */}
        <div className="flex md:col-span-3">
          <Link
            href="/"
            className="flex items-center gap-3 group transition-all duration-300 ease-out"
          >
            <div className="">
              <div className="h-9 w-12">
                <Image
                  src="/logos/logo.png"
                  alt="Market Logo"
                  width={64}
                  height={64}
                  priority
                  className=""
                />
              </div>
            </div>


          </Link>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex md:col-span-6 justify-center">
          <NavbarLinks />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:col-span-3 justify-end">
          <ThemeToggle />
          {user ? (
            <UserNav
              email={user.email as string}
              name={user.given_name as string}
              userImage={
                user.picture ??
                `https://avatar.vercel.sh/${user.given_name}`
              }
            />
          ) : (
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                className="hidden sm:flex text-sm font-medium hover:bg-muted/50 transition-all duration-200"
              >
                <LoginLink>Login</LoginLink>
              </Button>

              <Button
                asChild
                size="sm"
                className="text-sm font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:scale-105"
              >
                <RegisterLink>Get Started</RegisterLink>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}