'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { habitFormSchema, HabitFormData, defaultHabitFormValues } from '@/lib/validations/habit';
import { FrequencyType, Habit } from '@/lib/types/habit';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useWatch } from 'react-hook-form';

interface HabitFormProps {
  habit?: Habit;
  onSubmit: (data: HabitFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export function HabitForm({ habit, onSubmit, onCancel, isLoading }: HabitFormProps) {
  const isEditing = !!habit;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: habit
      ? {
          name: habit.name,
          description: habit.description,
          weight: habit.weight,
          partialWeight: habit.partialWeight,
          frequencyType: habit.frequencyType,
          frequencyDays: habit.frequencyDays,
          frequencyTimes: habit.frequencyTimes,
        }
      : defaultHabitFormValues,
  });

  const frequencyType = useWatch({ control, name: 'frequencyType' });
  const weight = useWatch({ control, name: 'weight' });
  const partialWeight = useWatch({ control, name: 'partialWeight' });
  const frequencyDays = useWatch({ control, name: 'frequencyDays' }) || [];
  const frequencyTimes = useWatch({ control, name: 'frequencyTimes' });

  const toggleDay = (day: number) => {
    const current = frequencyDays;
    if (current.includes(day)) {
      setValue('frequencyDays', current.filter(d => d !== day));
    } else {
      setValue('frequencyDays', [...current, day].sort());
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Hábito *</Label>
        <Input
          id="name"
          placeholder="Ex: Exercitar-se"
          {...register('name')}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Descreva seu hábito (opcional)"
          {...register('description')}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-400">{errors.description.message}</p>
        )}
        <p className="text-xs text-muted-foreground">Máximo 280 caracteres</p>
      </div>

      {/* Peso */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Peso do Hábito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Peso total (quando completo)</span>
              <span className="font-medium text-foreground">{weight}</span>
            </div>
            <Slider
              value={weight}
              onChange={(value) => setValue('weight', value)}
              min={1}
              max={10}
              showValue={false}
            />
            {errors.weight && (
              <p className="text-sm text-red-400">{errors.weight.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Peso parcial</span>
              <span className="font-medium text-foreground">{partialWeight}</span>
            </div>
            <Slider
              value={partialWeight}
              onChange={(value) => setValue('partialWeight', value)}
              min={0}
              max={10}
              showValue={false}
            />
            {errors.partialWeight && (
              <p className="text-sm text-red-400">{errors.partialWeight.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Frequência */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Frequência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: FrequencyType.Daily, label: 'Diário' },
              { value: FrequencyType.SpecificDays, label: 'Dias específicos' },
              { value: FrequencyType.XTimesWeek, label: 'X vezes/semana' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('frequencyType', option.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  frequencyType === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Specific Days Selector */}
          {frequencyType === FrequencyType.SpecificDays && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Selecione os dias:</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'w-10 h-10 rounded-full text-sm font-medium transition-colors',
                      frequencyDays.includes(day.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {errors.frequencyDays && (
                <p className="text-sm text-red-400">{errors.frequencyDays.message}</p>
              )}
            </div>
          )}

          {/* X Times Per Week Selector */}
          {frequencyType === FrequencyType.XTimesWeek && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quantas vezes por semana?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setValue('frequencyTimes', num)}
                    className={cn(
                      'w-10 h-10 rounded-full text-sm font-medium transition-colors',
                      frequencyTimes === num
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
              {errors.frequencyTimes && (
                <p className="text-sm text-red-400">{errors.frequencyTimes.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : isEditing ? (
            'Salvar Alterações'
          ) : (
            'Criar Hábito'
          )}
        </Button>
      </div>
    </form>
  );
}
