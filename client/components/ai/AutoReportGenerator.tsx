import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/enhanced-textarea";
import { FileText, Download, Loader2, Calendar, ClipboardCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AutoReportGeneratorProps {
  studentId: string;
  studentName: string;
}

export default function AutoReportGenerator({ studentId, studentName }: AutoReportGeneratorProps) {
  const [reportType, setReportType] = useState<'progress' | 'ram' | 'bep'>('progress');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [referralReason, setReferralReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const generateReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let body: any = {};

      switch (reportType) {
        case 'progress':
          endpoint = `/api/reports/progress/${studentId}`;
          body = { reportType: 'quarterly', reportPeriod: 'Dönem 1' };
          break;
        case 'ram':
          if (!referralReason) {
            toast({ title: 'Hata', description: 'Sevk nedeni gerekli', variant: 'destructive' });
            setLoading(false);
            return;
          }
          endpoint = `/api/reports/ram/${studentId}`;
          body = { referralReason };
          break;
        case 'bep':
          endpoint = `/api/reports/bep/${studentId}`;
          body = { diagnosis };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      
      if (data.success) {
        setReport(data.data);
        toast({
          title: 'Rapor Oluşturuldu',
          description: 'AI raporu başarıyla hazırlandı'
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Rapor oluşturulamadı',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { value: 'progress', label: 'Dönemsel Gelişim Raporu', icon: Calendar },
    { value: 'ram', label: 'RAM Sevk Raporu', icon: ClipboardCheck },
    { value: 'bep', label: 'BEP Raporu', icon: FileText }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Otomatik Rapor Oluşturucu
          </CardTitle>
          <CardDescription>
            {studentName} için AI destekli raporlar oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rapor Tipi</Label>
            <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {reportType === 'ram' && (
            <div className="space-y-2">
              <Label>Sevk Nedeni *</Label>
              <Textarea
                placeholder="Öğrencinin RAM'a sevk edilme nedenini açıklayın..."
                value={referralReason}
                onChange={(e) => setReferralReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {reportType === 'bep' && (
            <div className="space-y-2">
              <Label>Tanı (Opsiyonel)</Label>
              <Textarea
                placeholder="Varsa öğrencinin tanısını giriniz..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={2}
              />
            </div>
          )}

          <Button onClick={generateReport} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rapor Oluşturuluyor...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Rapor Oluştur
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {reportType === 'progress' && 'Gelişim Raporu'}
                {reportType === 'ram' && 'RAM Sevk Raporu'}
                {reportType === 'bep' && 'BEP Raporu'}
              </CardTitle>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportType === 'progress' && (
              <>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Yönetici Özeti</h4>
                  <p className="text-sm text-muted-foreground">{report.executiveSummary}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Akademik İlerleme</h4>
                  <p className="text-sm text-muted-foreground mb-2">{report.academicProgress?.overview}</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="p-2 border rounded">
                      <Label className="text-xs text-green-600">Güçlü Yönler</Label>
                      <ul className="text-xs mt-1 space-y-1">
                        {report.academicProgress?.strengths?.map((s: string, i: number) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2 border rounded">
                      <Label className="text-xs text-orange-600">Gelişim Alanları</Label>
                      <ul className="text-xs mt-1 space-y-1">
                        {report.academicProgress?.areasForImprovement?.map((s: string, i: number) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Öneriler</h4>
                  <div className="space-y-2">
                    <div className="p-2 border rounded">
                      <Label className="text-xs">Öğrenci İçin</Label>
                      <ul className="text-xs mt-1 space-y-1 text-muted-foreground">
                        {report.recommendations?.forStudent?.map((r: string, i: number) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2 border rounded">
                      <Label className="text-xs">Veli İçin</Label>
                      <ul className="text-xs mt-1 space-y-1 text-muted-foreground">
                        {report.recommendations?.forParents?.map((r: string, i: number) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {reportType === 'ram' && (
              <>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Sevk Nedeni</h4>
                  <p className="text-sm">{report.referralReason}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Mevcut Endişeler</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {Object.entries(report.currentConcerns || {}).map(([key, values]: [string, any]) => (
                      <div key={key} className="p-2 border rounded">
                        <Label className="text-xs capitalize">{key}</Label>
                        <ul className="text-xs mt-1 space-y-1">
                          {values?.map((v: string, i: number) => (
                            <li key={i}>• {v}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Önerilen Hizmetler</h4>
                  <ul className="text-sm space-y-1">
                    {report.recommendedServices?.map((s: string, i: number) => (
                      <li key={i} className="p-2 border rounded">• {s}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {reportType === 'bep' && (
              <>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Öğrenci Profili</h4>
                  {report.studentProfile?.diagnosis && (
                    <p className="text-sm mb-2"><strong>Tanı:</strong> {report.studentProfile.diagnosis}</p>
                  )}
                  <p className="text-sm"><strong>Öğrenme Stili:</strong> {report.studentProfile?.learningStyle}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Yıllık Hedefler</h4>
                  <div className="space-y-2">
                    {report.annualGoals?.map((goal: any, i: number) => (
                      <div key={i} className="p-3 border rounded">
                        <p className="text-sm font-medium">{goal.goal}</p>
                        <p className="text-xs text-muted-foreground mt-1">{goal.measurableCriteria}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs">Süre: {goal.timeline}</span>
                          <span className="text-xs">Sorumlu: {goal.responsibleParty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Uyarlamalar</h4>
                  <div className="space-y-2">
                    {report.accommodations?.map((acc: any, i: number) => (
                      <div key={i} className="p-2 border rounded">
                        <Label className="text-xs">{acc.category}</Label>
                        <ul className="text-xs mt-1 space-y-1">
                          {acc.accommodations?.map((a: string, idx: number) => (
                            <li key={idx}>• {a}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
