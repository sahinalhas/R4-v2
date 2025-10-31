import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { CheckCircle2, Clock, FileText, TrendingUp } from 'lucide-react';

interface AssessmentStatsProps {
  totalTemplates: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  completionRate: number;
  lastAssessmentDate?: string;
}

export function AssessmentStats({
  totalTemplates,
  completedCount,
  inProgressCount,
  notStartedCount,
  completionRate,
  lastAssessmentDate
}: AssessmentStatsProps) {
  const stats = [
    {
      label: 'Tamamlanan',
      value: completedCount,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Devam Eden',
      value: inProgressCount,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Başlanmamış',
      value: notStartedCount,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      label: 'Tamamlanma Oranı',
      value: `%${completionRate}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.label === 'Tamamlanan' && lastAssessmentDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Son: {new Date(lastAssessmentDate).toLocaleDateString('tr-TR')}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
