import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Columns3, Maximize2, Minimize2 } from 'lucide-react';

export interface ColumnVisibility {
  id: boolean;
  ad: boolean;
  soyad: boolean;
  class: boolean;
  cinsiyet: boolean;
  risk: boolean;
  actions: boolean;
}

interface TableControlsProps {
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (column: keyof ColumnVisibility) => void;
  isCompact: boolean;
  onCompactToggle: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const COLUMN_LABELS: Record<keyof ColumnVisibility, string> = {
  id: 'Öğrenci No',
  ad: 'Ad',
  soyad: 'Soyad',
  class: 'Sınıf',
  cinsiyet: 'Cinsiyet',
  risk: 'Risk Seviyesi',
  actions: 'İşlemler',
};

export function TableControls({
  columnVisibility,
  onColumnVisibilityChange,
  isCompact,
  onCompactToggle,
  pageSize,
  onPageSizeChange,
}: TableControlsProps) {
  const visibleCount = Object.values(columnVisibility).filter(Boolean).length;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Columns3 className="mr-2 h-4 w-4" />
              Sütunlar
              <Badge variant="secondary" className="ml-2">
                {visibleCount}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sütun Görünürlüğü</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(columnVisibility) as Array<keyof ColumnVisibility>).map(
              (column) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  checked={columnVisibility[column]}
                  onCheckedChange={() => onColumnVisibilityChange(column)}
                >
                  {COLUMN_LABELS[column]}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={onCompactToggle}
          className="h-8"
        >
          {isCompact ? (
            <>
              <Maximize2 className="mr-2 h-4 w-4" />
              Geniş
            </>
          ) : (
            <>
              <Minimize2 className="mr-2 h-4 w-4" />
              Kompakt
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sayfa başına:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
        >
          <SelectTrigger className="h-8 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
