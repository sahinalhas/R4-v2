import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/organisms/Dialog';
import { Button } from '@/components/atoms/Button';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { UpdateSuggestion } from '../../../../shared/types/self-assessment.types';

interface BulkApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  updates: UpdateSuggestion[];
  onConfirm: () => void | Promise<void>;
  isProcessing?: boolean;
}

export function BulkApprovalDialog({
  open,
  onOpenChange,
  studentName,
  updates,
  onConfirm,
  isProcessing = false
}: BulkApprovalDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    setConfirmed(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setConfirmed(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !confirmed) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Toplu Onay
          </DialogTitle>
          <DialogDescription>
            {studentName} öğrencisi için {updates.length} güncellemeyi toplu olarak onaylayacaksınız.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Bu işlem geri alınamaz. Tüm güncellemeler öğrencinin profiline uygulanacaktır.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Onaylanacak Güncellemeler:</h4>
            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-3">
              {updates.map((update, index) => (
                <div
                  key={update.id}
                  className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                >
                  <span className="text-muted-foreground font-medium min-w-[20px]">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">
                      {update.fieldLabel || update.targetField}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Yeni değer:{' '}
                      <span className="text-foreground">
                        {typeof update.proposedValue === 'object'
                          ? JSON.stringify(update.proposedValue)
                          : update.proposedValue}
                      </span>
                    </p>
                  </div>
                  {update.confidence !== undefined && (
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      %{Math.round(update.confidence * 100)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
            <p className="text-sm">
              <span className="font-medium">Toplam:</span> {updates.length} güncelleme
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing || confirmed}
          >
            İptal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || confirmed}
          >
            {(isProcessing || confirmed) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Tümünü Onayla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
