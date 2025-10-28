import { memo, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Student } from '@/lib/storage';
import { Link } from 'react-router-dom';
import type { ColumnVisibility } from './TableControls';

export type SortColumn = 'id' | 'ad' | 'soyad' | 'class' | 'cinsiyet' | 'risk';
export type SortDirection = 'asc' | 'desc' | null;

interface EnhancedStudentTableProps {
  students: Student[];
  selectedIds: Set<string>;
  onSelectAll: (selected: boolean) => void;
  onSelectOne: (id: string, selected: boolean) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onRowClick?: (student: Student) => void;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  columnVisibility: ColumnVisibility;
  isCompact: boolean;
}

const StudentRow = memo(
  ({
    student,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onRowClick,
    columnVisibility,
    isCompact,
  }: {
    student: Student;
    isSelected: boolean;
    onSelect: (selected: boolean) => void;
    onEdit: (s: Student) => void;
    onDelete: (s: Student) => void;
    onRowClick?: (s: Student) => void;
    columnVisibility: ColumnVisibility;
    isCompact: boolean;
  }) => {
    const getRiskBadgeVariant = (risk?: string) => {
      switch (risk) {
        case 'Yüksek':
          return 'destructive';
        case 'Orta':
          return 'default';
        default:
          return 'secondary';
      }
    };

    const cellPadding = isCompact ? 'py-2' : 'py-3';

    return (
      <TableRow className="hover:bg-muted/50 transition-colors group">
        <TableCell className={cellPadding}>
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </TableCell>
        {columnVisibility.id && (
          <TableCell
            className={`font-medium ${cellPadding} cursor-pointer`}
            onClick={() => onRowClick?.(student)}
          >
            {student.id}
          </TableCell>
        )}
        {columnVisibility.ad && (
          <TableCell
            className={`font-medium ${cellPadding} cursor-pointer`}
            onClick={() => onRowClick?.(student)}
          >
            {student.ad}
          </TableCell>
        )}
        {columnVisibility.soyad && (
          <TableCell
            className={`${cellPadding} cursor-pointer`}
            onClick={() => onRowClick?.(student)}
          >
            {student.soyad}
          </TableCell>
        )}
        {columnVisibility.class && (
          <TableCell className={cellPadding}>
            <Badge variant="outline" className="font-normal">
              {student.class}
            </Badge>
          </TableCell>
        )}
        {columnVisibility.cinsiyet && (
          <TableCell className={cellPadding}>
            <Badge variant="outline" className="font-normal">
              {student.cinsiyet === 'E' ? 'Erkek' : 'Kız'}
            </Badge>
          </TableCell>
        )}
        {columnVisibility.risk && (
          <TableCell className={cellPadding}>
            <Badge variant={getRiskBadgeVariant(student.risk)} className="font-normal">
              {student.risk || 'Düşük'}
            </Badge>
          </TableCell>
        )}
        {columnVisibility.actions && (
          <TableCell className={cellPadding}>
            <div className="flex gap-1">
              <Button asChild size="sm" variant="ghost" className="h-8 px-2">
                <Link to={`/ogrenci/${student.id}`}>
                  <Eye className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(student)}
                className="h-8 px-2"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(student)}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  }
);

StudentRow.displayName = 'StudentRow';

export function EnhancedStudentTable({
  students,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  columnVisibility,
  isCompact,
}: EnhancedStudentTableProps) {
  const allSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id));
  const someSelected = students.some((s) => selectedIds.has(s.id)) && !allSelected;

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  const headerPadding = isCompact ? 'py-2' : 'py-3';

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className={headerPadding}>
                <Checkbox
                  checked={allSelected || someSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              {columnVisibility.id && (
                <TableHead className={headerPadding}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold"
                    onClick={() => onSort('id')}
                  >
                    Öğrenci No
                    <SortIcon column="id" />
                  </Button>
                </TableHead>
              )}
              {columnVisibility.ad && (
                <TableHead className={headerPadding}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold"
                    onClick={() => onSort('ad')}
                  >
                    Ad
                    <SortIcon column="ad" />
                  </Button>
                </TableHead>
              )}
              {columnVisibility.soyad && (
                <TableHead className={headerPadding}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold"
                    onClick={() => onSort('soyad')}
                  >
                    Soyad
                    <SortIcon column="soyad" />
                  </Button>
                </TableHead>
              )}
              {columnVisibility.class && (
                <TableHead className={headerPadding}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold"
                    onClick={() => onSort('class')}
                  >
                    Sınıf
                    <SortIcon column="class" />
                  </Button>
                </TableHead>
              )}
              {columnVisibility.cinsiyet && (
                <TableHead className={headerPadding}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold"
                    onClick={() => onSort('cinsiyet')}
                  >
                    Cinsiyet
                    <SortIcon column="cinsiyet" />
                  </Button>
                </TableHead>
              )}
              {columnVisibility.risk && (
                <TableHead className={headerPadding}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold"
                    onClick={() => onSort('risk')}
                  >
                    Risk
                    <SortIcon column="risk" />
                  </Button>
                </TableHead>
              )}
              {columnVisibility.actions && (
                <TableHead className={headerPadding}>İşlemler</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                isSelected={selectedIds.has(student.id)}
                onSelect={(selected) => onSelectOne(student.id, selected)}
                onEdit={onEdit}
                onDelete={onDelete}
                onRowClick={onRowClick}
                columnVisibility={columnVisibility}
                isCompact={isCompact}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
