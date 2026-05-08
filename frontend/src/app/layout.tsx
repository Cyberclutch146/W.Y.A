import type { Metadata } from 'next';
import { Space_Grotesk, Inter, Geist, Outfit, Playfair_Display } from 'next/font/google';
import { activeLogoFont } from '@/lib/logo-fonts';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import { cn } from "@/lib/utils";
import NextTopLoader from 'nextjs-toploader';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});



export const metadata: Metadata = {
  title: 'W.Y.A — Where You At',
  description: 'Find your people, find the vibe. Campus events, reimagined.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", spaceGrotesk.variable, inter.variable, outfit.variable, playfair.variable, activeLogoFont.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <head>
      </head>
      <body className="antialiased min-h-screen flex flex-col font-body bg-background text-on-background">
        <NextTopLoader 
          color="hsl(var(--primary))" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={false} 
          easing="ease" 
          speed={200} 
          shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))" 
        />
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
