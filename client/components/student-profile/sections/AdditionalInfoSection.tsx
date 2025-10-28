
/**
 * Additional Info Section
 * Kimlik sekmesinden taşınan ek bilgiler:
 * - Dil Becerileri (Akademik → Performans'a da eklenmeli)
 * - Hobiler & İlgi Alanları (Gelişim → Yetenekler'e taşındı)
 * - Okul Dışı Aktiviteler (Gelişim → Yetenekler'e taşındı)
 * - Beklentiler & Hedefler (Kariyer → Hedefler'e taşındı)
 */

import { useEffect } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/students.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Info, Users, Briefcase } from "lucide-react";

const additionalInfoSchema = z.object({
  anneMeslek: z.string().optional(),
  babaMeslek: z.string().optional(),
  kardesSayisi: z.number().optional(),
  notlar: z.string().optional(),
});

type AdditionalInfoFormValues = z.infer<typeof additionalInfoSchema>;

interface AdditionalInfoSectionProps {
  student: Student;
  onUpdate: () => void;
}

export default function AdditionalInfoSection({ student, onUpdate }: AdditionalInfoSectionProps) {
  const form = useForm<AdditionalInfoFormValues>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      anneMeslek: (student as any).anneMeslegi || "",
      babaMeslek: (student as any).babaMeslegi || "",
      kardesSayisi: (student as any).kardesSayisi,
      notlar: student.notlar || "",
    },
  });

  useEffect(() => {
    form.reset({
      anneMeslek: (student as any).anneMeslegi || "",
      babaMeslek: (student as any).babaMeslegi || "",
      kardesSayisi: (student as any).kardesSayisi,
      notlar: student.notlar || "",
    });
  }, [student, form]);

  const onSubmit = async (data: AdditionalInfoFormValues) => {
    try {
      const updatedStudent: Student = {
        ...student,
        anneMeslegi: data.anneMeslek,
        babaMeslegi: data.babaMeslek,
        kardesSayisi: typeof data.kardesSayisi === "number" ? data.kardesSayisi : undefined,
        notlar: data.notlar,
      } as any;

      await upsertStudent(updatedStudent);
      toast.success("Ek bilgiler kaydedildi");
      onUpdate();
    } catch (error) {
      toast.error("Kayıt sırasında hata oluştu");
      console.error("Error saving additional info:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Aile Bilgileri */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Aile Bilgileri
            </CardTitle>
            <CardDescription>
              Anne/baba meslek ve kardeş sayısı bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="anneMeslek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      Anne Mesleği
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Anne mesleği" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="babaMeslek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      Baba Mesleği
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Baba mesleği" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="kardesSayisi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Kardeş Sayısı
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="h-10 w-32" 
                      placeholder="Örn: 2" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Genel Notlar */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              Genel Notlar
            </CardTitle>
            <CardDescription>
              Öğrenci hakkında önemli notlar ve gözlemler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notlar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="min-h-[100px]"
                      placeholder="Öğrenci hakkında genel notlar, özel durumlar, dikkat edilmesi gerekenler..."
                    />
                  </FormControl>
                  <FormDescription>
                    Bu notlar tüm profil görünümlerinde erişilebilir
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="min-w-[200px]">
            Kaydet
          </Button>
        </div>
      </form>
    </Form>
  );
}
