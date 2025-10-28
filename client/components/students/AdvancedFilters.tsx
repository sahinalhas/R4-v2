import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';

interface AdvancedFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedGender: string;
  onGenderChange: (value: string) => void;
  selectedRisk: string;
  onRiskChange: (value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function AdvancedFilters({
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedGender,
  onGenderChange,
  selectedRisk,
  onRiskChange,
  onResetFilters,
  hasActiveFilters,
  activeFilterCount,
}: AdvancedFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filtreler</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} aktif
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Temizle
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Öğrenci ara (No, Ad, Soyad)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedClass} onValueChange={onClassChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tum">Tüm Sınıflar</SelectItem>
            <SelectItem value="9">9. Sınıf</SelectItem>
            <SelectItem value="10">10. Sınıf</SelectItem>
            <SelectItem value="11">11. Sınıf</SelectItem>
            <SelectItem value="12">12. Sınıf</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedGender} onValueChange={onGenderChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tum">Tüm Cinsiyetler</SelectItem>
            <SelectItem value="K">Kız</SelectItem>
            <SelectItem value="E">Erkek</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedRisk} onValueChange={onRiskChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tum">Tüm Risk Seviyeleri</SelectItem>
            <SelectItem value="Düşük">Düşük Risk</SelectItem>
            <SelectItem value="Orta">Orta Risk</SelectItem>
            <SelectItem value="Yüksek">Yüksek Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
