import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import DynamicBackground from '@/components/DynamicBackground';
import AIChatWidget from '@/components/AIChatWidget';
import AppAccessGate from '@/components/AppAccessGate';
import AppNavigation from '@/components/AppNavigation';

export const metadata: Metadata = {
  title: 'Home — W.Y.A',
  description: 'W.Y.A — Campus Events & Participanting Platform',
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <DynamicBackground>
        {/* Responsive nav: PillNavbar on desktop, StaggeredMenu on mobile */}
        <AppNavigation />

        {/*
          pt-20 on mobile gives room for the StaggeredMenu header bar.
          md:pt-[4.5rem] gives room for PillNavbar on desktop.
          No bottom padding needed on desktop. Mobile keeps bottom padding
          so content isn't hidden behind the safe area.
        */}
        <div className="flex-1 flex flex-col min-w-0 pt-20 md:pt-[4.5rem]">
          <AppAccessGate>{children}</AppAccessGate>
        </div>

        <AIChatWidget />
      </DynamicBackground>
    </>
  );
}
