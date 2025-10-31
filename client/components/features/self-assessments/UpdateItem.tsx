import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader } from '@/components/organisms/Card';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  User, 
  FileText,
  Clock 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { UpdateSuggestion } from '../../../../shared/types/self-assessment.types';

interface UpdateItemProps {
  update: UpdateSuggestion;
  onApprove: (updateId: string) => void;
  onReject: (updateId: string) => void;
  isProcessing?: boolean;
  showActions?: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  strongSubjects: 'Güçlü Dersler',
  weakSubjects: 'Zayıf Dersler',
  learningStyle: 'Öğrenme Stili',
  studySkills: 'Çalışma Becerileri',
  homeworkCompletion: 'Ödev Tamamlama',
  studentExpectations: 'Akademik Hedefler',
  careerGoals: 'Kariyer Hedefleri',
  educationGoals: 'Eğitim Hedefleri',
  interests: 'İlgi Alanları',
  hobbies: 'Hobiler',
  talents: 'Yetenekler',
  socialAwareness: 'Sosyal Farkındalık',
  emotionalRegulation: 'Duygusal Düzenleme',
  peerRelations: 'Akran İlişkileri',
  empathy: 'Empati',
  friendCount: 'Arkadaş Sayısı',
  bloodType: 'Kan Grubu',
  allergies: 'Alerjiler',
  chronicDiseases: 'Kronik Hastalıklar',
  specialNeeds: 'Özel Gereksinimler'
};

const TABLE_LABELS: Record<string, string> = {
  students: 'Öğrenci Bilgileri',
  standardized_academic_profile: 'Akademik Profil',
  standardized_social_emotional_profile: 'Sosyal-Duygusal Profil',
  standardized_talents_interests_profile: 'Yetenek ve İlgi Alanları',
  standardized_health_profile: 'Sağlık Profili'
};

function getConfidenceColor(confidence?: number): string {
  if (!confidence) return 'bg-gray-500';
  if (confidence >= 0.8) return 'bg-green-500';
  if (confidence >= 0.6) return 'bg-yellow-500';
  return 'bg-orange-500';
}

function getConfidenceLabel(confidence?: number): string {
  if (!confidence) return 'Bilinmiyor';
  if (confidence >= 0.8) return 'Yüksek';
  if (confidence >= 0.6) return 'Orta';
  return 'Düşük';
}

function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  
  return String(value);
}

export function UpdateItem({
  update,
  onApprove,
  onReject,
  isProcessing = false,
  showActions = true
}: UpdateItemProps) {
  const fieldLabel = FIELD_LABELS[update.targetField] || update.targetField;
  const tableLabel = TABLE_LABELS[update.targetTable] || update.targetTable;
  const confidenceColor = getConfidenceColor(update.confidence);
  const confidenceLabel = getConfidenceLabel(update.confidence);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{update.studentName}</span>
              {update.assessmentTitle && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {update.assessmentTitle}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="font-normal">
                {tableLabel}
              </Badge>
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium text-foreground">{fieldLabel}</span>
            </div>
          </div>
          
          {update.confidence !== undefined && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${confidenceColor}`} />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Güven: {confidenceLabel}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Mevcut Değer
            </div>
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                {formatValue(update.currentValue)}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-primary flex items-center gap-1">
              Önerilen Değer
            </div>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
              <p className="text-sm font-medium">
                {formatValue(update.proposedValue)}
              </p>
            </div>
          </div>
        </div>
        
        {update.reasoning && (
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Açıklama
            </div>
            <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
              {update.reasoning}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {update.created_at && formatDistanceToNow(new Date(update.created_at), {
              addSuffix: true,
              locale: tr
            })}
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(update.id)}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reddet
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove(update.id)}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Onayla
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
