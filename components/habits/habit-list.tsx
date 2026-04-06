'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingHabitsList } from '@/components/shared/loading';
import { ErrorState, EmptyState } from '@/components/shared/error-state';
import { useHabits, useArchiveHabit } from '@/hooks/useHabits';
import { useToast } from '@/components/ui/toast';
import { Habit, FrequencyType } from '@/lib/types/habit';
import { cn } from '@/lib/utils';
import { ListTodo } from 'lucide-react';

function getFrequencyLabel(habit: Habit): string {
  switch (habit.frequencyType) {
    case FrequencyType.Daily:
      return 'Diário';
    case FrequencyType.SpecificDays:
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return habit.frequencyDays?.map(d => days[d]).join(', ') || '';
    case FrequencyType.XTimesWeek:
      return `${habit.frequencyTimes}x/semana`;
    default:
      return '';
  }
}

interface HabitListItemProps {
  habit: Habit;
  onArchive: () => void;
  isArchiving: boolean;
}

function HabitListItem({ habit, onArchive, isArchiving }: HabitListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  return (
    <>
      <Card className={cn(!habit.isActive && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground truncate">{habit.name}</h3>
                {!habit.isActive && <Badge variant="secondary">Arquivado</Badge>}
              </div>
              
              {habit.description && (
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {habit.description}
                </p>
              )}
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">Peso:</span> {habit.weight}
                </span>
                <span>
                  <span className="font-medium text-foreground">Parcial:</span> {habit.partialWeight}
                </span>
                <Badge variant="outline" className="text-xs">
                  {getFrequencyLabel(habit)}
                </Badge>
              </div>
            </div>
            
            {habit.isActive && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => router.push(`/habits/${habit.id}/edit`)}
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  title="Arquivar"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClose={() => setShowDeleteDialog(false)}>
          <DialogHeader>
            <DialogTitle>Arquivar Hábito</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja arquivar o hábito &quot;{habit.name}&quot;? O hábito não aparecerá mais nos check-ins diários, mas seus dados serão mantidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isArchiving}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onArchive();
                setShowDeleteDialog(false);
              }}
              disabled={isArchiving}
            >
              Arquivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function HabitList() {
  const [activeTab, setActiveTab] = useState('active');
  const { 
    data: activeHabits, 
    isLoading: activeLoading, 
    error: activeError,
    refetch: refetchActive 
  } = useHabits(true);
  const { 
    data: allHabits, 
    isLoading: allLoading,
    refetch: refetchAll 
  } = useHabits(false);
  const archiveHabit = useArchiveHabit();
  const { addToast } = useToast();
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const archivedHabits = allHabits?.filter(h => !h.isActive) || [];

  const handleArchive = async (habitId: string) => {
    setArchivingId(habitId);
    try {
      await archiveHabit.mutateAsync(habitId);
      addToast({
        type: 'success',
        title: 'Hábito arquivado',
        description: 'O hábito foi arquivado com sucesso.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Erro ao arquivar',
        description: 'Não foi possível arquivar o hábito.',
      });
    } finally {
      setArchivingId(null);
    }
  };

  if (activeLoading || allLoading) {
    return <LoadingHabitsList />;
  }

  if (activeError) {
    return (
      <ErrorState
        title="Erro ao carregar hábitos"
        message="Não foi possível carregar seus hábitos."
        onRetry={() => {
          refetchActive();
          refetchAll();
        }}
      />
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="active">
          Ativos ({activeHabits?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="archived">
          Arquivados ({archivedHabits.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        {activeHabits && activeHabits.length > 0 ? (
          <div className="space-y-3">
            {activeHabits.map((habit) => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                onArchive={() => handleArchive(habit.id)}
                isArchiving={archivingId === habit.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ListTodo className="h-12 w-12" />}
            title="Nenhum hábito ativo"
            description="Crie seu primeiro hábito para começar a acompanhar seu progresso diário."
            action={{
              label: 'Criar hábito',
              onClick: () => window.location.href = '/habits/new',
            }}
          />
        )}
      </TabsContent>

      <TabsContent value="archived">
        {archivedHabits.length > 0 ? (
          <div className="space-y-3">
            {archivedHabits.map((habit) => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                onArchive={() => {}}
                isArchiving={false}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ListTodo className="h-12 w-12" />}
            title="Nenhum hábito arquivado"
            description="Hábitos arquivados aparecerão aqui."
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
