import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { TagInput } from "@/components/ui/tag-input";
import { Sparkles } from "lucide-react";
import {
  CREATIVE_TALENTS,
  PHYSICAL_TALENTS,
  INTEREST_AREAS
} from "@shared/constants/student-profile-taxonomy";
import { useStandardizedProfileSection } from "@/hooks/useStandardizedProfileSection";
import { Textarea } from "@/components/ui/textarea";


const talentsInterestsSchema = z.object({
  assessmentDate: z.string(),
  creativeTalents: z.array(z.string()).default([]),
  physicalTalents: z.array(z.string()).default([]),
  primaryInterests: z.array(z.string()).default([]),
  exploratoryInterests: z.array(z.string()).default([]),
  weeklyEngagementHours: z.number().min(0).default(0),
  clubMemberships: z.array(z.string()).default([]),
  competitionsParticipated: z.array(z.string()).default([]),
  additionalNotes: z.string().optional(),
  hobbiesDetailed: z.string().optional(),
  extracurricularActivities: z.string().optional(),
});

type TalentsInterestsFormValues = z.infer<typeof talentsInterestsSchema>;

interface StandardizedTalentsSectionProps {
  studentId: string;
  talentsData?: any;
  onUpdate: () => void;
}

export default function StandardizedTalentsSection({
  studentId,
  talentsData,
  onUpdate
}: StandardizedTalentsSectionProps) {
  const form = useForm<TalentsInterestsFormValues>({
    resolver: zodResolver(talentsInterestsSchema),
    defaultValues: {
      assessmentDate: new Date().toISOString().slice(0, 10),
      creativeTalents: [],
      physicalTalents: [],
      primaryInterests: [],
      exploratoryInterests: [],
      weeklyEngagementHours: 0,
      clubMemberships: [],
      competitionsParticipated: [],
      additionalNotes: "",
      hobbiesDetailed: "",
      extracurricularActivities: "",
    },
  });

  const { isSubmitting, onSubmit } = useStandardizedProfileSection({
    studentId,
    sectionName: 'Yetenek ve ilgi alanları',
    apiEndpoint: 'talents-interests',
    form,
    defaultValues: form.getValues(),
    onUpdate,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Standartlaştırılmış Yetenek & İlgi Profili
        </CardTitle>
        <CardDescription>
          Kategorize edilmiş yetenekler ve ilgi alanları
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="creativeTalents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yaratıcı & Sanatsal Yetenekler</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={CREATIVE_TALENTS}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Yaratıcı yeteneklerini seçiniz..."
                      groupByCategory
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physicalTalents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiziksel & Sportif Yetenekler</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={PHYSICAL_TALENTS}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Sportif yeteneklerini seçiniz..."
                      groupByCategory
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryInterests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ana İlgi Alanları</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={INTEREST_AREAS}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Ana ilgi alanlarını seçiniz..."
                      groupByCategory
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exploratoryInterests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keşfedilen/Gelişen İlgi Alanları</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={INTEREST_AREAS}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Yeni ilgi alanlarını seçiniz..."
                      groupByCategory
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weeklyEngagementHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Haftalık Katılım Saati</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hobbiesDetailed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hobiler (Detaylı)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Öğrencinin düzenli yaptığı aktiviteler, hobiler..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="extracurricularActivities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Okul Dışı Aktiviteler</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Kurslar, spor kulübü, gönüllü çalışmalar..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clubMemberships"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kulüp Üyelikleri</FormLabel>
                  <FormControl>
                    <TagInput
                      tags={field.value}
                      onChange={field.onChange}
                      placeholder="Kulüp adı ekle..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competitionsParticipated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Katıldığı Yarışmalar/Turnuvalar</FormLabel>
                  <FormControl>
                    <TagInput
                      tags={field.value}
                      onChange={field.onChange}
                      placeholder="Yarışma adı ekle..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ek Notlar</FormLabel>
                  <FormControl>
                    <EnhancedTextarea {...field} rows={3} aiContext="notes" />
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