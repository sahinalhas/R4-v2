import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { Target, Users } from "lucide-react";
import { useStandardizedProfileSection } from "@/hooks/use-standardized-profile-section";

const hedeflerPlanlamaSchema = z.object({
  assessmentDate: z.string(),
  studentExpectations: z.string().optional(),
  familyExpectations: z.string().optional(),
  shortTermGoals: z.string().optional(),
  longTermGoals: z.string().optional(),
  careerInterests: z.string().optional(),
  universityPreferences: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type HedeflerPlanlamaFormValues = z.infer<typeof hedeflerPlanlamaSchema>;

interface HedeflerPlanlamaSectionProps {
  studentId: string;
  onUpdate: () => void;
}

export default function HedeflerPlanlamaSection({ 
  studentId, 
  onUpdate 
}: HedeflerPlanlamaSectionProps) {
  const form = useForm<HedeflerPlanlamaFormValues>({
    resolver: zodResolver(hedeflerPlanlamaSchema),
    defaultValues: {
      assessmentDate: new Date().toISOString().slice(0, 10),
      studentExpectations: "",
      familyExpectations: "",
      shortTermGoals: "",
      longTermGoals: "",
      careerInterests: "",
      universityPreferences: "",
      additionalNotes: "",
    },
  });

  const { isSubmitting, onSubmit } = useStandardizedProfileSection({
    studentId,
    sectionName: 'Hedefler ve planlama',
    apiEndpoint: 'goals-planning',
    form,
    defaultValues: form.getValues(),
    onUpdate,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Hedefler ve Gelecek Planlaması
        </CardTitle>
        <CardDescription>
          Öğrenci ve aile beklentileri, hedefler ve kariyer planları
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="assessmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Değerlendirme Tarihi</FormLabel>
                  <FormControl>
                    <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5" />
                <h3>Öğrenci Beklentileri ve Hedefleri</h3>
              </div>

              <FormField
                control={form.control}
                name="studentExpectations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Öğrenci Beklentileri</FormLabel>
                    <FormControl>
                      <EnhancedTextarea 
                        {...field} 
                        rows={4} 
                        aiContext="counseling"
                        placeholder="Öğrencinin okuldan, eğitimden ve gelecekten beklentileri..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortTermGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kısa Vadeli Hedefler</FormLabel>
                    <FormControl>
                      <EnhancedTextarea 
                        {...field} 
                        rows={3} 
                        aiContext="counseling"
                        placeholder="Bu dönem veya yıl içindeki hedefler..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longTermGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uzun Vadeli Hedefler</FormLabel>
                    <FormControl>
                      <EnhancedTextarea 
                        {...field} 
                        rows={3} 
                        aiContext="counseling"
                        placeholder="Mezuniyet sonrası ve gelecek hedefler..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5" />
                <h3>Aile Beklentileri</h3>
              </div>

              <FormField
                control={form.control}
                name="familyExpectations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aile Beklentileri</FormLabel>
                    <FormControl>
                      <EnhancedTextarea 
                        {...field} 
                        rows={4} 
                        aiContext="counseling"
                        placeholder="Ailenin öğrencinin eğitimi ve geleceği hakkındaki beklentileri..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5" />
                <h3>Kariyer ve Üniversite Planlaması</h3>
              </div>

              <FormField
                control={form.control}
                name="careerInterests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kariyer İlgi Alanları</FormLabel>
                    <FormControl>
                      <EnhancedTextarea 
                        {...field} 
                        rows={3} 
                        aiContext="counseling"
                        placeholder="İlgilendiği meslekler, sektörler..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="universityPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Üniversite Tercihleri</FormLabel>
                    <FormControl>
                      <EnhancedTextarea 
                        {...field} 
                        rows={3} 
                        aiContext="counseling"
                        placeholder="Hedeflediği üniversiteler, bölümler..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ek Notlar</FormLabel>
                  <FormControl>
                    <EnhancedTextarea 
                      {...field} 
                      rows={3} 
                      aiContext="counseling"
                      placeholder="Diğer önemli notlar..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
