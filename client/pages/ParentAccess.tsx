import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications.api";
import { apiClient } from "@/lib/api/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link2, Copy, Trash2, Eye, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";

export default function ParentAccess() {
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: any[] }>('/api/students');
      return response.data;
    },
  });

  const { data: tokens } = useQuery({
    queryKey: ["parent-access-tokens", selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      return await notificationsApi.getParentAccessTokens(Number(selectedStudentId));
    },
    enabled: !!selectedStudentId,
  });

  const generateMutation = useMutation({
    mutationFn: (data: { studentId: number; expiresInDays: number }) =>
      notificationsApi.generateParentAccess(data.studentId, data.expiresInDays),
    onSuccess: (result) => {
      toast.success("Veli erişim linki oluşturuldu");
      queryClient.invalidateQueries({ queryKey: ["parent-access-tokens"] });
      setIsDialogOpen(false);
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(result.link);
        toast.info("Link panoya kopyalandı");
      }
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (tokenId: number) => notificationsApi.revokeParentAccess(tokenId),
    onSuccess: () => {
      toast.success("Erişim iptal edildi");
      queryClient.invalidateQueries({ queryKey: ["parent-access-tokens"] });
    },
  });

  const handleGenerate = () => {
    if (!selectedStudentId) {
      toast.error("Lütfen bir öğrenci seçin");
      return;
    }
    generateMutation.mutate({
      studentId: Number(selectedStudentId),
      expiresInDays: expiryDays,
    });
  };

  const copyToClipboard = (link: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      toast.success("Link panoya kopyalandı");
    } else {
      toast.error("Tarayıcınız kopyalamayı desteklemiyor");
    }
  };

  const getExpiryStatus = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    
    if (expiryDate < now) {
      return <Badge variant="destructive">Süresi Doldu</Badge>;
    }
    
    const daysLeft = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 7) {
      return <Badge variant="outline" className="text-orange-600">
        {daysLeft} gün kaldı
      </Badge>;
    }
    
    return <Badge variant="secondary">{daysLeft} gün kaldı</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veli Dashboard Erişimi</h1>
          <p className="text-muted-foreground mt-2">
            Velilere güvenli dashboard erişimi sağlayın
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Link2 className="h-4 w-4 mr-2" />
              Yeni Erişim Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Veli Erişim Linki Oluştur</DialogTitle>
              <DialogDescription>
                Velilerin çocuklarının ilerleme raporlarını görüntüleyebileceği
                güvenli bir link oluşturun
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="student">Öğrenci</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Öğrenci seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student: any) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.ad} {student.soyad} - {student.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry">Geçerlilik Süresi (Gün)</Label>
                <Input
                  id="expiry"
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  min={1}
                  max={365}
                />
                <p className="text-xs text-muted-foreground">
                  1-365 gün arası bir süre belirleyin
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !selectedStudentId}
                className="w-full"
              >
                Link Oluştur ve Kopyala
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Öğrenci Seçin</CardTitle>
          <CardDescription>
            Erişim linklerini görüntülemek için bir öğrenci seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Öğrenci seçin" />
            </SelectTrigger>
            <SelectContent>
              {students?.map((student: any) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.ad} {student.soyad} - {student.class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudentId && (
        <Card>
          <CardHeader>
            <CardTitle>Aktif Erişim Linkleri</CardTitle>
            <CardDescription>
              Bu öğrenci için oluşturulmuş veli erişim linkleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!tokens || tokens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz erişim linki oluşturulmamış
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Erişim Sayısı</TableHead>
                    <TableHead>Oluşturulma</TableHead>
                    <TableHead>Son Erişim</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token: any) => {
                    const link = `${window.location.origin}/veli-dashboard/${token.token}`;
                    return (
                      <TableRow key={token.id}>
                        <TableCell className="font-mono text-xs">
                          {token.token.substring(0, 16)}...
                        </TableCell>
                        <TableCell>
                          {getExpiryStatus(token.expires_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {token.access_count || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(token.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {token.last_accessed_at
                            ? formatDistanceToNow(new Date(token.last_accessed_at), {
                                addSuffix: true,
                                locale: tr,
                              })
                            : "Henüz erişilmedi"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(link)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revokeMutation.mutate(token.id)}
                              disabled={revokeMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900">Nasıl Çalışır?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>1. Link Oluşturma:</strong> Öğrenci seçip geçerlilik süresi belirleyin.
            Link otomatik oluşturulur ve panoya kopyalanır.
          </p>
          <p>
            <strong>2. Veli ile Paylaşma:</strong> Linki veliye e-posta, SMS veya WhatsApp
            ile gönderin.
          </p>
          <p>
            <strong>3. Güvenli Erişim:</strong> Veli, link ile çocuğunun ilerleme raporlarını,
            risk değerlendirmelerini ve müdahale planlarını görüntüleyebilir.
          </p>
          <p>
            <strong>4. İptal:</strong> İstediğiniz zaman erişimi iptal edebilirsiniz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
