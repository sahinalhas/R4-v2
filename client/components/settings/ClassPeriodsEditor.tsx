import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import React from "react";

export type ClassPeriod = {
  start: string; // HH:mm
  end: string; // HH:mm
};

type Props = {
  periods: ClassPeriod[];
  onChange: (next: ClassPeriod[]) => void;
};

export default function ClassPeriodsEditor({ periods, onChange }: Props) {
  const addRow = () => {
    const next: ClassPeriod = { start: "", end: "" };
    onChange([...(periods || []), next]);
  };

  const removeRow = (idx: number) => {
    const copy = [...(periods || [])];
    copy.splice(idx, 1);
    onChange(copy);
  };

  const update = (idx: number, patch: Partial<ClassPeriod>) => {
    const copy = [...(periods || [])];
    const cur = copy[idx] || { start: "", end: "" };
    copy[idx] = { ...cur, ...patch };
    onChange(copy);
  };

  const rows = periods?.length ? periods : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ders Saatleri</CardTitle>
        <CardDescription>
          Her ders için başlangıç ve bitiş saatini girin (ör. 1. Ders 09:00 -
          09:50)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Saat formatı: HH:mm (24 saat)
          </div>
          <Button type="button" onClick={addRow} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Ders Ekle
          </Button>
        </div>
        <Separator />
        <div className="space-y-3">
          {rows.map((p, idx) => (
            <div
              key={idx}
              className="grid items-end gap-3 md:grid-cols-[100px,1fr,1fr,auto]"
            >
              <div>
                <Label>Ders</Label>
                <Input readOnly value={`${idx + 1}. Ders`} />
              </div>
              <div>
                <Label htmlFor={`start-${idx}`}>Başlangıç</Label>
                <Input
                  id={`start-${idx}`}
                  type="time"
                  value={p.start}
                  onChange={(e) => update(idx, { start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor={`end-${idx}`}>Bitiş</Label>
                <Input
                  id={`end-${idx}`}
                  type="time"
                  value={p.end}
                  onChange={(e) => update(idx, { end: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeRow(idx)}
                  aria-label={`${idx + 1}. dersi sil`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Henüz ders eklenmedi. Başlamak için "Ders Ekle" butonuna tıklayın.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
