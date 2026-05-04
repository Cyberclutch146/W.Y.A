import type { Metadata } from 'next';
import { MobileBottomNav, MobileHeader } from '@/components/Navigation';
import PillNavbar from '@/components/PillNavbar';
import { Toaster } from 'sonner';
import DynamicBackground from '@/components/DynamicBackground';
import AIChatWidget from '@/components/AIChatWidget';
import AppAccessGate from '@/components/AppAccessGate';

export const metadata: Metadata = {
  title: 'Home — W.Y.A',
  description: 'W.Y.A — Campus Events & Volunteering Platform',
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
        <PillNavbar />
        <div className="flex-1 flex flex-col min-w-0 pt-20 md:pt-[4.5rem] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          <MobileHeader />
          <AppAccessGate>{children}</AppAccessGate>
        </div>
        <AIChatWidget />
        <MobileBottomNav />
      </DynamicBackground>
    </>
  );
}
