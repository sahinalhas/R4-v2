import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle, CheckSquare, XSquare } from 'lucide-react';
import { useState } from 'react';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkUpdateRisk: (risk: 'Düşük' | 'Orta' | 'Yüksek') => void;
  onClearSelection: () => void;
}

export function BulkActions({
  selectedCount,
  onBulkDelete,
  onBulkUpdateRisk,
  onClearSelection,
}: BulkActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<string>('');

  const handleBulkDelete = () => {
    onBulkDelete();
    setDeleteDialogOpen(false);
  };

  const handleRiskUpdate = () => {
    if (selectedRisk && selectedRisk !== 'none') {
      onBulkUpdateRisk(selectedRisk as 'Düşük' | 'Orta' | 'Yüksek');
      setSelectedRisk('none');
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">
              {selectedCount} öğrenci seçildi
            </p>
            <p className="text-xs text-muted-foreground">
              Toplu işlem yapmak için aşağıdaki seçenekleri kullanın
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Risk seviyesi değiştir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>
                  Risk seviyesi seç
                </SelectItem>
                <SelectItem value="Düşük">Düşük Risk</SelectItem>
                <SelectItem value="Orta">Orta Risk</SelectItem>
                <SelectItem value="Yüksek">Yüksek Risk</SelectItem>
              </SelectContent>
            </Select>
            {selectedRisk && selectedRisk !== 'none' && (
              <Button size="sm" onClick={handleRiskUpdate} className="h-9">
                Uygula
              </Button>
            )}
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="h-9"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="h-9"
          >
            <XSquare className="mr-2 h-4 w-4" />
            Seçimi Kaldır
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              Toplu Silme Onayı
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">{selectedCount} öğrenci</strong> kalıcı olarak
              silinecek. Bu işlem geri alınamaz!
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-semibold">⚠️ Dikkat!</p>
                <p className="text-xs text-red-700 mt-1">
                  Tüm akademik kayıtlar, notlar ve ilerleme verileri kalıcı olarak silinecektir.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hepsini Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
