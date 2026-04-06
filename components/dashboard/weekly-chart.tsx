'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingChart } from '@/components/shared/loading';
import { ErrorState } from '@/components/shared/error-state';
import { useWeeklyScores } from '@/hooks/useScores';
import { DailyScore } from '@/lib/types/score';
import { useTheme } from 'next-themes';

function getBarColor(percentage: number): string {
  if (percentage >= 80) return '#10B981'; // green
  if (percentage >= 60) return '#3B82F6'; // blue
  if (percentage >= 40) return '#F59E0B'; // yellow
  return '#6B7280'; // gray
}

interface ChartDataPoint {
  date: string;
  dayName: string;
  earned: number;
  possible: number;
  percentage: number;
}

function transformData(scores: DailyScore[]): ChartDataPoint[] {
  return scores.map(score => ({
    date: score.date,
    dayName: format(parseISO(score.date), 'EEE', { locale: ptBR }),
    earned: score.totalEarned,
    possible: score.totalPossible,
    percentage: Math.round(score.percentage),
  }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartDataPoint }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const formattedDate = format(parseISO(data.date), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
      <p className="font-medium text-foreground capitalize mb-1">{formattedDate}</p>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold">{data.earned}</span>
        <span className="text-muted-foreground/70"> / </span>
        <span>{data.possible}</span>
        <span className="ml-2 font-semibold" style={{ color: getBarColor(data.percentage) }}>
          ({data.percentage}%)
        </span>
      </p>
    </div>
  );
}

export function WeeklyChart() {
  const { data: scores, isLoading, error, refetch } = useWeeklyScores();
  const { resolvedTheme } = useTheme();

  const axisColor = resolvedTheme === 'dark' ? '#A3A3A3' : '#737373';
  const tooltipCursor = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  if (isLoading) {
    return <LoadingChart />;
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar gráfico"
        message="Não foi possível carregar os dados da semana."
        onRetry={() => refetch()}
      />
    );
  }

  if (!scores || scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Progresso da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível ainda. Faça check-ins para ver seu progresso!
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = transformData(scores);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📊 Progresso da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis 
                dataKey="dayName" 
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: tooltipCursor }} />
              <Bar 
                dataKey="earned" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>≥80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>60-79%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>40-59%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span>&lt;40%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
