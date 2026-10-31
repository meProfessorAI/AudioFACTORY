/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Marketing Layout Shell
 */
import React from 'react';
import { MarketingNavbar } from './MarketingNavbar';
import { MarketingFooter } from './MarketingFooter';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  return (
    <div 
      className="min-h-screen flex flex-col font-sans antialiased transition-colors duration-200 overflow-x-hidden w-full max-w-[100vw]"
      style={{
        backgroundColor: 'var(--skin-bg-app, #FAF6EF)',
        color: 'var(--skin-text-primary, #292524)',
      }}
    >
      <MarketingNavbar />
      <main className="flex-1 pt-16 sm:pt-20 overflow-x-hidden w-full max-w-[100vw]">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
};

