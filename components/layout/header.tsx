"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/layout/language-switcher';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const t = useTranslations();
  const router = useRouter();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-sm border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-2xl">Img Gen</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className={cn(
              "relative py-1 transition-all duration-200",
              pathname === "/"
                ? "text-foreground font-medium"
                : "text-foreground/70 hover:text-foreground",
              "group"
            )}
          >
            {t('nav.home')}
            <span className={cn(
              "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300",
              pathname === "/" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            )}></span>
          </Link>
          <Link
            href="/generate"
            className={cn(
              "relative py-1 transition-all duration-200",
              pathname === "/generate"
                ? "text-foreground font-medium"
                : "text-foreground/70 hover:text-foreground",
              "group"
            )}
          >
            {t('nav.generate')}
            <span className={cn(
              "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300",
              pathname === "/generate" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            )}></span>
          </Link>
          <Link
            href="/gallery"
            className={cn(
              "relative py-1 transition-all duration-200",
              pathname === "/gallery"
                ? "text-foreground font-medium"
                : "text-foreground/70 hover:text-foreground",
              "group"
            )}
          >
            {t('nav.gallery')}
            <span className={cn(
              "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300",
              pathname === "/gallery" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            )}></span>
          </Link>
          <Link
            href="/profile"
            className={cn(
              "relative py-1 transition-all duration-200",
              pathname === "/profile"
                ? "text-foreground font-medium"
                : "text-foreground/70 hover:text-foreground",
              "group"
            )}
          >
            {t('nav.profile')}
            <span className={cn(
              "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300",
              pathname === "/profile" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            )}></span>
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" className="gap-1" onClick={isAuthenticated ? () => signOut() : () => router.push('/auth/login')}>
            {isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4 mr-1" />
                {t('cta.signOut')}
              </>
            ) : (
              <  >
                <LogIn className="h-4 w-4 mr-1" />
                {t('cta.signIn')}
              </>
            )}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {
        isOpen && (
          <div className="md:hidden flex flex-col p-4 border-t border-border bg-background/95 backdrop-blur-sm">
            <Link
              href="/"
              className={cn(
                "py-2 relative transition-all duration-200",
                pathname === "/"
                  ? "text-foreground font-medium pl-2 border-l-2 border-primary"
                  : "text-foreground/70 hover:text-foreground hover:pl-2 hover:border-l-2 hover:border-primary/50"
              )}
              onClick={() => setIsOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/generate"
              className={cn(
                "py-2 relative transition-all duration-200",
                pathname === "/generate"
                  ? "text-foreground font-medium pl-2 border-l-2 border-primary"
                  : "text-foreground/70 hover:text-foreground hover:pl-2 hover:border-l-2 hover:border-primary/50"
              )}
              onClick={() => setIsOpen(false)}
            >
              {t('nav.generate')}
            </Link>
            <Link
              href="/gallery"
              className={cn(
                "py-2 relative transition-all duration-200",
                pathname === "/gallery"
                  ? "text-foreground font-medium pl-2 border-l-2 border-primary"
                  : "text-foreground/70 hover:text-foreground hover:pl-2 hover:border-l-2 hover:border-primary/50"
              )}
              onClick={() => setIsOpen(false)}
            >
              {t('nav.gallery')}
            </Link>
            <Link
              href="/profile"
              className={cn(
                "py-2 relative transition-all duration-200",
                pathname === "/profile"
                  ? "text-foreground font-medium pl-2 border-l-2 border-primary"
                  : "text-foreground/70 hover:text-foreground hover:pl-2 hover:border-l-2 hover:border-primary/50"
              )}
              onClick={() => setIsOpen(false)}
            >
              {t('nav.profile')}
            </Link>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
              <LanguageSwitcher />

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setTheme("light")}> <Sun className="h-5 w-5" /> </Button>
                <Button variant="outline" size="icon" onClick={() => setTheme("dark")}> <Moon className="h-5 w-5" /> </Button>
              </div>
            </div>

            <Button variant="default" className="mt-4" onClick={isAuthenticated ? () => signOut() : () => router.push('/auth/login')}>
              {isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('cta.signOut')}
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('cta.signIn')}
                </>
              )}
            </Button>
          </div>
        )
      }
    </header >
  );
};

export default Header;