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
      
      <main className="md:ml-64 pb-20 md:pb-0">
        {title && (
          <header className="bg-card border-b border-border px-4 py-4 md:px-6">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
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
