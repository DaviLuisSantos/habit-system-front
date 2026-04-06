'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, parseISO, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DailyScore } from '@/lib/types/score';
import { useTheme } from 'next-themes';

interface WeeklyProgressProps {
  scores: DailyScore[];
}

interface WeekData {
  week: string;
  weekLabel: string;
  avgPercentage: number;
  totalDays: number;
}

function processWeeklyData(scores: DailyScore[]): WeekData[] {
  if (!scores || scores.length === 0) return [];

  // Group scores by week
  const weekMap = new Map<string, DailyScore[]>();
  
  scores.forEach(score => {
    const date = parseISO(score.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, []);
    }
    weekMap.get(weekKey)!.push(score);
  });

  // Convert to array and calculate averages
  const weeklyData: WeekData[] = Array.from(weekMap.entries())
    .map(([weekKey, weekScores]) => {
      const weekStart = parseISO(weekKey);
      const avgPercentage = Math.round(
        weekScores.reduce((acc, s) => acc + s.percentage, 0) / weekScores.length
      );
      
      return {
        week: weekKey,
        weekLabel: format(weekStart, "d 'de' MMM", { locale: ptBR }),
        avgPercentage,
        totalDays: weekScores.length,
      };
    })
    .sort((a, b) => a.week.localeCompare(b.week));

  return weeklyData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: WeekData }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
      <p className="font-medium text-foreground mb-1">Semana de {data.weekLabel}</p>
      <p className="text-sm text-muted-foreground">
        Média: <span className="font-semibold text-blue-400">{data.avgPercentage}%</span>
      </p>
      <p className="text-xs text-muted-foreground">
        {data.totalDays} dias registrados
      </p>
    </div>
  );
}

export function WeeklyProgress({ scores }: WeeklyProgressProps) {
  const weeklyData = processWeeklyData(scores);
  const { resolvedTheme } = useTheme();

  const axisColor = resolvedTheme === 'dark' ? '#A3A3A3' : '#737373';
  const gridColor = resolvedTheme === 'dark' ? '#3f3f46' : '#e5e5e5';

  if (weeklyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 Evolução Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível ainda. Continue fazendo check-ins para ver sua evolução!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend
  const trend = weeklyData.length >= 2
    ? weeklyData[weeklyData.length - 1].avgPercentage - weeklyData[0].avgPercentage
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">📈 Evolução Semanal</CardTitle>
          {weeklyData.length >= 2 && (
            <span className={`text-sm font-medium ${
              trend > 0 ? 'text-green-500 dark:text-green-400' : trend < 0 ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'
            }`}>
              {trend > 0 ? '+' : ''}{trend}% desde o início
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="weekLabel" 
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="avgPercentage"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#2563EB' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
