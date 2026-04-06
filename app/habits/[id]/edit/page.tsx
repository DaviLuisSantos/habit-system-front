'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { HabitForm } from '@/components/habits/habit-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingCard } from '@/components/shared/loading';
import { ErrorState } from '@/components/shared/error-state';
import { useHabit, useUpdateHabit } from '@/hooks/useHabits';
import { useToast } from '@/components/ui/toast';
import { HabitFormData } from '@/lib/validations/habit';
import { UpdateHabitDto } from '@/lib/types/habit';

interface EditHabitPageProps {
  params: Promise<{ id: string }>;
}

export default function EditHabitPage({ params }: EditHabitPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: habit, isLoading, error, refetch } = useHabit(id);
  const updateHabit = useUpdateHabit();
  const { addToast } = useToast();

  const handleSubmit = async (data: HabitFormData) => {
    try {
      const updateDto: UpdateHabitDto = {
        name: data.name,
        description: data.description,
        weight: data.weight,
        partialWeight: data.partialWeight,
        frequencyType: data.frequencyType,
        frequencyDays: data.frequencyDays,
        frequencyTimes: data.frequencyTimes,
      };
      
      await updateHabit.mutateAsync({ id, data: updateDto });
      
      addToast({
        type: 'success',
        title: 'Hábito atualizado!',
        description: `O hábito "${data.name}" foi atualizado com sucesso.`,
      });
      
      router.push('/habits');
    } catch {
      addToast({
        type: 'error',
        title: 'Erro ao atualizar hábito',
        description: 'Não foi possível atualizar o hábito. Tente novamente.',
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <LoadingCard />
        </div>
      </AppLayout>
    );
  }

  if (error || !habit) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <ErrorState
            title="Erro ao carregar hábito"
            message="Não foi possível carregar os dados do hábito."
            onRetry={() => refetch()}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Editar Hábito</h1>
          <p className="text-muted-foreground">Modifique os detalhes do hábito</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Hábito</CardTitle>
          </CardHeader>
          <CardContent>
            <HabitForm
              habit={habit}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              isLoading={updateHabit.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
