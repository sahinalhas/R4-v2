import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EnhancedTextarea as Textarea } from "@/components/ui/enhanced-textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SurveyTemplateForm } from "../types";
import { useState } from "react";

interface BasicInfoFormProps {
  control: Control<SurveyTemplateForm>;
}

const GRADE_OPTIONS = [
  "9. Sınıf",
  "10. Sınıf",
  "11. Sınıf",
  "12. Sınıf",
  "Tüm Sınıflar"
];

export function BasicInfoForm({ control }: BasicInfoFormProps) {
  const [newTag, setNewTag] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anket Başlığı</FormLabel>
              <FormControl>
                <Input placeholder="Örn: Öğrenci Memnuniyet Anketi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anket Türü</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Anket türünü seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MEB_STANDAR">MEB Standart</SelectItem>
                  <SelectItem value="OZEL">Özel</SelectItem>
                  <SelectItem value="AKADEMIK">Akademik</SelectItem>
                  <SelectItem value="SOSYAL">Sosyal</SelectItem>
                  <SelectItem value="REHBERLIK">Rehberlik</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Açıklama</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Anketin amacını ve kapsamını açıklayın..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="estimatedDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tahmini Süre (dakika)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  max="180"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="mebCompliant"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>MEB Uyumlu</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="targetGrades"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hedef Sınıflar</FormLabel>
            <Select 
              onValueChange={(value) => {
                const currentGrades = field.value || [];
                if (!currentGrades.includes(value)) {
                  field.onChange([...currentGrades, value]);
                }
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sınıf seçin" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {GRADE_OPTIONS.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.value && field.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((grade) => (
                  <Badge key={grade} variant="secondary" className="gap-1">
                    {grade}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => {
                        field.onChange(field.value?.filter((g) => g !== grade));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Etiketler</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Etiket ekle..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newTag.trim()) {
                      const currentTags = field.value || [];
                      if (!currentTags.includes(newTag.trim())) {
                        field.onChange([...currentTags, newTag.trim()]);
                      }
                      setNewTag("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newTag.trim()) {
                    const currentTags = field.value || [];
                    if (!currentTags.includes(newTag.trim())) {
                      field.onChange([...currentTags, newTag.trim()]);
                    }
                    setNewTag("");
                  }
                }}
              >
                Ekle
              </Button>
            </div>
            {field.value && field.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => {
                        field.onChange(field.value?.filter((t) => t !== tag));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
