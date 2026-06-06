'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListTodo, BarChart3, CalendarDays, Settings, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/habits', label: 'Hábitos', icon: ListTodo },
  { href: '/analytics', label: 'Análise', icon: BarChart3 },
  { href: '/history', label: 'Histórico', icon: CalendarDays },
  { href: '/settings', label: 'Config', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0 shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-primary/10 shrink-0">
            <Image
              src="/icone.png"
              alt="Arco"
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-bold text-lg text-foreground leading-none">Arco</span>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">Habit Tracker</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Menu
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate leading-tight">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
