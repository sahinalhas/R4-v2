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
import { Label } from '@/components/atoms/Label';
import { EnhancedTextarea as Textarea } from '@/components/molecules/EnhancedTextarea';
import { XCircle, Loader2 } from 'lucide-react';

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateId: string;
  fieldLabel?: string;
  onConfirm: (updateId: string, reason: string) => void | Promise<void>;
  isProcessing?: boolean;
}

export function RejectDialog({
  open,
  onOpenChange,
  updateId,
  fieldLabel,
  onConfirm,
  isProcessing = false
}: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      return;
    }

    setConfirmed(true);
    try {
      await onConfirm(updateId, reason);
      setReason('');
      onOpenChange(false);
    } finally {
      setConfirmed(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && !isProcessing && !confirmed) {
      setReason('');
      onOpenChange(false);
    } else if (nextOpen) {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Güncellemeyi Reddet
          </DialogTitle>
          <DialogDescription>
            {fieldLabel ? `"${fieldLabel}" güncellemesini` : 'Bu güncellemeyi'} reddetmek için lütfen bir neden belirtin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reject-reason">
              Red Nedeni <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Örn: Bilgi doğru değil, ek inceleme gerekiyor..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={isProcessing || confirmed}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Bu not öğrenci ve diğer rehber öğretmenler tarafından görülebilir.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isProcessing || confirmed}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isProcessing || confirmed}
          >
            {(isProcessing || confirmed) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Reddet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
