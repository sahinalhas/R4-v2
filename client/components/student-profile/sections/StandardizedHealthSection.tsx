import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedTextarea as Textarea } from "@/components/ui/enhanced-textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { Activity } from "lucide-react";
import { 
  BLOOD_TYPES,
  CHRONIC_DISEASES,
  ALLERGIES,
  MEDICATION_TYPES
} from "@shared/constants/student-profile-taxonomy";
import { useStandardizedProfileSection } from "@/hooks/useStandardizedProfileSection";

const healthProfileSchema = z.object({
  bloodType: z.string().optional(),
  chronicDiseases: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  currentMedications: z.array(z.string()).default([]),
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Standartlaştırılmış Sağlık Profili
        </CardTitle>
        <CardDescription>
          Kategorize edilmiş sağlık bilgileri ve tıbbi öykü
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Temel Sağlık Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kan Grubu</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kan grubunu seçin" />
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
                  name="lastHealthCheckup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Son Sağlık Kontrolü</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="chronicDiseases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kronik Hastalıklar</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={CHRONIC_DISEASES}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Kronik hastalıkları seçin"
                        groupByCategory
                      />
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
                      <MultiSelect
                        options={ALLERGIES}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Alerjileri seçin"
                        groupByCategory
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentMedications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanılan İlaçlar</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={MEDICATION_TYPES}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="İlaçları seçin"
                        groupByCategory
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Tıbbi Öykü ve Özel Durumlar
              </h3>

              <FormField
                control={form.control}
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tıbbi Geçmiş</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Geçmiş ameliyatlar, önemli hastalıklar vb..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="specialNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Özel İhtiyaçlar</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Özel bakım gereksinimleri..." 
                          className="min-h-[60px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="physicalLimitations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiziksel Kısıtlamalar</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Hareket kısıtlamaları, fiziksel engeller..." 
                          className="min-h-[60px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Acil Durum Kişileri
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact1Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1. Kişi Adı</FormLabel>
                        <FormControl>
                          <Input placeholder="Ad Soyad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact1Phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1. Kişi Telefon</FormLabel>
                        <FormControl>
                          <Input placeholder="0555 123 45 67" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact1Relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>1. Kişi Yakınlık</FormLabel>
                        <FormControl>
                          <Input placeholder="Anne, Baba, Kardeş vb." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact2Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>2. Kişi Adı</FormLabel>
                        <FormControl>
                          <Input placeholder="Ad Soyad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact2Phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>2. Kişi Telefon</FormLabel>
                        <FormControl>
                          <Input placeholder="0555 123 45 67" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact2Relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>2. Kişi Yakınlık</FormLabel>
                        <FormControl>
                          <Input placeholder="Anne, Baba, Kardeş vb." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Doktor Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="physicianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aile Hekimi Adı</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Ad Soyad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="physicianPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aile Hekimi Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="0555 123 45 67" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ek Notlar</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Sağlık durumu hakkında ek bilgiler..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
