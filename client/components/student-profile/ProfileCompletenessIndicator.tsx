/**
 * Profile Completeness Indicator
 * Profil Tamlık Göstergesi
 * 
 * Her bölümün doluluk yüzdesini ve eksik alanları gösterir
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileSection {
  name: string;
  score: number;
  missingFields?: string[];
}

interface ProfileCompletenessProps {
  overall: number;
  sections: {
    temelBilgiler: number;
    iletisimBilgileri: number;
    veliBilgileri: number;
    akademikProfil: number;
    sosyalDuygusalProfil: number;
    yetenekIlgiProfil: number;
    saglikProfil: number;
    davranisalProfil: number;
  };
  eksikAlanlar?: {
    kategori: string;
    alanlar: string[];
  }[];
}

export function ProfileCompletenessIndicator({ overall, sections, eksikAlanlar }: ProfileCompletenessProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return "Mükemmel";
    if (score >= 70) return "İyi";
    if (score >= 50) return "Orta";
    return "Eksik";
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const profileSections: ProfileSection[] = [
    { name: "Temel Bilgiler", score: sections.temelBilgiler },
    { name: "İletişim Bilgileri", score: sections.iletisimBilgileri },
    { name: "Veli Bilgileri", score: sections.veliBilgileri },
    { name: "Akademik Profil", score: sections.akademikProfil },
    { name: "Sosyal-Duygusal Profil", score: sections.sosyalDuygusalProfil },
    { name: "Yetenek ve İlgi Profili", score: sections.yetenekIlgiProfil },
    { name: "Sağlık Profili", score: sections.saglikProfil },
    { name: "Davranışsal Profil", score: sections.davranisalProfil },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profil Tamlık Durumu</CardTitle>
            <CardDescription>
              Öğrenci profilinin doluluk oranı ve eksik bilgiler
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(overall)}`}>
              %{overall}
            </div>
            <Badge variant={overall >= 70 ? "default" : "destructive"}>
              {getScoreStatus(overall)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Genel İlerleme */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Genel Doluluk</span>
            <span className="text-muted-foreground">{overall}%</span>
          </div>
          <div className="relative">
            <Progress value={overall} className="h-3" />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor(overall)}`}
              style={{ width: `${overall}%` }}
            />
          </div>
        </div>

        {/* Bölüm Detayları */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground">Bölümler</h4>
          {profileSections.map((section) => (
            <div key={section.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{section.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${getScoreColor(section.score)}`}>
                    {section.score}%
                  </span>
                  {section.score === 100 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
              <Progress value={section.score} className="h-2" />
            </div>
          ))}
        </div>

        {/* Eksik Alanlar */}
        {eksikAlanlar && eksikAlanlar.length > 0 && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4" />
              Eksik Bilgiler
            </h4>
            {eksikAlanlar.map((kategori, index) => (
              <Alert key={index} variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">{kategori.kategori}</div>
                  <div className="text-sm text-muted-foreground">
                    {kategori.alanlar.join(", ")}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Öneri Mesajı */}
        {overall < 70 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Profil tamlığı %70'in altında. Nesnel değerlendirme için eksik bilgilerin tamamlanması önerilir.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
