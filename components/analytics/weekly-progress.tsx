'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DailyScore } from '@/lib/types/score';
import { useTheme } from 'next-themes';

interface WeeklyProgressProps {
  scores: DailyScore[];
  periodDays?: number;
}

interface DayData {
  date: string;
  dayLabel: string;
  percentage: number;
  hasData: boolean;
}

function processDailyData(scores: DailyScore[], periodDays: number): DayData[] {
  const today = new Date();
  const startDate = subDays(today, periodDays - 1);
  
  // Create all days in range
  const allDays = eachDayOfInterval({ start: startDate, end: today });
  
  // Create a map of scores by date
  const scoreMap = new Map<string, DailyScore>();
  scores.forEach(score => {
    scoreMap.set(score.date, score);
  });
  
  // Map all days to data points
  return allDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const score = scoreMap.get(dateStr);
    
    return {
      date: dateStr,
      dayLabel: format(day, 'd MMM', { locale: ptBR }),
      percentage: score ? Math.round(score.percentage) : 0,
      hasData: !!score,
    };
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: DayData }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const formattedDate = format(parseISO(data.date), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
      <p className="font-medium text-foreground mb-1 capitalize">{formattedDate}</p>
      {data.hasData ? (
        <p className="text-sm text-muted-foreground">
          Score: <span className="font-semibold text-primary">{data.percentage}%</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Sem dados registrados</p>
      )}
    </div>
  );
}

export function WeeklyProgress({ scores, periodDays = 7 }: WeeklyProgressProps) {
  const { resolvedTheme } = useTheme();
  const dailyData = processDailyData(scores, periodDays);

  const axisColor = resolvedTheme === 'dark' ? '#A3A3A3' : '#737373';
  const gridColor = resolvedTheme === 'dark' ? '#3f3f46' : '#e5e5e5';

  // Filter to show only days with data for empty state check
  const daysWithData = dailyData.filter(d => d.hasData);

  if (daysWithData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 Evolução do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível ainda. Continue fazendo check-ins para ver sua evolução!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend (first day with data vs last day with data)
  const firstDayWithData = daysWithData[0];
  const lastDayWithData = daysWithData[daysWithData.length - 1];
  const trend = daysWithData.length >= 2
    ? lastDayWithData.percentage - firstDayWithData.percentage
    : 0;

  // Calculate average
  const avgPercentage = Math.round(
    daysWithData.reduce((acc, d) => acc + d.percentage, 0) / daysWithData.length
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg">📈 Evolução do Período</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Média: <span className="font-semibold text-foreground">{avgPercentage}%</span>
            </span>
            {daysWithData.length >= 2 && (
              <span className={`font-medium ${
                trend > 0 ? 'text-green-500 dark:text-green-400' : trend < 0 ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'
              }`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="dayLabel" 
                tick={{ fontSize: 11, fill: axisColor }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
                interval={periodDays <= 7 ? 0 : periodDays <= 14 ? 1 : 'preserveStartEnd'}
                angle={periodDays > 14 ? -45 : 0}
                textAnchor={periodDays > 14 ? 'end' : 'middle'}
                height={periodDays > 14 ? 60 : 30}
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
                dataKey="percentage"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload.hasData) return <circle cx={cx} cy={cy} r={0} />;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#3B82F6"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 6, fill: '#2563EB' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {daysWithData.length} de {periodDays} dias com registro
        </p>
      </CardContent>
    </Card>
  );
}
