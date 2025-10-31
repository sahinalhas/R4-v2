import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Progress } from '@/components/atoms/Progress';
import { Clock, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { SelfAssessmentCategory, AssessmentStatus } from '../../../../shared/types/self-assessment.types';

interface AssessmentCardProps {
  id: string;
  title: string;
  description?: string;
  category: SelfAssessmentCategory;
  estimatedDuration?: number;
  requiresParentConsent?: boolean;
  completionStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completionPercentage?: number;
  status?: AssessmentStatus;
  lastAttemptDate?: string;
  submittedAt?: string;
  reviewedAt?: string;
  onStart?: () => void;
  onContinue?: () => void;
  onView?: () => void;
}

const categoryColors: Record<SelfAssessmentCategory, string> = {
  ACADEMIC: 'bg-blue-100 text-blue-800',
  SOCIAL_EMOTIONAL: 'bg-purple-100 text-purple-800',
  CAREER: 'bg-green-100 text-green-800',
  HEALTH: 'bg-red-100 text-red-800',
  FAMILY: 'bg-orange-100 text-orange-800',
  TALENTS: 'bg-yellow-100 text-yellow-800',
};

const categoryLabels: Record<SelfAssessmentCategory, string> = {
  ACADEMIC: 'Akademik',
  SOCIAL_EMOTIONAL: 'Sosyal-Duygusal',
  CAREER: 'Kariyer',
  HEALTH: 'Sağlık',
  FAMILY: 'Aile',
  TALENTS: 'Yetenek',
};

const statusConfig = {
  DRAFT: { label: 'Taslak', color: 'bg-gray-100 text-gray-800', icon: FileText },
  SUBMITTED: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
  PROCESSING: { label: 'İşleniyor', color: 'bg-yellow-100 text-yellow-800', icon: Loader2 },
  APPROVED: { label: 'Onaylandı', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  REJECTED: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export function AssessmentCard({
  id,
  title,
  description,
  category,
  estimatedDuration,
  requiresParentConsent,
  completionStatus = 'NOT_STARTED',
  completionPercentage,
  status,
  lastAttemptDate,
  submittedAt,
  reviewedAt,
  onStart,
  onContinue,
  onView
}: AssessmentCardProps) {
  const renderActionButton = () => {
    if (status) {
      const config = statusConfig[status];
      const Icon = config.icon;

      if (status === 'DRAFT' && onContinue) {
        return (
          <Button onClick={onContinue} className="w-full">
            Devam Et
          </Button>
        );
      }

      if (status === 'APPROVED' && reviewedAt) {
        return (
          <div className="text-sm text-gray-600">
            <Icon className="w-4 h-4 inline mr-1" />
            {format(new Date(reviewedAt), 'dd MMM yyyy', { locale: tr })} tarihinde onaylandı
          </div>
        );
      }

      if (status === 'SUBMITTED' && onView) {
        return (
          <Button onClick={onView} variant="outline" className="w-full">
            Detayları Görüntüle
          </Button>
        );
      }

      return null;
    }

    if (completionStatus === 'NOT_STARTED' && onStart) {
      return (
        <Button onClick={onStart} className="w-full">
          Anketi Başlat
        </Button>
      );
    }

    if (completionStatus === 'IN_PROGRESS' && onContinue) {
      return (
        <div className="space-y-2">
          <Progress value={completionPercentage || 0} className="h-2" />
          <Button onClick={onContinue} variant="outline" className="w-full">
            Devam Et (%{completionPercentage || 0})
          </Button>
        </div>
      );
    }

    if (completionStatus === 'COMPLETED' && onView) {
      return (
        <Button onClick={onView} variant="outline" className="w-full">
          Cevaplarımı Görüntüle
        </Button>
      );
    }

    return null;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-2">{description}</CardDescription>
            )}
          </div>
          <Badge className={categoryColors[category]}>
            {categoryLabels[category]}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {estimatedDuration && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{estimatedDuration} dakika</span>
            </div>
          )}
          
          {requiresParentConsent && (
            <Badge variant="outline" className="text-xs">
              Veli Onayı Gerekli
            </Badge>
          )}
          
          {status && (
            <Badge className={statusConfig[status].color}>
              {statusConfig[status].label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardFooter className="flex flex-col gap-2">
        {renderActionButton()}
        
        {lastAttemptDate && (
          <p className="text-xs text-gray-500 text-center">
            Son güncelleme: {format(new Date(lastAttemptDate), 'dd MMM yyyy HH:mm', { locale: tr })}
          </p>
        )}
        
        {submittedAt && !reviewedAt && (
          <p className="text-xs text-gray-500 text-center">
            {format(new Date(submittedAt), 'dd MMM yyyy HH:mm', { locale: tr })} tarihinde gönderildi
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
