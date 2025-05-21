import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { NextAuthProvider } from '@/components/providers/next-auth-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  metadataBase: new URL('https://localhost:3000'),
  title: 'ImageGen Portal - Create AI Images Easily',
  description: 'Generate beautiful AI images with customizable parameters',
  keywords: 'ai, image generation, artificial intelligence, art generator',
  authors: [{ name: 'ImageGen Team' }],
  openGraph: {
    title: 'ImageGen Portal - Create AI Images Easily',
    description: 'Generate beautiful AI images with customizable parameters',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextAuthProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 ">{children}</main>
                <Footer />
              </div>
            </NextAuthProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}