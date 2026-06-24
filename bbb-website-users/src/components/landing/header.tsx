"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useAuthSession } from "@/hooks/useAuthSession";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

export default function HeaderComponent({
  landing = false,
  menu = true,
  bgColor = false,
  className,
}: {
  landing?: boolean;
  menu?: boolean;
  bgColor?: boolean;
  className?: string;
}) {
  const { user, isPending } = useAuthSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Ensure theme is resolved after hydration
    if (resolvedTheme) {
      setIsDark(resolvedTheme === "dark");
    }
  }, [resolvedTheme]);

  return (
    <div
      className={cn(
        landing ? "bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm" : bgColor ? "bg-secondary/40 dark:bg-secondary/20" : "",
        "w-full flex justify-between items-center py-1 sm:py-2 px-5 md:px-10 sm:px-15 lg:px-20 relative",
        className
      )}
    >
      <Link href="/" className="flex items-center justify-center gap-2">
        <Image
          src={
            isDark
              ? "/logo/logo_dark.svg"
              : "/logo/logo_light.svg"
          }
          alt="logo"
          width={180}
          height={80}
          className="w-[7.5rem] sm:w-[8.5rem] md:w-[9rem] h-auto"
          priority
        />
      </Link>
      {menu ? (
        <>
          {/* Centered Links */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link href="/#success-stories" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Success Stories
            </Link>
            <Link href="/feedback" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Feedback
            </Link>
            <Link href="/helpcenter" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Help Center
            </Link>
          </div>
          
          {/* Right Side Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9 rounded-full border-[#E51E44] bg-transparent hover:bg-[#E51E44]/10"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-[#E51E44] transition-colors" />
              ) : (
                <Moon className="h-4 w-4 text-[#E51E44] transition-colors" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            {!isMounted || isPending ? (
              <div className="w-[80px] h-[36px] rounded-lg border border-[#E51E44]/20 animate-pulse"></div>
            ) : user?.id ? (
              <Button
                asChild
                variant="outline"
                className="flex items-center justify-center rounded-lg border border-[#E51E44] text-[#E51E44] hover:bg-[#E51E44]/10 hover:text-[#E51E44] h-8 md:h-9 px-4 md:px-6 bg-transparent"
              >
                <Link
                  href={"/users/home"}
                  className="flex items-center justify-center transition-all duration-300"
                >
                  <span className="text-sm md:text-base font-semibold">Dashboard</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center justify-center rounded-lg border border-[#E51E44] text-[#E51E44] hover:bg-[#E51E44]/10 hover:text-[#E51E44] h-8 md:h-9 px-4 md:px-6 bg-transparent"
                >
                  <Link
                    href={"/auth/login"}
                    className="flex items-center justify-center transition-all duration-300"
                  >
                    <span className="text-sm md:text-base font-semibold">Login</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  className="hidden sm:flex items-center justify-center rounded-lg bg-[#E51E44] text-white hover:bg-[#E51E44]/90 h-8 md:h-9 px-4 md:px-6"
                >
                  <Link
                    href={"/"}
                    className="flex items-center justify-center transition-all duration-300"
                  >
                    <span className="text-sm md:text-base font-semibold">
                      <span className="hidden sm:inline">Register Free</span>
                      <span className="inline sm:hidden">Register</span>
                    </span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Theme Toggle — always visible even when menu is hidden */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 md:h-9 md:w-9 rounded-full border-[#E51E44] bg-transparent hover:bg-[#E51E44]/10"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-[#E51E44] transition-colors" />
            ) : (
              <Moon className="h-4 w-4 text-[#E51E44] transition-colors" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {pathname === "/auth/login" && (
            <>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hidden sm:inline-block">New to Bangali Bibaho Bandhan?</span>
              <Button
                asChild
                variant="outline"
                className="flex items-center justify-center rounded-lg border border-[#E51E44] text-[#E51E44] hover:bg-[#E51E44]/10 hover:text-[#E51E44] h-8 md:h-9 px-4 bg-transparent"
              >
                <Link href="/" className="flex items-center justify-center transition-all duration-300">
                  <span className="text-sm font-semibold">
                    <span className="hidden sm:inline">Create Account</span>
                    <span className="inline sm:hidden">Create</span>
                  </span>
                </Link>
              </Button>
            </>
          )}
          {pathname === "/auth/register" && (
            <>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hidden sm:inline-block">Already have an account?</span>
              <Button
                asChild
                variant="outline"
                className="flex items-center justify-center rounded-lg border border-[#E51E44] text-[#E51E44] hover:bg-[#E51E44]/10 hover:text-[#E51E44] h-8 md:h-9 px-4 bg-transparent"
              >
                <Link href="/auth/login" className="flex items-center justify-center transition-all duration-300">
                  <span className="text-sm font-semibold">Login</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
