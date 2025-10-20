
'use client';

import './globals.css';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/app-context';
import { LoadingScreen } from '@/components/loading-screen';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-nunito',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const bodyClassName = cn(
    'antialiased flex flex-col h-screen',
    nunito.variable
  );

  if (pageLoading) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>F.L.A.M.E.S.</title>
          <meta
            name="description"
            content="A simple tab-based navigation app built with Next.js"
          />
          <link rel="icon" href="/logo.png" />
        </head>
        <body
          className={cn(bodyClassName, 'justify-center items-center font-body')}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster
              position="bottom-left"
              richColors
              toastOptions={{
                style: {
                  zIndex: 9999,
                },
              }}
            />
            <LoadingScreen />
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>F.L.A.M.E.S.</title>
        <meta
          name="description"
          content="A simple tab-based navigation app built with Next.js"
        />
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={cn(bodyClassName, 'font-body')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
            position="bottom-left"
            richColors
            toastOptions={{
              style: {
                zIndex: 9999,
              },
            }}
          />
          <AppProvider>
            <Header />
            <main className="flex-1 relative bg-muted/40">
              {children}
            </main>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
