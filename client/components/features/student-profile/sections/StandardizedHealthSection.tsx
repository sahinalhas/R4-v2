
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
import { Activity, Droplet, AlertCircle, Phone, Stethoscope, Calendar } from "lucide-react";
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
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-red-600" />
          <div>
            <CardTitle className="text-base">Sağlık Profili</CardTitle>
            <CardDescription className="text-xs">Tıbbi bilgiler ve acil iletişim</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Temel Bilgiler */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground border-b pb-1">
                <Droplet className="h-3 w-3" />
                <span>Temel Bilgiler</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Kan Grubu</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BLOOD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="text-xs">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastHealthCheckup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Son Kontrol</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chronicDiseases"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs">Kronik Hastalıklar</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={CHRONIC_DISEASES}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Seçiniz"
                          groupByCategory
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Alerjiler</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={ALLERGIES}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Seçiniz"
                          groupByCategory
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentMedications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">İlaçlar</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={MEDICATION_TYPES}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Seçiniz"
                          groupByCategory
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Tıbbi Geçmiş</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ameliyatlar, hastalıklar..." 
                          className="min-h-[60px] text-xs resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Özel İhtiyaçlar</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Özel bakım..." 
                          className="min-h-[60px] text-xs resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="physicalLimitations"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs">Fiziksel Kısıtlamalar</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Hareket kısıtlamaları..." 
                          className="min-h-[60px] text-xs resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Acil Kişiler */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground border-b pb-1">
                <Phone className="h-3 w-3" />
                <span>Acil İletişim</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="emergencyContact1Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">1. Kişi</FormLabel>
                      <FormControl>
                        <Input placeholder="Ad Soyad" {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact1Phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="0555 123 45 67" {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact1Relation"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs">Yakınlık</FormLabel>
                      <FormControl>
                        <Input placeholder="Anne, Baba vb." {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact2Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">2. Kişi</FormLabel>
                      <FormControl>
                        <Input placeholder="Ad Soyad" {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact2Phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="0555 123 45 67" {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact2Relation"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs">Yakınlık</FormLabel>
                      <FormControl>
                        <Input placeholder="Anne, Baba vb." {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Hekim Bilgileri */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground border-b pb-1">
                <Stethoscope className="h-3 w-3" />
                <span>Aile Hekimi</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="physicianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Hekim Adı</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Ad Soyad" {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="physicianPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="0555 123 45 67" {...field} className="h-8 text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs">Ek Notlar</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Diğer önemli bilgiler..." 
                          className="min-h-[50px] text-xs resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-9 text-sm">
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
