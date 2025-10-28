import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Upload, Download, UserPlus, FileSpreadsheet, FileText, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Student, upsertStudent } from '@/lib/storage';
import { frontendToBackend } from '@/lib/types/student.types';
import { apiClient } from '@/lib/api/api-client';
import { STUDENT_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { ApiResponse } from '@/lib/types/api-types';

import { useStudents } from '@/hooks/useStudents';
import { useStudentStats } from '@/hooks/useStudentStats';
import { useStudentFilters } from '@/hooks/useStudentFilters';
import { usePagination } from '@/hooks/usePagination';
import { exportToCSV, exportToPDF, exportToExcel } from '@/utils/exportHelpers';

import { StatsCards } from '@/components/students/StatsCards';
import { AdvancedFilters } from '@/components/students/AdvancedFilters';
import { BulkActions } from '@/components/students/BulkActions';
import { EnhancedStudentTable, type SortColumn, type SortDirection } from '@/components/students/EnhancedStudentTable';
import { TableControls, type ColumnVisibility } from '@/components/students/TableControls';
import { StudentDrawer } from '@/components/students/StudentDrawer';
import { StudentCard } from '@/components/students/StudentCard';
import { EmptyState } from '@/components/students/EmptyState';
import { TableSkeleton } from '@/components/students/TableSkeleton';

export default function Students() {
  const { students, isLoading, invalidate } = useStudents();
  const [isMobileView, setIsMobileView] = useState(false);
  
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [confirmationName, setConfirmationName] = useState('');
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    id: true,
    ad: true,
    soyad: true,
    class: true,
    cinsiyet: true,
    risk: true,
    actions: true,
  });
  const [isCompact, setIsCompact] = useState(false);

  const stats = useStudentStats(students);
  const filters = useStudentFilters(students);

  const sortedStudents = sortStudents(
    filters.filteredStudents,
    sortColumn,
    sortDirection
  );

  const pagination = usePagination(sortedStudents, 25);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Student>({
    defaultValues: {
      id: '',
      ad: '',
      soyad: '',
      class: '9/A',
      cinsiyet: 'K',
      risk: 'Düşük',
    },
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const onCreate = async (data: Student) => {
    const id = (data.id || '').trim();
    if (!id) {
      toast.error('Öğrenci numarası zorunludur.');
      return;
    }
    if (!/^\d+$/.test(id)) {
      toast.error('Öğrenci numarası sadece rakamlardan oluşmalıdır.');
      return;
    }
    if (students.some((s) => s.id === id)) {
      toast.error('Bu öğrenci numarası zaten kayıtlı.');
      return;
    }

    const newStudent = { ...data, id, kayitTarihi: new Date().toISOString() };

    try {
      await upsertStudent(newStudent);
      invalidate();
      reset();
      setOpen(false);
      toast.success('Öğrenci başarıyla eklendi.');
    } catch (error) {
      toast.error('Öğrenci kaydedilemedi. Lütfen tekrar deneyin.');
      console.error('Failed to save student:', error);
    }
  };

  const onEditClick = (student: Student) => {
    setStudentToEdit(student);
    setValue('id', student.id);
    setValue('ad', student.ad);
    setValue('soyad', student.soyad);
    setValue('class', student.class);
    setValue('cinsiyet', student.cinsiyet);
    setValue('risk', student.risk || 'Düşük');
    setEditOpen(true);
  };

  const onUpdate = async (data: Student) => {
    if (!studentToEdit) return;

    const id = (data.id || '').trim();
    if (!id) {
      toast.error('Öğrenci numarası zorunludur.');
      return;
    }
    if (!/^\d+$/.test(id)) {
      toast.error('Öğrenci numarası sadece rakamlardan oluşmalıdır.');
      return;
    }
    if (id !== studentToEdit.id && students.some((s) => s.id === id)) {
      toast.error('Bu öğrenci numarası zaten kayıtlı.');
      return;
    }

    const updatedStudent = { ...studentToEdit, ...data, id };

    try {
      await upsertStudent(updatedStudent);
      invalidate();
      reset();
      setEditOpen(false);
      setStudentToEdit(null);
      toast.success('Öğrenci başarıyla güncellendi.');
    } catch (error) {
      toast.error('Öğrenci güncellenemedi. Lütfen tekrar deneyin.');
      console.error('Failed to update student:', error);
    }
  };

  const onDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setConfirmationName('');
    setDeleteDialogOpen(true);
  };

  const onDeleteConfirm = async () => {
    if (!studentToDelete) return;

    const expectedName = `${studentToDelete.ad} ${studentToDelete.soyad}`.trim();
    if (confirmationName.trim() !== expectedName) {
      toast.error('Öğrencinin tam adını doğru yazmalısınız!');
      return;
    }

    try {
      const response = await fetch(STUDENT_ENDPOINTS.BY_ID(studentToDelete.id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationName: expectedName }),
      });

      const result = await response.json();

      if (result.success) {
        invalidate();
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
        setConfirmationName('');
        toast.success(`${expectedName} başarıyla silindi.`);
      } else {
        toast.error(result.error || 'Silme işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Silme işlemi sırasında hata oluştu.');
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedStudentIds);
    try {
      for (const id of idsToDelete) {
        await fetch(STUDENT_ENDPOINTS.BY_ID(id), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
      }
      invalidate();
      setSelectedStudentIds(new Set());
      toast.success(`${idsToDelete.length} öğrenci silindi.`);
    } catch (error) {
      toast.error('Toplu silme işlemi başarısız oldu.');
      console.error('Bulk delete error:', error);
    }
  };

  const handleBulkUpdateRisk = async (risk: 'Düşük' | 'Orta' | 'Yüksek') => {
    const idsToUpdate = Array.from(selectedStudentIds);

    try {
      for (const id of idsToUpdate) {
        const student = students.find((s) => s.id === id);
        if (student) {
          await upsertStudent({ ...student, risk });
        }
      }
      invalidate();
      setSelectedStudentIds(new Set());
      toast.success(`${idsToUpdate.length} öğrencinin risk seviyesi güncellendi.`);
    } catch (error) {
      toast.error('Toplu güncelleme işlemi başarısız oldu.');
      console.error('Bulk update error:', error);
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedStudentIds(
        new Set(pagination.paginatedItems.map((s) => s.id))
      );
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleSelectOne = (id: string, selected: boolean) => {
    const newSet = new Set(selectedStudentIds);
    if (selected) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedStudentIds(newSet);
  };

  const handleColumnVisibilityChange = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const handleRowClick = (student: Student) => {
    setDrawerStudent(student);
    setDrawerOpen(true);
  };

  const importSheet = async (file: File) => {
    try {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Dosya boyutu çok büyük. Maksimum 5MB dosya yükleyebilirsiniz.');
        return;
      }

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
        toast.error(
          'Desteklenmeyen dosya formatı. Sadece Excel (.xlsx, .xls) ve CSV (.csv) dosyaları desteklenmektedir.'
        );
        return;
      }

      const isCsv = ext === 'csv';
      let data: ArrayBuffer | Uint8Array;

      if (isCsv) {
        const buffer = await file.arrayBuffer();
        let decodedText: string;
        try {
          decodedText = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        } catch (utfError) {
          decodedText = new TextDecoder('windows-1254').decode(buffer);
        }
        data = new TextEncoder().encode(decodedText);
      } else {
        data = await file.arrayBuffer();
      }

      const wb = XLSX.read(data, { type: 'array', codepage: 65001 });
      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        toast.error('Dosyada geçerli bir sayfa bulunamadı.');
        return;
      }

      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as unknown[][];

      if (!rows.length) {
        toast.error('Dosya boş veya geçerli veri içermiyor.');
        return;
      }

      if (rows.length > 10000) {
        toast.error('Dosyada çok fazla satır var. Maksimum 10.000 satır desteklenmektedir.');
        return;
      }

      const imported = parseImportedRows(rows);

      if (!imported.length) {
        toast.error('Dosyadan hiçbir geçerli öğrenci verisi bulunamadı.');
        return;
      }

      const updatedStudents = mergeStudents(students, imported);

      try {
        const backendStudents = updatedStudents.map((s) => frontendToBackend(s));
        await apiClient.post<ApiResponse>(
          STUDENT_ENDPOINTS.BULK,
          backendStudents,
          {
            showSuccessToast: true,
            successMessage: `${imported.length} öğrenci başarıyla içe aktarıldı.`,
            showErrorToast: true,
          }
        );
        invalidate();
      } catch (error) {
        console.error('Backend save error:', error);
      }
    } catch (error) {
      console.error('File import error:', error);
      toast.error('Dosya içe aktarılırken hata oluştu.');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Öğrenci Yönetimi"
        subtitle="Öğrenci kayıtlarını görüntüleyin ve yönetin"
        icon={Users}
        actions={
          <>
            <div className="flex gap-2 flex-wrap">
              <label className="inline-flex items-center">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => e.target.files && importSheet(e.target.files[0])}
                />
                <Button variant="secondary" size="sm" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" /> İçe Aktar
                  </span>
                </Button>
              </label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Dışa Aktar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Dışa Aktarma Formatı</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      exportToCSV(
                        selectedStudentIds.size > 0
                          ? students.filter((s) => selectedStudentIds.has(s.id))
                          : filters.filteredStudents
                      )
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    CSV Dosyası
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      exportToExcel(
                        selectedStudentIds.size > 0
                          ? students.filter((s) => selectedStudentIds.has(s.id))
                          : filters.filteredStudents
                      )
                    }
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel Dosyası
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      exportToPDF(
                        selectedStudentIds.size > 0
                          ? students.filter((s) => selectedStudentIds.has(s.id))
                          : filters.filteredStudents
                      )
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF Dosyası
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Yeni Öğrenci
                  </Button>
                </DialogTrigger>
                <StudentFormDialog
                  onSubmit={handleSubmit(onCreate)}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                  title="Yeni Öğrenci Ekle"
                  submitText="Kaydet"
                />
              </Dialog>
            </div>
          </>
        }
      />

      <StatsCards stats={stats} isLoading={isLoading} />

      <AdvancedFilters
        searchQuery={filters.filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
        selectedClass={filters.filters.selectedClass}
        onClassChange={filters.setSelectedClass}
        selectedGender={filters.filters.selectedGender}
        onGenderChange={filters.setSelectedGender}
        selectedRisk={filters.filters.selectedRisk}
        onRiskChange={filters.setSelectedRisk}
        onResetFilters={filters.resetFilters}
        hasActiveFilters={filters.hasActiveFilters}
        activeFilterCount={filters.activeFilterCount}
      />

      <BulkActions
        selectedCount={selectedStudentIds.size}
        onBulkDelete={handleBulkDelete}
        onBulkUpdateRisk={handleBulkUpdateRisk}
        onClearSelection={() => setSelectedStudentIds(new Set())}
      />

      {!isMobileView && (
        <TableControls
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          isCompact={isCompact}
          onCompactToggle={() => setIsCompact(!isCompact)}
          pageSize={pagination.pageSize}
          onPageSizeChange={pagination.setPageSize}
        />
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : students.length === 0 ? (
        <EmptyState variant="no-students" onAddStudent={() => setOpen(true)} />
      ) : filters.filteredStudents.length === 0 ? (
        <EmptyState variant="no-results" onClearFilters={filters.resetFilters} />
      ) : (
        <>
          {isMobileView ? (
            <div className="grid grid-cols-1 gap-4">
              {pagination.paginatedItems.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  isSelected={selectedStudentIds.has(student.id)}
                  onSelect={(selected) => handleSelectOne(student.id, selected)}
                  onEdit={onEditClick}
                  onDelete={onDeleteClick}
                  onView={handleRowClick}
                />
              ))}
            </div>
          ) : (
            <EnhancedStudentTable
              students={pagination.paginatedItems}
              selectedIds={selectedStudentIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onEdit={onEditClick}
              onDelete={onDeleteClick}
              onRowClick={handleRowClick}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              columnVisibility={columnVisibility}
              isCompact={isCompact}
            />
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {pagination.startIndex + 1}-{pagination.endIndex} arası gösteriliyor
                (Toplam {pagination.totalItems} öğrenci)
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={pagination.previousPage}
                      className={
                        !pagination.canGoPrevious
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => pagination.setPage(pageNum)}
                          isActive={pageNum === pagination.currentPage}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={pagination.nextPage}
                      className={
                        !pagination.canGoNext
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <StudentFormDialog
          onSubmit={handleSubmit(onUpdate)}
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          title="Öğrenci Düzenle"
          submitText="Değişiklikleri Kaydet"
          onCancel={() => {
            setEditOpen(false);
            setStudentToEdit(null);
            reset();
          }}
        />
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-red-600 flex items-center gap-2">
              Öğrenci Silme Onayı
            </DialogTitle>
          </DialogHeader>
          {studentToDelete && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">
                  {studentToDelete.ad} {studentToDelete.soyad}
                </strong>{' '}
                öğrencisini kalıcı olarak silmek istediğinizden emin misiniz?
              </p>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold mb-1">
                  ⚠️ Bu işlem geri alınamaz!
                </p>
                <p className="text-xs text-red-700">
                  Tüm akademik kayıtlar, notlar ve ilerleme verileri kalıcı olarak silinecektir.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Silme işlemini onaylamak için öğrencinin tam adını yazın:
                </label>
                <Input
                  value={confirmationName}
                  onChange={(e) => setConfirmationName(e.target.value)}
                  placeholder={`${studentToDelete.ad} ${studentToDelete.soyad}`}
                  className="border-red-300 focus:border-red-500"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={onDeleteConfirm}
              disabled={!confirmationName.trim()}
              className="w-full sm:w-auto"
            >
              Kalıcı Olarak Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StudentDrawer
        student={drawerStudent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={onEditClick}
      />
    </div>
  );
}

function StudentFormDialog({
  onSubmit,
  register,
  setValue,
  watch,
  errors,
  title,
  submitText,
  onCancel,
}: {
  onSubmit: () => void;
  register: any;
  setValue: any;
  watch: any;
  errors: any;
  title: string;
  submitText: string;
  onCancel?: () => void;
}) {
  return (
    <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">{title}</DialogTitle>
      </DialogHeader>
      <form
        id="student-form"
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Öğrenci No</label>
          <Input
            placeholder="12345"
            inputMode="numeric"
            type="text"
            {...register('id', {
              required: 'Öğrenci numarası zorunludur',
              pattern: {
                value: /^\d+$/,
                message: 'Öğrenci numarası sadece rakamlardan oluşmalıdır',
              },
            })}
          />
          {errors.id && <p className="text-xs text-red-600">{errors.id.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Ad</label>
          <Input
            placeholder="Ahmet"
            {...register('ad', { required: 'Ad zorunludur' })}
          />
          {errors.ad && <p className="text-xs text-red-600">{errors.ad.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Soyad</label>
          <Input
            placeholder="Yılmaz"
            {...register('soyad', { required: 'Soyad zorunludur' })}
          />
          {errors.soyad && <p className="text-xs text-red-600">{errors.soyad.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sınıf</label>
          <Input placeholder="9/A" {...register('class')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Cinsiyet</label>
          <Select
            onValueChange={(v) => setValue('cinsiyet', v as 'K' | 'E')}
            value={watch('cinsiyet')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="K">Kız</SelectItem>
              <SelectItem value="E">Erkek</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register('cinsiyet')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Risk Seviyesi</label>
          <Select
            onValueChange={(v) => setValue('risk', v as 'Düşük' | 'Orta' | 'Yüksek')}
            value={watch('risk')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Düşük">Düşük</SelectItem>
              <SelectItem value="Orta">Orta</SelectItem>
              <SelectItem value="Yüksek">Yüksek</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register('risk')} />
        </div>
      </form>
      <DialogFooter className="flex-col sm:flex-row gap-2">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto min-h-[44px]"
          >
            İptal
          </Button>
        )}
        <Button
          form="student-form"
          type="submit"
          className="w-full sm:w-auto min-h-[44px]"
        >
          {submitText}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function sortStudents(
  students: Student[],
  column: SortColumn | null,
  direction: SortDirection
): Student[] {
  if (!column || !direction) return students;

  return [...students].sort((a, b) => {
    let aVal: string | number = a[column] || '';
    let bVal: string | number = b[column] || '';

    if (column === 'id') {
      aVal = parseInt(a.id) || 0;
      bVal = parseInt(b.id) || 0;
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

function parseImportedRows(rows: unknown[][]): Student[] {
  const normalize = (s?: string) => (s || '').toString().trim();
  const slug = (s?: string) =>
    normalize(s)
      .toLowerCase()
      .replaceAll('ı', 'i')
      .replaceAll('İ', 'i')
      .replaceAll('ç', 'c')
      .replaceAll('Ç', 'c')
      .replaceAll('ö', 'o')
      .replaceAll('Ö', 'o')
      .replaceAll('ğ', 'g')
      .replaceAll('Ğ', 'g')
      .replaceAll('ş', 's')
      .replaceAll('Ş', 's')
      .replaceAll('ü', 'u')
      .replaceAll('Ü', 'u')
      .replace(/[^a-z0-9]+/g, '');

  const header = rows[0].map((h) => slug(String(h)));
  const idx = (keys: string[]) => header.findIndex((h) => keys.includes(h));

  const iNum = idx(['numara', 'no', 'ogrencino', 'id'].map(slug));
  const iName = idx(['adisoyadi', 'adisoyad'].map(slug));
  const iAd = idx(['ad', 'adi']);
  const iSoyad = idx(['soyad', 'soyadi']);
  const iSinif = idx(['class', 'sinif', 'sınıf'].map(slug));
  const iCins = idx(['cinsiyet', 'cinsiyeti']);
  const iRisk = idx(['risk']);

  const imported: Student[] = [];
  for (const r of rows.slice(1)) {
    const numVal = iNum >= 0 ? normalize(String(r[iNum])) : '';
    const nameCombined = iName >= 0 ? normalize(String(r[iName])) : '';
    const nameStr = typeof nameCombined === 'string' ? nameCombined : '';
    const ad = iAd >= 0 ? normalize(String(r[iAd])) : (nameStr ? nameStr.split(/\s+/).slice(0, -1).join(' ') || nameStr : '');
    const soyad = iSoyad >= 0 ? normalize(String(r[iSoyad])) : (nameStr ? nameStr.split(/\s+/).slice(-1)[0] || '' : '');
    const classValue = iSinif >= 0 ? normalize(String(r[iSinif])) : '';
    const cRaw = iCins >= 0 ? slug(String(r[iCins])) : '';
    const risk = iRisk >= 0 ? normalize(String(r[iRisk])) : undefined;

    if (!ad && !soyad) continue;
    const id = numVal.replace(/\D/g, '');
    if (!id) continue;

    const cinsiyet: 'K' | 'E' = cRaw.startsWith('k') ? 'K' : cRaw.startsWith('e') ? 'E' : 'K';
    imported.push({
      id,
      ad,
      soyad,
      class: classValue || '9/A',
      cinsiyet,
      risk: risk
        ? risk.toLowerCase() === 'high' || risk.toLowerCase() === 'yüksek'
          ? 'Yüksek'
          : risk.toLowerCase() === 'medium' || risk.toLowerCase() === 'orta'
            ? 'Orta'
            : 'Düşük'
        : undefined,
      kayitTarihi: new Date().toISOString(),
    });
  }

  return imported;
}

function mergeStudents(existing: Student[], imported: Student[]): Student[] {
  const map = new Map(existing.map((s) => [s.id, s]));
  for (const s of imported) {
    if (map.has(s.id)) {
      map.set(s.id, { ...map.get(s.id)!, ...s });
    } else {
      map.set(s.id, s);
    }
  }
  return Array.from(map.values());
}
