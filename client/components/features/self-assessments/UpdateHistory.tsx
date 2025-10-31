import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  FileText,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { UpdateSuggestion } from '../../../../shared/types/self-assessment.types';

interface UpdateHistoryProps {
  updates: UpdateSuggestion[];
  showStudentName?: boolean;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'APPROVED':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'REJECTED':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'Onaylandı';
    case 'REJECTED':
      return 'Reddedildi';
    case 'PENDING':
      return 'Bekliyor';
    case 'AUTO_APPLIED':
      return 'Otomatik Uygulandı';
    default:
      return status;
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'APPROVED':
    case 'AUTO_APPLIED':
      return 'default';
    case 'REJECTED':
      return 'destructive';
    case 'PENDING':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function UpdateHistory({ updates, showStudentName = false }: UpdateHistoryProps) {
  if (updates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Güncelleme Geçmişi</CardTitle>
          <CardDescription>
            Henüz işlenmiş bir güncelleme bulunmuyor.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sortedUpdates = [...updates].sort((a, b) => {
    const dateA = new Date(a.reviewedAt || a.created_at || 0).getTime();
    const dateB = new Date(b.reviewedAt || b.created_at || 0).getTime();
    return dateB - dateA;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Güncelleme Geçmişi
        </CardTitle>
        <CardDescription>
          Toplam {updates.length} güncelleme
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedUpdates.map((update) => (
              <div
                key={update.id}
                className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(update.status)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {showStudentName && update.studentName && (
                      <>
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{update.studentName}</span>
                        <span className="text-muted-foreground">•</span>
                      </>
                    )}
                    
                    <span className="text-sm font-medium">
                      {update.fieldLabel || update.targetField}
                    </span>
                    
                    <Badge variant={getStatusVariant(update.status)} className="text-xs">
                      {getStatusLabel(update.status)}
                    </Badge>
                  </div>
                  
                  {update.assessmentTitle && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{update.assessmentTitle}</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    {update.status === 'APPROVED' && update.proposedValue && (
                      <p>
                        <span className="font-medium">Uygulanan:</span>{' '}
                        {typeof update.proposedValue === 'object'
                          ? JSON.stringify(update.proposedValue)
                          : update.proposedValue}
                      </p>
                    )}
                    
                    {update.reviewNotes && (
                      <p>
                        <span className="font-medium">Not:</span> {update.reviewNotes}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-1 pt-1">
                      <Clock className="h-3 w-3" />
                      {update.reviewedAt
                        ? formatDistanceToNow(new Date(update.reviewedAt), {
                            addSuffix: true,
                            locale: tr
                          })
                        : update.created_at &&
                          formatDistanceToNow(new Date(update.created_at), {
                            addSuffix: true,
                            locale: tr
                          })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
