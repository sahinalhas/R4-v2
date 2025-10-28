import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EnhancedTextarea as Textarea } from "@/components/ui/enhanced-textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit2, GripVertical } from "lucide-react";
import { SurveyTemplate, SurveyQuestion, SurveyQuestionType } from "@/lib/survey-types";
import { surveyService } from "@/services/surveyService";
import { useToast } from "@/hooks/use-toast";

const editSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  description: z.string().optional(),
  type: z.enum(["MEB_STANDAR", "OZEL", "AKADEMIK", "SOSYAL", "REHBERLIK"]),
  estimatedDuration: z.number().min(1, "Tahmini süre en az 1 dakika olmalıdır"),
  targetGrades: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  mebCompliant: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const questionSchema = z.object({
  questionText: z.string().min(1, "Soru metni gereklidir"),
  questionType: z.enum(["MULTIPLE_CHOICE", "OPEN_ENDED", "LIKERT", "YES_NO", "RATING", "DROPDOWN"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  orderIndex: z.number().default(0),
});

type EditForm = z.infer<typeof editSchema>;
type QuestionForm = z.infer<typeof questionSchema>;

interface SurveyTemplateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: SurveyTemplate;
  onEditComplete?: () => void;
}

const GRADE_OPTIONS = [
  "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf",
  "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"
];

const QUESTION_TYPES: { value: SurveyQuestionType; label: string }[] = [
  { value: "MULTIPLE_CHOICE", label: "Çoktan Seçmeli" },
  { value: "LIKERT", label: "Likert Ölçeği" },
  { value: "OPEN_ENDED", label: "Açık Uçlu" },
  { value: "RATING", label: "Puanlama" },
  { value: "YES_NO", label: "Evet/Hayır" },
  { value: "DROPDOWN", label: "Açılır Liste" },
];

export default function SurveyTemplateEditDialog({
  open,
  onOpenChange,
  template,
  onEditComplete
}: SurveyTemplateEditDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: template.title,
      description: template.description || "",
      type: template.type,
      estimatedDuration: template.estimatedDuration,
      targetGrades: template.targetGrades || [],
      tags: template.tags || [],
      mebCompliant: template.mebCompliant || false,
      isActive: template.isActive,
    },
  });

  const questionForm = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: "",
      questionType: "MULTIPLE_CHOICE",
      options: [],
      required: true,
      orderIndex: 0,
    },
  });

  useEffect(() => {
    if (open && template) {
      form.reset({
        title: template.title,
        description: template.description || "",
        type: template.type,
        estimatedDuration: template.estimatedDuration,
        targetGrades: template.targetGrades || [],
        tags: template.tags || [],
        mebCompliant: template.mebCompliant || false,
        isActive: template.isActive,
      });
      loadQuestions();
    }
  }, [open, template]);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const data = await surveyService.getTemplateQuestions(template.id);
      setQuestions(data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (error) {
      console.error("Error loading questions:", error);
      toast({
        title: "Hata",
        description: "Sorular yüklenemedi",
        variant: "destructive"
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const onSubmit = async (data: EditForm) => {
    try {
      await surveyService.updateTemplate(template.id, data);

      toast({
        title: "Başarılı",
        description: "Anket şablonu güncellendi"
      });

      if (onEditComplete) {
        onEditComplete();
      }
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Hata",
        description: "Anket şablonu güncellenemedi",
        variant: "destructive"
      });
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    questionForm.reset({
      questionText: "",
      questionType: "MULTIPLE_CHOICE",
      options: [],
      required: true,
      orderIndex: questions.length,
    });
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: SurveyQuestion) => {
    setEditingQuestion(question);
    questionForm.reset({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || [],
      required: question.required,
      orderIndex: question.orderIndex,
    });
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Bu soruyu silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await surveyService.deleteQuestion(questionId);
      await loadQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const onQuestionSubmit = async (data: QuestionForm) => {
    try {
      if (editingQuestion) {
        await surveyService.updateQuestion(editingQuestion.id, data);
      } else {
        await surveyService.createQuestion({
          ...data,
          templateId: template.id,
        });
      }

      await loadQuestions();
      setShowQuestionForm(false);
      setEditingQuestion(null);
      questionForm.reset();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const watchedQuestionType = questionForm.watch("questionType");
  const needsOptions = ["MULTIPLE_CHOICE", "LIKERT", "DROPDOWN"].includes(watchedQuestionType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anket Şablonunu Düzenle</DialogTitle>
          <DialogDescription>
            Anket şablonunun bilgilerini ve sorularını güncelleyin
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Temel Bilgiler</TabsTrigger>
            <TabsTrigger value="questions">
              Sorular ({questions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anket Başlığı</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Örn: Öğrenci Memnuniyet Anketi" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Anket açıklaması..." rows={3} />
                      </FormControl>
                      <FormDescription>
                        Anketin amacını ve kapsamını açıklayın
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anket Türü</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tür seçin" />
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

                  <FormField
                    control={form.control}
                    name="estimatedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahmini Süre (dakika)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="15"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="targetGrades"
                  render={() => (
                    <FormItem>
                      <FormLabel>Hedef Sınıflar</FormLabel>
                      <FormDescription>
                        Anketin uygulanacağı sınıfları seçin
                      </FormDescription>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {GRADE_OPTIONS.map((grade) => (
                          <FormField
                            key={grade}
                            control={form.control}
                            name="targetGrades"
                            render={({ field }) => (
                              <FormItem
                                className="flex items-center space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(grade)}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValues, grade]);
                                      } else {
                                        field.onChange(
                                          currentValues.filter((v) => v !== grade)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {grade}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mebCompliant"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">MEB Uyumlu</FormLabel>
                          <FormDescription>
                            MEB standartlarına uygun anket
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Aktif</FormLabel>
                          <FormDescription>
                            Şablon kullanıma açık
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    İptal
                  </Button>
                  <Button type="submit">
                    Bilgileri Güncelle
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Anket Soruları</h3>
                <p className="text-sm text-muted-foreground">
                  Soruları ekleyin, düzenleyin veya silin
                </p>
              </div>
              <Button onClick={handleAddQuestion} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Soru
              </Button>
            </div>

            {showQuestionForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingQuestion ? "Soruyu Düzenle" : "Yeni Soru Ekle"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...questionForm}>
                    <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
                      <FormField
                        control={questionForm.control}
                        name="questionText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soru Metni</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Sorunuzu buraya yazın..." rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={questionForm.control}
                          name="questionType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Soru Türü</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {QUESTION_TYPES.map((type) => (
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
                          control={questionForm.control}
                          name="required"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <FormLabel>Zorunlu Soru</FormLabel>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {needsOptions && (
                        <FormField
                          control={questionForm.control}
                          name="options"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Seçenekler</FormLabel>
                              <FormDescription>
                                Her seçeneği virgül ile ayırın
                              </FormDescription>
                              <FormControl>
                                <Textarea
                                  value={field.value?.join(", ") || ""}
                                  onChange={(e) => {
                                    const options = e.target.value
                                      .split(",")
                                      .map(opt => opt.trim())
                                      .filter(opt => opt.length > 0);
                                    field.onChange(options);
                                  }}
                                  placeholder="Ör: Kesinlikle Katılıyorum, Katılıyorum, Kararsızım, Katılmıyorum"
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowQuestionForm(false);
                            setEditingQuestion(null);
                            questionForm.reset();
                          }}
                        >
                          İptal
                        </Button>
                        <Button type="submit">
                          {editingQuestion ? "Güncelle" : "Ekle"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {loadingQuestions ? (
              <div className="text-center py-8 text-muted-foreground">
                Yükleniyor...
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Henüz soru eklenmemiş</p>
                <Button onClick={handleAddQuestion} variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Soruyu Ekle
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{index + 1}</Badge>
                                <Badge variant="secondary">
                                  {QUESTION_TYPES.find(t => t.value === question.questionType)?.label}
                                </Badge>
                                {question.required && (
                                  <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">{question.questionText}</p>
                              {question.options && question.options.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Seçenekler: {question.options.join(", ")}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditQuestion(question)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Kapat
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
