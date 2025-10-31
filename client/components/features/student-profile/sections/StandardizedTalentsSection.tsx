import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { MultiSelect } from "@/components/molecules/MultiSelect";
import { TagInput } from "@/components/molecules/TagInput";
import { Sparkles, Palette, Trophy, Heart, Users, Calendar, Clock } from "lucide-react";
import {
  CREATIVE_TALENTS,
  PHYSICAL_TALENTS,
  INTEREST_AREAS
} from "@shared/constants/student-profile-taxonomy";
import { useStandardizedProfileSection } from "@/hooks/state/standardized-profile-section.state";
import { Textarea } from "@/components/atoms/Textarea";

const talentsInterestsSchema = z.object({
  assessmentDate: z.string(),
  creativeTalents: z.array(z.string()),
  physicalTalents: z.array(z.string()),
  primaryInterests: z.array(z.string()),
  exploratoryInterests: z.array(z.string()),
  weeklyEngagementHours: z.number().min(0),
  clubMemberships: z.array(z.string()),
  competitionsParticipated: z.array(z.string()),
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
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Standartlaştırılmış Yetenek & İlgi Profili</CardTitle>
            <CardDescription className="text-xs">Kategorize yetenekler ve ilgi alanları</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Değerlendirme Tarihi */}
            <FormField
              control={form.control}
              name="assessmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Değerlendirme Tarihi
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Yetenekler */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Palette className="h-3.5 w-3.5" />
                <span>Yetenekler</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="creativeTalents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">🎨 Yaratıcı & Sanatsal</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={CREATIVE_TALENTS}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Seçiniz (opsiyonel)"
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
                      <FormLabel className="text-xs font-medium">⚽ Fiziksel & Sportif</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={PHYSICAL_TALENTS}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Seçiniz (opsiyonel)"
                          groupByCategory
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* İlgi Alanları */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                <span>İlgi Alanları</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="primaryInterests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">🎯 Ana İlgi Alanları</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={INTEREST_AREAS}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Seçiniz (opsiyonel)"
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
                      <FormLabel className="text-xs font-medium">🔍 Keşfedilen/Gelişen İlgiler</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={INTEREST_AREAS}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Seçiniz (opsiyonel)"
                          groupByCategory
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Aktiviteler ve Katılım */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>Aktiviteler & Katılım</span>
              </div>

              <FormField
                control={form.control}
                name="weeklyEngagementHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Haftalık Katılım Saati
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="hobbiesDetailed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Hobiler</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Düzenli aktiviteler, hobiler..."
                          className="min-h-[70px] text-sm"
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
                      <FormLabel className="text-xs font-medium">Okul Dışı Aktiviteler</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Kurslar, spor, gönüllülük..."
                          className="min-h-[70px] text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Kulüpler ve Yarışmalar */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Trophy className="h-3.5 w-3.5" />
                <span>Kulüpler & Yarışmalar</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="clubMemberships"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Kulüp Üyelikleri</FormLabel>
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
                      <FormLabel className="text-xs font-medium">Yarışmalar/Turnuvalar</FormLabel>
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
              </div>
            </div>

            {/* Ek Notlar */}
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem className="pt-3 border-t">
                  <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Ek Notlar
                  </FormLabel>
                  <FormControl>
                    <EnhancedTextarea {...field} rows={3} aiContext="notes" className="text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full h-10">
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
