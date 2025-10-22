"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export interface HeroSectionProps {
  title?: string;
  description?: string;
  showAuthButtons?: boolean;
  logoSrc?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  className?: string;
  ariaLabel?: string;
}

export function HeroSection({
  title = "Codeguide Starter Fullstack",
  description = "A modern full-stack TypeScript starter with authentication, database, and UI components",
  showAuthButtons = true,
  logoSrc = "/codeguide-logo.png",
  logoAlt = "CodeGuide Logo",
  logoWidth = 50,
  logoHeight = 50,
  className = "",
  ariaLabel,
}: HeroSectionProps) {
  return (
    <section
      className={`text-center py-12 sm:py-16 relative px-4 ${className}`}
      role="banner"
      aria-labelledby="hero-title"
      aria-describedby="hero-description"
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
        <div className="relative">
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={logoWidth}
            height={logoHeight}
            className="rounded-xl sm:w-[60px] sm:h-[60px]"
            priority
            sizes="(max-width: 640px) 50px, 60px"
            style={{
              width: 'auto',
              height: 'auto',
            }}
          />
        </div>
        <h1
          id="hero-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent font-parkinsans"
        >
          {title}
        </h1>
      </div>

      <p
        id="hero-description"
        className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 mb-8"
      >
        {description}
      </p>

      {showAuthButtons && (
        <nav
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          role="navigation"
          aria-label="User authentication"
        >
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto"
            aria-label="Get started with Codeguide Starter Fullstack"
          >
            <Link href="/sign-up" prefetch={true}>
              Get Started
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            aria-label="Sign in to your account"
          >
            <Link href="/sign-in" prefetch={true}>
              Sign In
            </Link>
          </Button>
        </nav>
      )}
    </section>
  );
}