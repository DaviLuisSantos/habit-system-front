import { Card, CardContent } from '@/components/ui/card';
import { DailyScore } from '@/lib/types/score';
import { CheckIn } from '@/lib/types/checkin';
import { TrendingUp, Calendar, Award, Target } from 'lucide-react';

interface MonthlySummaryProps {
  scores: DailyScore[];
  checkIns: CheckIn[];
}

export function MonthlySummary({ scores, checkIns }: MonthlySummaryProps) {
  if (!scores || scores.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="h-5 w-5 text-blue-500" />}
          label="Média do Mês"
          value="-"
        />
        <StatCard
          icon={<Award className="h-5 w-5 text-green-500" />}
          label="Dias ≥80%"
          value="-"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
          label="Melhor Dia"
          value="-"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-orange-500" />}
          label="Dias Registrados"
          value="-"
        />
      </div>
    );
  }

  // Calculate stats
  const avgPercentage = Math.round(
    scores.reduce((acc, s) => acc + s.percentage, 0) / scores.length
  );

  const daysAbove80 = scores.filter(s => s.percentage >= 80).length;

  const bestDay = scores.reduce((best, current) => 
    current.percentage > best.percentage ? current : best
  , scores[0]);

  const daysRegistered = new Set(checkIns.map((checkIn) => checkIn.date)).size;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<Target className="h-5 w-5 text-blue-500" />}
        label="Média do Período"
        value={`${avgPercentage}%`}
        subtext={getAverageMessage(avgPercentage)}
      />
      <StatCard
        icon={<Award className="h-5 w-5 text-green-500" />}
        label="Dias ≥80%"
        value={`${daysAbove80}`}
        subtext={`de ${daysRegistered} dias`}
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
        label="Melhor Dia"
        value={`${Math.round(bestDay.percentage)}%`}
        subtext={formatDate(bestDay.date)}
      />
      <StatCard
        icon={<Calendar className="h-5 w-5 text-orange-500" />}
        label="Dias Registrados"
        value={`${daysRegistered}`}
        subtext="dias com dados"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

function StatCard({ icon, label, value, subtext }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}

function getAverageMessage(percentage: number): string {
  if (percentage >= 80) return 'Excelente!';
  if (percentage >= 60) return 'Bom trabalho';
  if (percentage >= 40) return 'Pode melhorar';
  return 'Vamos lá!';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'short' 
  });
}
