import { UseFormReturn } from "react-hook-form";
import { AppSettings } from "@/lib/app-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface DataSettingsTabProps {
  form: UseFormReturn<AppSettings>;
}

export default function DataSettingsTab({ form }: DataSettingsTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Veri ve Yedekleme</CardTitle>
          <CardDescription>Otomatik kaydetme ve yedekleme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Otomatik Kaydet</Label>
            <Switch
              checked={form.watch("data.autosave")}
              onCheckedChange={(v) =>
                form.setValue("data.autosave", !!v, {
                  shouldValidate: true,
                })
              }
            />
          </div>
          <div className="grid gap-2 max-w-xs">
            <Label htmlFor="autosaveInterval">
              Otomatik Kaydetme Aralığı (dk)
            </Label>
            <Input
              id="autosaveInterval"
              type="number"
              min={1}
              max={60}
              value={form.watch("data.autosaveInterval")}
              onChange={(e) =>
                form.setValue(
                  "data.autosaveInterval",
                  Number(e.target.value),
                  { shouldValidate: true },
                )
              }
            />
          </div>
          <div className="grid gap-2 max-w-xs">
            <Label htmlFor="backupFrequency">Yedekleme Sıklığı</Label>
            <Select
              value={form.watch("data.backupFrequency")}
              onValueChange={(v) =>
                form.setValue(
                  "data.backupFrequency",
                  v as AppSettings["data"]["backupFrequency"],
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger id="backupFrequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Kapalı</SelectItem>
                <SelectItem value="weekly">Haftalık</SelectItem>
                <SelectItem value="monthly">Aylık</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="anon"
              checked={form.watch("data.anonymizeOnExport")}
              onCheckedChange={(v) =>
                form.setValue("data.anonymizeOnExport", !!v, {
                  shouldValidate: true,
                })
              }
            />
            <Label htmlFor="anon">
              Dışa aktarırken verileri anonimleştir
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Veri Tutarlılığı</CardTitle>
          <CardDescription>
            KVKK ve anonimleştirme uyarıları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            KVKK kapsamında kişisel verilerin korunması için anonimleştirme
            seçeneklerini etkinleştirebilirsiniz. Yedeklemeler yalnızca bu
            tarayıcıya yerel olarak kaydedilir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
