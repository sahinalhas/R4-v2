import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { MultiSelect } from "@/components/molecules/MultiSelect";
import { Activity, Droplet, AlertCircle, Phone, Stethoscope, Calendar, FileText } from "lucide-react";
import { 
  BLOOD_TYPES,
  CHRONIC_DISEASES,
  ALLERGIES,
  MEDICATION_TYPES
} from "@shared/constants/student-profile-taxonomy";
import { useStandardizedProfileSection } from "@/hooks/state/standardized-profile-section.state";

const healthProfileSchema = z.object({
  bloodType: z.string().optional(),
  chronicDiseases: z.array(z.string()),
  allergies: z.array(z.string()),
  currentMedications: z.array(z.string()),
  medicalHistory: z.string().optional(),
  specialNeeds: z.string().optional(),
  physicalLimitations: z.string().optional(),
  emergencyContact1Name: z.string().optional(),
  emergencyContact1Phone: z.string().optional(),
  emergencyContact1Relation: z.string().optional(),
  emergencyContact2Name: z.string().optional(),
  emergencyContact2Phone: z.string().optional(),
  emergencyContact2Relation: z.string().optional(),
  physicianName: z.string().optional(),
  physicianPhone: z.string().optional(),
  lastHealthCheckup: z.string().optional(),
  additionalNotes: z.string().optional(),
  // Added fields based on changes
  bloodGroup: z.string().optional(),
  lastHealthCheck: z.string().optional(),
  usedMedications: z.array(z.string()),
  pastSurgeries: z.string().optional(),
  specialNeedsDescription: z.string().optional(),
  physicalDisabilities: z.string().optional(),
  familyDoctorName: z.string().optional(),
  familyDoctorPhone: z.string().optional(),
  healthNotes: z.string().optional(),
});

type HealthProfileFormValues = z.infer<typeof healthProfileSchema>;

interface StandardizedHealthSectionProps {
  studentId: string;
  healthData?: any;
  onUpdate: () => void;
}

export default function StandardizedHealthSection({ 
  studentId, 
  healthData,
  onUpdate 
}: StandardizedHealthSectionProps) {
  const form = useForm<HealthProfileFormValues>({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: {
      bloodType: "",
      chronicDiseases: [],
      allergies: [],
      currentMedications: [],
      medicalHistory: "",
      specialNeeds: "",
      physicalLimitations: "",
      emergencyContact1Name: "",
      emergencyContact1Phone: "",
      emergencyContact1Relation: "",
      emergencyContact2Name: "",
      emergencyContact2Phone: "",
      emergencyContact2Relation: "",
      physicianName: "",
      physicianPhone: "",
      lastHealthCheckup: "",
      additionalNotes: "",
      // Added fields based on changes
      bloodGroup: "",
      lastHealthCheck: "",
      usedMedications: [],
      pastSurgeries: "",
      specialNeedsDescription: "",
      physicalDisabilities: "",
      familyDoctorName: "",
      familyDoctorPhone: "",
      healthNotes: "",
    },
  });

  const { isSubmitting, onSubmit } = useStandardizedProfileSection({
    studentId,
    sectionName: 'Sağlık profili',
    apiEndpoint: 'health',
    form,
    defaultValues: form.getValues(),
    onUpdate,
  });

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
            <Activity className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Standartlaştırılmış Sağlık Profili</CardTitle>
            <CardDescription className="text-xs">Kategorize sağlık ve tıbbi bilgiler</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Temel Sağlık Bilgileri */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Droplet className="h-3.5 w-3.5" />
                <span>Temel Bilgiler</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kan Grubu</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seçiniz (opsiyonel)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BLOOD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastHealthCheck"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Son Sağlık Kontrolü</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-10" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chronicDiseases"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hastalık Adı</FormLabel>
                      <FormControl>
                        <Input className="h-10" placeholder="Örn: Astım, Diyabet..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alerjiler</FormLabel>
                      <FormControl>
                        <Input className="h-10" placeholder="Örn: Polen, Fıstık..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usedMedications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanılan İlaçlar</FormLabel>
                      <FormControl>
                        <Input className="h-10" placeholder="İlaç isimleri (opsiyonel)" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tıbbi Geçmiş */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                <FileText className="h-4 w-4 text-blue-500" />
                Tıbbi Geçmiş
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pastSurgeries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geçmiş Ameliyatlar</FormLabel>
                      <FormControl>
                        <Input className="h-10" placeholder="Ameliyat bilgileri..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialNeedsDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Özel İhtiyaçlar</FormLabel>
                      <FormControl>
                        <Input className="h-10" placeholder="Özel bakım..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="physicalDisabilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiziksel Engeller</FormLabel>
                      <FormControl>
                        <Input className="h-10" placeholder="Fiziksel durum..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Acil Durum Kişileri */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                <Phone className="h-4 w-4 text-green-500" />
                Acil Durum Kişileri
              </h3>
              {[1, 2].map((num) => (
                <div key={num} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20">
                  <FormField
                    control={form.control}
                    name={`emergencyContact${num}Name` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{num}. Kişi</FormLabel>
                        <FormControl>
                          <Input className="h-10" placeholder="Ad Soyad" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`emergencyContact${num}Phone` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input className="h-10" placeholder="0555 123 45 67" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`emergencyContact${num}Relation` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yakınlık</FormLabel>
                        <FormControl>
                          <Input className="h-10" placeholder="Anne, Baba vb." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Aile Hekimi & Ek Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                <Stethoscope className="h-4 w-4 text-purple-500" />
                Aile Hekimi & Ek Bilgiler
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="familyDoctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hekim Adı</FormLabel>
                      <FormControl>
                        <Input className="h-10" placeholder="Dr. Ad Soyad" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="familyDoctorPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hekim Telefon</FormLabel>
                      <FormControl>
                        <Input className="h-10" placeholder="0555 123 45 67" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Ek Notlar */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Ek Notlar
              </h3>
              <FormField
                control={form.control}
                name="healthNotes"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Ek Notlar</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        className="resize-none" 
                        placeholder="Sağlık durumu hakkında ek bilgiler..." 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full h-11 text-base">
                Kaydet
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}