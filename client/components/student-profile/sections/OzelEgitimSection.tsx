import { useEffect } from "react";
import { SpecialEducation, addSpecialEducation } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const specialEducationSchema = z.object({
  hasIEP: z.boolean().default(false),
  iepStartDate: z.string().optional(),
  iepEndDate: z.string().optional(),
  iepGoals: z.string().optional(),
  diagnosis: z.string().optional(),
  ramReportDate: z.string().optional(),
  ramReportSummary: z.string().optional(),
  supportServices: z.string().optional(),
  accommodations: z.string().optional(),
  status: z.string().default("AKTİF"),
  nextReviewDate: z.string().optional(),
  notes: z.string().optional(),
});

type SpecialEducationFormValues = z.infer<typeof specialEducationSchema>;

interface OzelEgitimSectionProps {
  studentId: string;
  specialEducation: SpecialEducation[];
  onUpdate: () => void;
}

export default function OzelEgitimSection({ studentId, specialEducation, onUpdate }: OzelEgitimSectionProps) {
  const existingRecord = specialEducation && specialEducation.length > 0 ? specialEducation[0] : null;
  
  const form = useForm<SpecialEducationFormValues>({
    resolver: zodResolver(specialEducationSchema),
    defaultValues: {
      hasIEP: existingRecord?.hasIEP || false,
      iepStartDate: existingRecord?.iepStartDate || "",
      iepEndDate: existingRecord?.iepEndDate || "",
      iepGoals: existingRecord?.iepGoals || "",
      diagnosis: existingRecord?.diagnosis || "",
      ramReportDate: existingRecord?.ramReportDate || "",
      ramReportSummary: existingRecord?.ramReportSummary || "",
      supportServices: existingRecord?.supportServices || "",
      accommodations: existingRecord?.accommodations || "",
      status: existingRecord?.status || "AKTİF",
      nextReviewDate: existingRecord?.nextReviewDate || "",
      notes: existingRecord?.notes || "",
    },
  });

  // Form verilerini specialEducation prop'u değiştiğinde güncelle
  useEffect(() => {
    const record = specialEducation && specialEducation.length > 0 ? specialEducation[0] : null;
    form.reset({
      hasIEP: record?.hasIEP || false,
      iepStartDate: record?.iepStartDate || "",
      iepEndDate: record?.iepEndDate || "",
      iepGoals: record?.iepGoals || "",
      diagnosis: record?.diagnosis || "",
      ramReportDate: record?.ramReportDate || "",
      ramReportSummary: record?.ramReportSummary || "",
      supportServices: record?.supportServices || "",
      accommodations: record?.accommodations || "",
      status: record?.status || "AKTİF",
      nextReviewDate: record?.nextReviewDate || "",
      notes: record?.notes || "",
    });
  }, [specialEducation, form]);

  const onSubmit = async (data: SpecialEducationFormValues) => {
    try {
      const specialEd: SpecialEducation = {
        id: existingRecord?.id || crypto.randomUUID(),
        studentId,
        ...data,
      };
      
      await addSpecialEducation(specialEd);
      toast.success("BEP kaydı kaydedildi");
      onUpdate();
    } catch (error) {
      toast.error("Kayıt sırasında hata oluştu");
      console.error("Error saving special education:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Özel Eğitim - BEP Takibi</CardTitle>
        <CardDescription>Bireysel Eğitim Planı ve RAM raporları</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="hasIEP"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">BEP var</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="iepStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="date" placeholder="BEP Başlangıç" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="iepEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="date" placeholder="BEP Bitiş" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="iepGoals"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <EnhancedTextarea placeholder="BEP Hedefleri" rows={3} {...field} aiContext="notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <EnhancedTextarea placeholder="Tanı" rows={2} {...field} aiContext="notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="ramReportDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="date" placeholder="RAM Rapor Tarihi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Durum" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AKTİF">Aktif</SelectItem>
                        <SelectItem value="TAMAMLANDI">Tamamlandı</SelectItem>
                        <SelectItem value="İPTAL">İptal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="ramReportSummary"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <EnhancedTextarea placeholder="RAM Rapor Özeti" rows={2} {...field} aiContext="notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="supportServices"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <EnhancedTextarea placeholder="Destek Hizmetleri" rows={2} {...field} aiContext="notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accommodations"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <EnhancedTextarea placeholder="Uyarlamalar" rows={2} {...field} aiContext="notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nextReviewDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="date" placeholder="Sonraki Değerlendirme" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <EnhancedTextarea placeholder="Notlar" rows={2} {...field} aiContext="notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <FileText className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Kaydediliyor..." : existingRecord ? "BEP Kaydı Güncelle" : "BEP Kaydı Ekle"}
            </Button>
          </form>
        </Form>
        
        {existingRecord && (
          <div className="space-y-2 mt-4">
            <h4 className="font-medium">BEP Kaydı</h4>
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={existingRecord.hasIEP ? "default" : "secondary"}>
                  {existingRecord.hasIEP ? "BEP Var" : "BEP Yok"}
                </Badge>
                <Badge variant="outline">{existingRecord.status}</Badge>
              </div>
              {existingRecord.diagnosis && <div className="text-sm"><strong>Tanı:</strong> {existingRecord.diagnosis}</div>}
              {existingRecord.iepGoals && <div className="text-sm"><strong>Hedefler:</strong> {existingRecord.iepGoals}</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
