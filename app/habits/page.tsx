'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { HabitList } from '@/components/habits/habit-list';
import { Button } from '@/components/ui/button';

export default function HabitsPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Hábitos</h1>
            <p className="text-muted-foreground">Gerencie seus hábitos diários</p>
          </div>
          <Link href="/habits/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Hábito
            </Button>
          </Link>
        </div>

        {/* Habit List */}
        <HabitList />
      </div>
    </AppLayout>
  );
}
