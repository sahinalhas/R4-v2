import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  FileSpreadsheet, 
  User, 
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react';
import type { ExamSession } from '../../../shared/types/exam-management.types';

interface ResultEntryOptionsProps {
  session: ExamSession;
  onBulkTableEntry: () => void;
  onExcelEntry: () => void;
  onIndividualEntry: () => void;
  onViewStatistics: () => void;
  resultsCount?: number;
  totalStudents?: number;
}

export function ResultEntryOptions({
  session,
  onBulkTableEntry,
  onExcelEntry,
  onIndividualEntry,
  onViewStatistics,
  resultsCount = 0,
  totalStudents = 0,
}: ResultEntryOptionsProps) {
  const completionPercentage = totalStudents > 0 ? Math.round((resultsCount / totalStudents) * 100) : 0;
  const hasResults = resultsCount > 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{session.name}</h3>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {new Date(session.exam_date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">
                {resultsCount} / {totalStudents} öğrenci
              </div>
              {hasResults && (
                <Button
                  onClick={onViewStatistics}
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                >
                  İstatistikleri Gör
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          {totalStudents > 0 && (
            <div className="mt-4 w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Table Entry */}
        <Card className="group relative overflow-hidden border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                Önerilen
              </Badge>
            </div>
            <CardTitle className="text-xl mt-4">Hızlı Tablo Girişi</CardTitle>
            <CardDescription className="text-sm">
              Tüm öğrenciler için spreadsheet tarzında hızlı giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Tab/Enter ile hızlı geçiş</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Tüm öğrencileri bir ekranda görün</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Excel'den yapıştırma desteği</span>
              </div>
            </div>
            <Button
              onClick={onBulkTableEntry}
              className="w-full group-hover:shadow-md transition-shadow"
              size="lg"
            >
              Başla
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* Excel Import */}
        <Card className="group relative overflow-hidden border-2 hover:border-green-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors w-fit">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl mt-4">Excel'den İçe Aktar</CardTitle>
            <CardDescription className="text-sm">
              Hazır Excel dosyanızı yükleyin veya sürükle-bırak yapın
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Sürükle-bırak desteği</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Şablon indirme</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Otomatik doğrulama</span>
              </div>
            </div>
            <Button
              onClick={onExcelEntry}
              className="w-full bg-green-600 hover:bg-green-700 group-hover:shadow-md transition-shadow"
              size="lg"
            >
              Excel Yükle
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* Individual Entry */}
        <Card className="group relative overflow-hidden border-2 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors w-fit">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl mt-4">Öğrenci Öğrenci</CardTitle>
            <CardDescription className="text-sm">
              Her öğrenci için detaylı bireysel sonuç girişi yapın
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Detaylı öğrenci seçimi</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Ders bazında net hesaplama</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Anlık sonuç görüntüleme</span>
              </div>
            </div>
            <Button
              onClick={onIndividualEntry}
              className="w-full bg-blue-600 hover:bg-blue-700 group-hover:shadow-md transition-shadow"
              size="lg"
            >
              Giriş Yap
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">💡</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Hızlı İpuçları</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Çok sayıda öğrenci için <strong>Hızlı Tablo Girişi</strong> en hızlı yöntemdir</li>
                <li>Daha önce Excel'de hazırladıysanız <strong>Excel İçe Aktar</strong> kullanın</li>
                <li>Az sayıda öğrenci veya düzeltme için <strong>Bireysel Giriş</strong> tercih edin</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
