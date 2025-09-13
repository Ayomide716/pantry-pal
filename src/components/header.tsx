'use client';

import Link from 'next/link';
import { BookHeart, ClipboardList, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import PantryPalLogo from './pantry-pal-logo';
import { usePantry } from '@/hooks/use-pantry';
import { Badge } from './ui/badge';

const NavLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick?: () => void }) => (
    <Button variant="ghost" asChild onClick={onClick}>
      <Link href={href}>{children}</Link>
    </Button>
  );

export default function Header() {
  const { favorites } = usePantry();

  const navItems = (
    <>
      <NavLink href="/favorites">
        <BookHeart className="mr-2 h-4 w-4" />
        Favorites
        {favorites.length > 0 && (
          <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground">
            {favorites.length}
          </Badge>
        )}
      </NavLink>
      <NavLink href="/meal-plan">
        <ClipboardList className="mr-2 h-4 w-4" />
        Meal Plan
      </NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" aria-label="Home">
          <PantryPalLogo />
        </Link>
        <nav className="hidden items-center space-x-2 md:flex">
          {navItems}
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="mt-8 flex flex-col items-start gap-4">
                <SheetClose asChild>
                    <Link href="/" className="mb-4">
                        <PantryPalLogo />
                    </Link>
                </SheetClose>
                <SheetClose asChild><NavLink href="/favorites">Favorites</NavLink></SheetClose>
                <SheetClose asChild><NavLink href="/meal-plan">Meal Plan</NavLink></SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
