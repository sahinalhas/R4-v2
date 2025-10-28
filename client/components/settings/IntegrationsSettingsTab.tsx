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
import { Switch } from "@/components/ui/switch";

interface IntegrationsSettingsTabProps {
  form: UseFormReturn<AppSettings>;
}

export default function IntegrationsSettingsTab({
  form,
}: IntegrationsSettingsTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>MEBBİS</CardTitle>
          <CardDescription>Rapor yükleme entegrasyonu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Etkin</Label>
            <Switch
              checked={form.watch("integrations.mebisEnabled")}
              onCheckedChange={(v) =>
                form.setValue("integrations.mebisEnabled", !!v, {
                  shouldValidate: true,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mebisToken">Erişim Anahtarı</Label>
            <Input
              id="mebisToken"
              value={form.watch("integrations.mebisToken") ?? ""}
              onChange={(e) =>
                form.setValue("integrations.mebisToken", e.target.value, {
                  shouldValidate: true,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>e-Okul</CardTitle>
          <CardDescription>Öğrenci verisi senkronizasyonu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Etkin</Label>
            <Switch
              checked={form.watch("integrations.eokulEnabled")}
              onCheckedChange={(v) =>
                form.setValue("integrations.eokulEnabled", !!v, {
                  shouldValidate: true,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="eokulApiKey">API Anahtarı</Label>
            <Input
              id="eokulApiKey"
              value={form.watch("integrations.eokulApiKey") ?? ""}
              onChange={(e) =>
                form.setValue("integrations.eokulApiKey", e.target.value, {
                  shouldValidate: true,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
