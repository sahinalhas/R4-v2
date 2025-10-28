/**
 * Unified Identity Section
 * Temel kimlik bilgileri, veli iletişim, adres bilgileri
 * NOT: Acil iletişim bilgileri Health Section'a taşındı
 * NOT: Risk bilgisi manuel değil, otomatik hesaplanıyor
 */

import { useEffect } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/students.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Users,
  Calendar,
  Hash,
  UserCheck,
  Tag,
  Home,
  Map,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const unifiedIdentitySchema = z.object({
  ad: z.string().min(1, "Ad zorunludur"),
  soyad: z.string().min(1, "Soyad zorunludur"),
  tcKimlikNo: z.string().optional(),
  okulNo: z.string().optional(),
  class: z.string().optional(),
  cinsiyet: z.enum(["K", "E"]).optional(),
  dogumTarihi: z.string().optional(),
  dogumYeri: z.string().optional(),
  telefon: z.string().optional(),
  eposta: z.string().email("Geçerli bir e-posta giriniz").optional().or(z.literal("")),
  il: z.string().optional(),
  ilce: z.string().optional(),
  adres: z.string().optional(),
  veliAdi: z.string().optional(),
  veliTelefon: z.string().optional(),
  veliEposta: z.string().email("Geçerli bir e-posta giriniz").optional().or(z.literal("")),
  veliMeslek: z.string().optional(),
  veliEgitimDurumu: z.string().optional(),
  ikinciVeliAdi: z.string().optional(),
  ikinciVeliTelefon: z.string().optional(),
  ikinciVeliYakinlik: z.string().optional(),
  kardesSayisi: z.number().optional(),
  rehberOgretmen: z.string().optional(),
  etiketler: z.string().optional(),
  anneMeslek: z.string().optional(),
  babaMeslek: z.string().optional(),
});

type UnifiedIdentityFormValues = z.infer<typeof unifiedIdentitySchema>;

interface UnifiedIdentitySectionProps {
  student: Student;
  onUpdate: () => void;
}

