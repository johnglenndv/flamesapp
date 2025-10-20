
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Moon, Sun, Settings, MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useLocations } from '@/hooks/use-locations';
import { Skeleton } from '../ui/skeleton';
import { Location, useAppContext } from '@/context/app-context';


const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/features', label: 'Features' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

  return (
    <header className={cn("flex items-center justify-between p-4 bg-card border-b relative z-50 h-[64px]")}>
      <div className="flex items-center space-x-2">
        <Image
          src="/logo.png"
          alt="F.L.A.M.E.S. Logo"
          width={55}
          height={55}
          priority
        />
        <Link
          href="/"
          className="text-2xl font-extrabold text-flame"
        >
          F.L.A.M.E.S.
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <nav className="hidden md:flex space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-primary/80 hover:text-primary-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-3">
                <Label>Display</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={theme === 'light' ? 'outline' : 'ghost'}
                    onClick={() => setTheme('light')}
                    className="w-full"
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'outline' : 'ghost'}
                    onClick={() => setTheme('dark')}
                    className="w-full"
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
