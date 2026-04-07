'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { HabitForm } from '@/components/habits/habit-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateHabit } from '@/hooks/useHabits';
import { useToast } from '@/components/ui/toast';
import { HabitFormData } from '@/lib/validations/habit';
import { CreateHabitDto } from '@/lib/types/habit';
import { ProtectedRoute } from '@/components/shared/protected-route';

export default function NewHabitPage() {
  const router = useRouter();
  const createHabit = useCreateHabit();
  const { addToast } = useToast();

  const handleSubmit = async (data: HabitFormData) => {
    try {
      const createDto: CreateHabitDto = {
        name: data.name,
        description: data.description,
        weight: data.weight,
        partialWeight: data.partialWeight,
        frequencyType: data.frequencyType,
        frequencyDays: data.frequencyDays,
        frequencyTimes: data.frequencyTimes,
      };
      
      await createHabit.mutateAsync(createDto);
      
      addToast({
        type: 'success',
        title: 'Hábito criado!',
        description: `O hábito "${data.name}" foi criado com sucesso.`,
      });
      
      router.push('/habits');
    } catch {
      addToast({
        type: 'error',
        title: 'Erro ao criar hábito',
        description: 'Não foi possível criar o hábito. Tente novamente.',
      });
    }
  };

  return (
    <ProtectedRoute>
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
            <h1 className="text-2xl font-bold text-foreground">Novo Hábito</h1>
            <p className="text-muted-foreground">Crie um novo hábito para acompanhar</p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Hábito</CardTitle>
            </CardHeader>
            <CardContent>
              <HabitForm
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isLoading={createHabit.isPending}
              />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
