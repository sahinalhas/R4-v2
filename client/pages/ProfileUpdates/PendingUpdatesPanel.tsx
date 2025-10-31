import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Input } from '@/components/atoms/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import {
  UpdateItem,
  BulkApprovalDialog,
  RejectDialog
} from '@/components/features/self-assessments';
import {
  usePendingUpdates,
  useApproveUpdate,
  useRejectUpdate,
  useBulkApproveUpdates
} from '@/hooks/features/self-assessments';
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Users,
  AlertCircle
} from 'lucide-react';
import type { SelfAssessmentCategory, PendingUpdatesFilter } from '../../../shared/types/self-assessment.types';

const CATEGORY_LABELS: Record<SelfAssessmentCategory, string> = {
  ACADEMIC: 'Akademik',
  SOCIAL_EMOTIONAL: 'Sosyal-Duygusal',
  CAREER: 'Kariyer',
  HEALTH: 'Sağlık',
  FAMILY: 'Aile',
  TALENTS: 'Yetenek ve İlgi'
};

export default function PendingUpdatesPanel() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PendingUpdatesFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<{
    id: string;
    fieldLabel?: string;
  } | null>(null);

  const { pending, total, isLoading, refetch } = usePendingUpdates(filter);
  const approveUpdateMutation = useApproveUpdate();
  const rejectUpdateMutation = useRejectUpdate();
  const bulkApproveMutation = useBulkApproveUpdates();

  const handleApprove = async (updateId: string) => {
    try {
      await approveUpdateMutation.mutateAsync({
        updateIds: [updateId]
      });
    } catch (error) {
      console.error('Failed to approve update:', error);
    }
  };

  const handleRejectClick = (updateId: string, fieldLabel?: string) => {
    setSelectedUpdate({ id: updateId, fieldLabel });
    setRejectDialogOpen(true);
  };

  const handleRejectDialogClose = (open: boolean) => {
    setRejectDialogOpen(open);
    if (!open) {
      setSelectedUpdate(null);
    }
  };

  const handleRejectConfirm = async (updateId: string, reason: string) => {
    try {
      await rejectUpdateMutation.mutateAsync({
        updateId,
        reason
      });
    } catch (error) {
      console.error('Failed to reject update:', error);
    }
  };

  const handleBulkApprove = async () => {
    if (!selectedStudent) return;

    try {
      await bulkApproveMutation.mutateAsync({
        studentId: selectedStudent.id
      });
      setShowBulkDialog(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Failed to bulk approve:', error);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setFilter(prev => ({
      ...prev,
      category: category === 'all' ? undefined : category as SelfAssessmentCategory
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilter(prev => ({
      ...prev,
      sortBy: sortBy === 'default' ? undefined : sortBy as 'date' | 'student' | 'confidence'
    }));
  };

  const filteredPending = pending.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(query) ||
      item.assessmentTitle.toLowerCase().includes(query)
    );
  });

  const totalPendingUpdates = pending.reduce((sum, item) => sum + item.updates.length, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8" />
            Profil Güncellemeleri
          </h1>
          <p className="text-muted-foreground mt-1">
            Öğrenci anketlerinden gelen profil güncellemelerini inceleyin ve onaylayın
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Bekleyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPendingUpdates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pending.length} öğrenci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filtre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={filter.category || 'all'}
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tüm Kategoriler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sıralama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={filter.sortBy || 'default'}
              onValueChange={handleSortChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Varsayılan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Varsayılan</SelectItem>
                <SelectItem value="date">Tarihe Göre</SelectItem>
                <SelectItem value="student">Öğrenciye Göre</SelectItem>
                <SelectItem value="confidence">Güvene Göre</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Öğrenci adı veya anket başlığı ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPending.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {searchQuery
              ? 'Arama kriterlerinize uygun bekleyen güncelleme bulunamadı.'
              : 'Onay bekleyen profil güncellemesi bulunmuyor.'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {filteredPending.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {item.studentName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {item.assessmentTitle}
                      <span className="mx-2">•</span>
                      {new Date(item.submittedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {item.updates.length} güncelleme
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedStudent({
                          id: item.studentId,
                          name: item.studentName
                        });
                        setShowBulkDialog(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Tümünü Onayla
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {item.updates.map((update) => (
                  <UpdateItem
                    key={update.id}
                    update={update}
                    onApprove={handleApprove}
                    onReject={(id) => handleRejectClick(id, update.fieldLabel)}
                    isProcessing={
                      approveUpdateMutation.isPending ||
                      rejectUpdateMutation.isPending
                    }
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedStudent && (
        <BulkApprovalDialog
          open={showBulkDialog}
          onOpenChange={setShowBulkDialog}
          studentName={selectedStudent.name}
          updates={
            pending.find((p) => p.studentId === selectedStudent.id)?.updates || []
          }
          onConfirm={handleBulkApprove}
          isProcessing={bulkApproveMutation.isPending}
        />
      )}

      {selectedUpdate && (
        <RejectDialog
          open={rejectDialogOpen}
          onOpenChange={handleRejectDialogClose}
          updateId={selectedUpdate.id}
          fieldLabel={selectedUpdate.fieldLabel}
          onConfirm={handleRejectConfirm}
          isProcessing={rejectUpdateMutation.isPending}
        />
      )}
    </div>
  );
}
