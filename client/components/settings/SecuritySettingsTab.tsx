import { UseFormReturn } from "react-hook-form";
import { AppSettings } from "@/lib/app-settings";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SecuritySettingsTabProps {
  form: UseFormReturn<AppSettings>;
  ack1: boolean;
  setAck1: (value: boolean) => void;
  ack2: boolean;
  setAck2: (value: boolean) => void;
  confirmEmail: string;
  setConfirmEmail: (value: string) => void;
  confirmCode: string;
  setConfirmCode: (value: string) => void;
  onReset: () => void;
  onExport: () => void;
}

export default function SecuritySettingsTab({
  form,
  ack1,
  setAck1,
  ack2,
  setAck2,
  confirmEmail,
  setConfirmEmail,
  confirmCode,
  setConfirmCode,
  onReset,
  onExport,
}: SecuritySettingsTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Gizlilik ve Güvenlik</CardTitle>
          <CardDescription>Analitik ve veri paylaşımı</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="analytics"
              checked={form.watch("privacy.analyticsEnabled")}
              onCheckedChange={(v) =>
                form.setValue("privacy.analyticsEnabled", !!v, {
                  shouldValidate: true,
                })
              }
            />
            <Label htmlFor="analytics">
              Kullanım analitiklerini etkinleştir
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="share"
              checked={form.watch("privacy.dataSharingEnabled")}
              onCheckedChange={(v) =>
                form.setValue("privacy.dataSharingEnabled", !!v, {
                  shouldValidate: true,
                })
              }
            />
            <Label htmlFor="share">
              Anonim veri paylaşımını etkinleştir
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card id="secure-reset">
        <CardHeader>
          <CardTitle>Güvenli Sıfırlama</CardTitle>
          <CardDescription>
            Ayarları varsayılana döndürmeden önce ek onay gereklidir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onExport}>
              Dışa Aktar (JSON)
            </Button>
            <span className="text-xs text-muted-foreground">
              İşlemden önce ayarlarınızı yedekleyin.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="ack1"
              checked={ack1}
              onCheckedChange={(v) => setAck1(!!v)}
            />
            <Label htmlFor="ack1">
              Tüm ayarların sıfırlanacağını onaylıyorum
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="ack2"
              checked={ack2}
              onCheckedChange={(v) => setAck2(!!v)}
            />
            <Label htmlFor="ack2">
              Bu işlemin geri alınamayacağını anladım
            </Label>
          </div>
          <div className="grid gap-2 max-w-sm">
            <Label htmlFor="confirmEmail">E-posta ile doğrula</Label>
            <Input
              id="confirmEmail"
              placeholder={
                form.watch("account.email") || "user@example.com"
              }
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Kayıtlı e-posta adresinizi tam olarak yazın.
            </p>
          </div>
          <div className="grid gap-2 max-w-sm">
            <Label htmlFor="confirmCode">Onay ifadesi</Label>
            <Input
              id="confirmCode"
              placeholder="SIFIRLA"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Devam etmek için SIFIRLA yazın.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={
                  !(
                    ack1 &&
                    ack2 &&
                    (confirmEmail || "") ===
                      (form.watch("account.email") || "") &&
                    (confirmCode || "").toUpperCase() === "SIFIRLA"
                  )
                }
              >
                Varsayılana Döndür
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Ayarlara geri dönülsün mü?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tüm ayarlar varsayılana dönecek ve bu işlem geri alınamaz.
                  Emin misiniz?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                <AlertDialogAction onClick={onReset}>
                  Evet, sıfırla
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
