import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { Alegreya } from 'next/font/google';

import '@/ai/flows/ingredient-standardization';
import '@/ai/flows/generate-meal-plan';
import '@/ai/flows/suggest-recipe';

const alegreya = Alegreya({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-alegreya',
});

export const metadata: Metadata = {
  title: 'PantryPal',
  description: 'A helpful recipe discovery app that suggests dishes based on user-inputted ingredients.',
  manifest: '/manifest.json',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${alegreya.variable} font-headline antialiased`}>
        <Header />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
