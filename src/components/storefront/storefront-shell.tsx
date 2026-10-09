'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { StoreNavbar } from './navbar';
import { StoreFooter } from './footer';
import { CartDrawer } from './cart-drawer';
import { WhatsAppFloatingButton } from './whatsapp-floating-button';
import { CampaignTracker } from './campaign-tracker';

interface StorefrontShellProps {
  children: React.ReactNode;
  categories?: string[];
  whatsappPhone?: string;
}

export function StorefrontShell({
  children,
  categories = ['Coconut Oil', 'Groundnut Oil', 'Sesame Oil', 'Castor Oil', 'Mustard Oil', 'Almond Oil'],
  whatsappPhone = '919342365917'
}: StorefrontShellProps) {
  const pathname = usePathname();

  // Check if current route is an administrative or special auth route
  const isAdminOrAuth =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/checkout/mock');

  if (isAdminOrAuth) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      <Suspense fallback={null}>
        <CampaignTracker />
      </Suspense>

      <StoreNavbar categories={categories} whatsappPhone={whatsappPhone} />
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <StoreFooter categories={categories} whatsappPhone={whatsappPhone} />
      
      <CartDrawer whatsappPhone={whatsappPhone} />
      <WhatsAppFloatingButton whatsappPhone={whatsappPhone} />
    </div>
  );
}
