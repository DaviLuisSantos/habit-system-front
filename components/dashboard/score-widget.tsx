'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DailyScore } from '@/lib/types/score';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreWidgetProps {
  score: DailyScore;
  previousScore?: DailyScore;
}

function getMotivationalMessage(percentage: number): string {
  if (percentage >= 90) return '🔥 Excelente! Você está arrasando!';
  if (percentage >= 80) return '💪 Ótimo trabalho! Continue assim!';
  if (percentage >= 60) return '👍 Bom progresso! Você consegue mais!';
  if (percentage >= 40) return '🌱 Bom começo! Vamos melhorar!';
  if (percentage > 0) return '💫 Cada passo conta! Continue tentando!';
  return '🚀 Vamos começar o dia com força!';
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-success';
  if (percentage >= 60) return 'text-primary';
  if (percentage >= 40) return 'text-warning';
  return 'text-muted-foreground';
}

function getBackgroundGradient(percentage: number): string {
  if (percentage >= 80) return 'bg-gradient-to-br from-success/10 to-success/5';
  if (percentage >= 60) return 'bg-gradient-to-br from-primary/10 to-primary/5';
  if (percentage >= 40) return 'bg-gradient-to-br from-warning/10 to-warning/5';
  return 'bg-gradient-to-br from-muted to-muted/50';
}

export function ScoreWidget({ score, previousScore }: ScoreWidgetProps) {
  const percentage = Math.round(score.percentage);
  const previousPercentage = previousScore ? Math.round(previousScore.percentage) : null;
  const trend = previousPercentage !== null ? percentage - previousPercentage : null;

  return (
    <Card className={cn('overflow-hidden', getBackgroundGradient(percentage))}>
      <CardContent className="p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground mb-2">Score de Hoje</p>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={cn('text-5xl font-bold', getScoreColor(percentage))}>
            {score.totalEarned}
          </span>
          <span className="text-2xl text-muted-foreground">/</span>
          <span className="text-2xl text-muted-foreground">{score.totalPossible}</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={cn('text-xl font-semibold', getScoreColor(percentage))}>
            {percentage}%
          </span>
          
          {trend !== null && trend !== 0 && (
            <span className={cn(
              'flex items-center text-sm',
              trend > 0 ? 'text-success' : 'text-destructive'
            )}>
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
          
          {trend === 0 && (
            <span className="flex items-center text-sm text-muted-foreground">
              <Minus className="h-4 w-4 mr-1" />
              igual
            </span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          {getMotivationalMessage(percentage)}
        </p>
      </CardContent>
    </Card>
  );
}
