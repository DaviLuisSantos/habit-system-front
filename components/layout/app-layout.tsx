'use client';

import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        {title && (
          <header className="sticky top-0 z-10 bg-card/80 backdrop-blur border-b border-border px-6 py-4">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </header>
        )}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