export default function UnifiedIdentitySection({ student, onUpdate }: UnifiedIdentitySectionProps) {
  const form = useForm<UnifiedIdentityFormValues>({
    resolver: zodResolver(unifiedIdentitySchema),
    defaultValues: {
      ad: student.ad || "",
      soyad: student.soyad || "",
      tcKimlikNo: (student as any).tcKimlikNo || "",
      okulNo: student.okulNo || "",
      class: student.class || "",
      cinsiyet: student.cinsiyet,
      dogumTarihi: student.dogumTarihi || "",
      dogumYeri: (student as any).dogumYeri || "",
      telefon: student.telefon || "",
      eposta: student.eposta || "",
      il: student.il || "",
      ilce: student.ilce || "",
      adres: student.adres || "",
      veliAdi: student.veliAdi || "",
      veliTelefon: student.veliTelefon || "",
      veliEposta: (student as any).veliEposta || "",
      veliMeslek: (student as any).veliMeslek || "",
      veliEgitimDurumu: (student as any).veliEgitimDurumu || "",
      ikinciVeliAdi: (student as any).ikinciVeliAdi || "",
      ikinciVeliTelefon: (student as any).ikinciVeliTelefon || "",
      ikinciVeliYakinlik: (student as any).ikinciVeliYakinlik || "",
      kardesSayisi: (student as any).kardesSayisi,
      rehberOgretmen: student.rehberOgretmen || "",
      etiketler: (student.etiketler || []).join(", "),
      anneMeslek: (student as any).anneMeslegi || "",
      babaMeslek: (student as any).babaMeslegi || "",
    },
  });

  useEffect(() => {
    form.reset({
      ad: student.ad || "",
      soyad: student.soyad || "",
      tcKimlikNo: (student as any).tcKimlikNo || "",
      okulNo: student.okulNo || "",
      class: student.class || "",
      cinsiyet: student.cinsiyet,
      dogumTarihi: student.dogumTarihi || "",
      dogumYeri: (student as any).dogumYeri || "",
      telefon: student.telefon || "",
      eposta: student.eposta || "",
      il: student.il || "",
      ilce: student.ilce || "",
      adres: student.adres || "",
      veliAdi: student.veliAdi || "",
      veliTelefon: student.veliTelefon || "",
      veliEposta: (student as any).veliEposta || "",
      veliMeslek: (student as any).veliMeslek || "",
      veliEgitimDurumu: (student as any).veliEgitimDurumu || "",
      ikinciVeliAdi: (student as any).ikinciVeliAdi || "",
      ikinciVeliTelefon: (student as any).ikinciVeliTelefon || "",
      ikinciVeliYakinlik: (student as any).ikinciVeliYakinlik || "",
      kardesSayisi: (student as any).kardesSayisi,
      rehberOgretmen: student.rehberOgretmen || "",
      etiketler: (student.etiketler || []).join(", "),
      anneMeslek: (student as any).anneMeslegi || "",
      babaMeslek: (student as any).babaMeslegi || "",
    });
  }, [student, form]);

  const onSubmit = async (data: UnifiedIdentityFormValues) => {
    try {
      const updatedStudent: Student = {
        ...student,
        ...data,
        etiketler: data.etiketler
          ? data.etiketler.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        kardesSayisi: typeof data.kardesSayisi === "number" ? data.kardesSayisi : undefined,
      };

      await upsertStudent(updatedStudent);
      toast.success("Öğrenci bilgileri kaydedildi");
      onUpdate();
    } catch (error) {
      toast.error("Kayıt sırasında hata oluştu");
      console.error("Error saving student:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Temel Kimlik Bilgileri */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Temel Kimlik Bilgileri
            </CardTitle>
            <CardDescription>
              Öğrencinin temel tanımlayıcı bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="ad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Ad *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Öğrenci adı" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soyad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Soyad *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Öğrenci soyadı" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tcKimlikNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      TC Kimlik No
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="11 haneli TC kimlik no" maxLength={11} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="okulNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      Okul Numarası
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Örn: 1001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Sınıf
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Örn: 9/A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cinsiyet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cinsiyet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="K">Kız</SelectItem>
                        <SelectItem value="E">Erkek</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dogumTarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Doğum Tarihi
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dogumYeri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Doğum Yeri
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="İl/İlçe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* İletişim Bilgileri */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-primary" />
              İletişim Bilgileri
            </CardTitle>
            <CardDescription>
              Öğrenciye ulaşmak için gerekli bilgiler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      Telefon
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="h-10" placeholder="+90 5XX XXX XX XX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eposta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      E-posta
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="h-10" placeholder="ornek@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Adres Bilgileri */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Adres Bilgileri
            </CardTitle>
            <CardDescription>
              Ev adresi ve konum bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="il"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      İl
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Örn: İstanbul" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ilce"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5" />
                      İlçe
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Örn: Kadıköy" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="adres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açık Adres</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10" placeholder="Mahalle, sokak, bina no, daire..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Veli Bilgileri */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Aile Bilgileri
            </CardTitle>
            <CardDescription>
              Birincil veli ve aile yapısı bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Birincil Veli (Anne/Baba)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="veliAdi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Veli Adı Soyadı
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="Anne/baba adı soyadı" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="veliTelefon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        Veli Telefon
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" className="h-10" placeholder="+90 5XX XXX XX XX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="veliEposta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        Veli E-posta
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="h-10" placeholder="ornek@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="veliMeslek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Meslek
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="Meslek" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="veliEgitimDurumu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eğitim Durumu</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="İlkokul">İlkokul</SelectItem>
                          <SelectItem value="Ortaokul">Ortaokul</SelectItem>
                          <SelectItem value="Lise">Lise</SelectItem>
                          <SelectItem value="Ön Lisans">Ön Lisans</SelectItem>
                          <SelectItem value="Lisans">Lisans</SelectItem>
                          <SelectItem value="Yüksek Lisans">Yüksek Lisans</SelectItem>
                          <SelectItem value="Doktora">Doktora</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">İkinci Veli / Acil Durum İletişim</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="ikinciVeliAdi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Adı Soyadı
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="İkinci veli/acil kişi" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ikinciVeliTelefon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        Telefon
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" className="h-10" placeholder="+90 5XX XXX XX XX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ikinciVeliYakinlik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yakınlık Derecesi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Anne">Anne</SelectItem>
                          <SelectItem value="Baba">Baba</SelectItem>
                          <SelectItem value="Büyükanne">Büyükanne</SelectItem>
                          <SelectItem value="Büyükbaba">Büyükbaba</SelectItem>
                          <SelectItem value="Teyze/Hala">Teyze/Hala</SelectItem>
                          <SelectItem value="Amca/Dayı">Amca/Dayı</SelectItem>
                          <SelectItem value="Diğer">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Aile Yapısı</h3>
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
                        placeholder="0"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sistem Bilgileri */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5 text-primary" />
              Sistem Bilgileri
            </CardTitle>
            <CardDescription>
              Rehberlik ve etiketleme bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="rehberOgretmen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5" />
                    Rehber Öğretmen
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10" placeholder="Sorumlu rehber öğretmen" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="etiketler"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Etiketler
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10" placeholder="Virgülle ayırarak etiket ekleyin (örn: takdir, lider, spor)" />
                  </FormControl>
                  <FormDescription>
                    Virgülle ayırarak birden fazla etiket ekleyebilirsiniz
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