import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TransferSettingsTabProps {
  onExport: () => void;
  onImport: React.ChangeEventHandler<HTMLInputElement>;
}

export default function TransferSettingsTab({
  onExport,
  onImport,
}: TransferSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ayar Transferi</CardTitle>
        <CardDescription>Yedek al veya içe aktar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button type="button" onClick={onExport}>
            Dışa Aktar (JSON)
          </Button>
          <div>
            <input
              id="importFile"
              type="file"
              accept="application/json"
              className="hidden"
              onChange={onImport}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                document.getElementById("importFile")?.click()
              }
            >
              İçe Aktar
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Ayarlar yalnızca bu tarayıcıda yerel olarak saklanır.
        </p>
      </CardContent>
    </Card>
  );
}
