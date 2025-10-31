import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import {
  UpdateItem,
  UpdateHistory,
  RejectDialog
} from '@/components/features/self-assessments';
import {
  useStudentProfileUpdates,
  useApproveUpdate,
  useRejectUpdate,
  useBulkApproveUpdates
} from '@/hooks/features/self-assessments';
import {
  ArrowLeft,
  CheckCircle,
  User,
  AlertCircle
} from 'lucide-react';

export default function UpdateReview() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<{
    id: string;
    fieldLabel?: string;
  } | null>(null);

  const { suggestions, isLoading } = useStudentProfileUpdates(studentId || '');
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
    if (!studentId) return;

    try {
      await bulkApproveMutation.mutateAsync({
        studentId
      });
    } catch (error) {
      console.error('Failed to bulk approve:', error);
    }
  };

  const pendingUpdates = suggestions.filter(s => s.status === 'PENDING');
  const processedUpdates = suggestions.filter(s => s.status !== 'PENDING');
  const studentName = suggestions[0]?.studentName || 'Öğrenci';

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Geçersiz öğrenci ID
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile-updates')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Geri
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            {studentName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Profil güncellemelerini inceleyin
          </p>
        </div>
      </div>

      {pendingUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bekleyen Güncellemeler</CardTitle>
                <CardDescription>
                  {pendingUpdates.length} güncelleme onay bekliyor
                </CardDescription>
              </div>
              <Button
                onClick={handleBulkApprove}
                disabled={bulkApproveMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Tümünü Onayla
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingUpdates.map((update) => (
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
      )}

      {pendingUpdates.length === 0 && processedUpdates.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu öğrenci için profil güncellemesi bulunmuyor.
          </AlertDescription>
        </Alert>
      )}

      {processedUpdates.length > 0 && (
        <UpdateHistory updates={processedUpdates} />
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
