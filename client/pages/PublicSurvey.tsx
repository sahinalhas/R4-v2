import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { EnhancedTextarea as Textarea } from "@/components/ui/enhanced-textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  FileText, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Send
} from "lucide-react";
import { 
  SurveyDistribution, 
  SurveyTemplate, 
  SurveyQuestion, 
  SurveyQuestionType,
  StudentInfo 
} from "@/lib/survey-types";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/api-client";
import { SURVEY_ENDPOINTS } from "@/lib/constants/api-endpoints";

const surveyResponseSchema = z.object({
  studentInfo: z.object({
    name: z.string().optional(),
    class: z.string().optional(),
    number: z.string().optional(),
    studentId: z.string().optional(),
  }).optional(),
  responseData: z.record(z.any()),
});

type SurveyResponseForm = z.infer<typeof surveyResponseSchema>;

export default function PublicSurvey() {
  const { publicLink } = useParams<{ publicLink: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [distribution, setDistribution] = useState<SurveyDistribution | null>(null);
  const [template, setTemplate] = useState<SurveyTemplate | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SurveyResponseForm>({
    resolver: zodResolver(surveyResponseSchema),
    defaultValues: {
      studentInfo: {},
      responseData: {},
    },
  });

  useEffect(() => {
    if (publicLink) {
      const abortController = new AbortController();
      loadSurveyData(abortController.signal);
      return () => abortController.abort();
    }
  }, [publicLink]);

  const loadSurveyData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      // Load survey distribution by public link
      const distributionData = await apiClient.get<SurveyDistribution>(
        SURVEY_ENDPOINTS.DISTRIBUTION_BY_LINK(publicLink!),
        { showErrorToast: false }
      );
      setDistribution(distributionData);

      // Load survey template
      const templateData = await apiClient.get<SurveyTemplate>(
        SURVEY_ENDPOINTS.TEMPLATE_BY_ID(distributionData.templateId),
        { showErrorToast: false }
      );
      setTemplate(templateData);

      // Load questions
      const questionsData = await apiClient.get<SurveyQuestion[]>(
        SURVEY_ENDPOINTS.QUESTIONS(distributionData.templateId),
        { showErrorToast: false }
      );
      setQuestions(questionsData.sort((a: SurveyQuestion, b: SurveyQuestion) => a.orderIndex - b.orderIndex));

      setLoading(false);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Error loading survey data:', error);
      setError(error.message || 'Anket yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  const handleSubmit = async (data: SurveyResponseForm) => {
    // Validate ALL required questions before submission
    const isFormValid = validateAllRequiredQuestions();
    if (!isFormValid) {
      return; // Validation error is already set and user is navigated to problem
    }

    try {
      setIsSubmitting(true);

      const responseData = {
        distributionId: distribution?.id,
        studentInfo: data.studentInfo,
        responseData: data.responseData,
        submissionType: 'ONLINE',
        submittedAt: new Date().toISOString(),
      };

      await apiClient.post(
        SURVEY_ENDPOINTS.RESPONSES,
        responseData,
        {
          showSuccessToast: true,
          successMessage: "Anket yanıtınız başarıyla gönderildi",
          showErrorToast: false,
        }
      );

      setIsSubmitted(true);
      toast({ 
        title: "Başarılı", 
        description: "Anket yanıtınız başarıyla gönderildi" 
      });
    } catch (error) {
      console.error('Error submitting survey response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Yanıt gönderilirken hata oluştu';
      setValidationError(errorMessage);
      toast({ 
        title: "Hata", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentStep = () => {
    setValidationError(null);
    
    const currentQuestion = questions[currentQuestionIndex];
    const formValues = form.getValues();
    
    // Validate student info if on first question and not anonymous
    if (currentQuestionIndex === 0 && !distribution?.allowAnonymous) {
      const studentInfo = formValues.studentInfo;
      if (!studentInfo?.name || !studentInfo?.class || !studentInfo?.number) {
        setValidationError('Öğrenci bilgileri zorunludur. Lütfen ad soyad, sınıf ve öğrenci numaranızı giriniz.');
        return false;
      }
    }
    
    // Check if current question is required and has a value
    if (currentQuestion.required) {
      const answer = formValues.responseData?.[currentQuestion.id];
      if (!answer || answer === '' || answer === null || answer === undefined) {
        setValidationError('Bu soru zorunludur. Lütfen yanıtlayın.');
        return false;
      }
    }
    
    return true;
  };

  const validateAllRequiredQuestions = () => {
    setValidationError(null);
    
    const formValues = form.getValues();
    
    // Validate student info if not anonymous
    if (!distribution?.allowAnonymous) {
      const studentInfo = formValues.studentInfo;
      if (!studentInfo?.name || !studentInfo?.class || !studentInfo?.number) {
        setValidationError('Öğrenci bilgileri eksik. Lütfen tüm alanları doldurun.');
        return false;
      }
    }
    
    // Check all required questions
    for (const question of questions) {
      if (question.required) {
        const answer = formValues.responseData?.[question.id];
        if (!answer || answer === '' || answer === null || answer === undefined) {
          setValidationError(`Soru ${question.orderIndex + 1} zorunludur ve yanıtlanmamış. Lütfen tüm zorunlu soruları yanıtlayın.`);
          
          // Navigate to the unanswered question
          const questionIndex = questions.findIndex(q => q.id === question.id);
          if (questionIndex !== -1) {
            setCurrentQuestionIndex(questionIndex);
          }
          
          return false;
        }
      }
    }
    
    return true;
  };

  const handleNextQuestion = () => {
    const isStepValid = validateCurrentStep();
    
    if (!isStepValid) {
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    setValidationError(null);
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
  };

  const renderQuestionInput = (question: SurveyQuestion) => {
    const fieldName = `responseData.${question.id}` as any;

    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: question.required }}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {question.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                        <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'OPEN_ENDED':
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: question.required }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Yanıtınızı buraya yazın..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'YES_NO':
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: question.required }}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-row space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="evet" id={`${question.id}-yes`} />
                      <Label htmlFor={`${question.id}-yes`}>Evet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hayir" id={`${question.id}-no`} />
                      <Label htmlFor={`${question.id}-no`}>Hayır</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'LIKERT':
        const likertOptions = ['1 - Kesinlikle Katılmıyorum', '2 - Katılmıyorum', '3 - Kararsızım', '4 - Katılıyorum', '5 - Kesinlikle Katılıyorum'];
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: question.required }}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {likertOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                        <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'RATING':
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: question.required }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">1</span>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-row space-x-2"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="flex items-center">
                          <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                          <Label htmlFor={`${question.id}-${rating}`} className="sr-only">
                            {rating}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <span className="text-sm">5</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'DROPDOWN':
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: question.required }}
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {question.options?.map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            control={form.control}
            name={fieldName}
            rules={{ required: question.required }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Yanıtınızı giriniz..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Anket yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Hata</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-green-600">Başarılı!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Anket yanıtınız başarıyla gönderildi. Katılımınız için teşekkür ederiz.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!distribution || !template || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <CardTitle className="text-yellow-600">Anket Bulunamadı</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Aranan anket bulunamadı veya artık aktif değil.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{template.title}</CardTitle>
                <CardDescription className="mt-2">
                  {template.description}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                {template.estimatedDuration && (
                  <Badge variant="outline" className="flex items-center border-primary/30">
                    <Clock className="mr-1 h-3 w-3" />
                    {template.estimatedDuration} dk
                  </Badge>
                )}
                {template.mebCompliant && (
                  <Badge className="bg-green-100 text-green-700">
                    MEB Uyumlu
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress */}
        <Card className="mb-6 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">İlerleme</span>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>

        {/* Survey Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Student Info (if not anonymous) */}
            {currentQuestionIndex === 0 && !distribution.allowAnonymous && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Öğrenci Bilgileri</CardTitle>
                  <CardDescription>
                    Lütfen kimlik bilgilerinizi giriniz
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="studentInfo.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Soyad</FormLabel>
                          <FormControl>
                            <Input placeholder="Ad Soyadınızı giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="studentInfo.class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sınıf</FormLabel>
                          <FormControl>
                            <Input placeholder="Sınıfınızı giriniz (ör: 9/A)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="studentInfo.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Öğrenci No</FormLabel>
                          <FormControl>
                            <Input placeholder="Öğrenci numaranızı giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Question */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Soru {currentQuestionIndex + 1}
                      {currentQuestion.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {currentQuestion.questionText}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {currentQuestion.questionType === 'MULTIPLE_CHOICE' && 'Çoktan Seçmeli'}
                    {currentQuestion.questionType === 'OPEN_ENDED' && 'Açık Uçlu'}
                    {currentQuestion.questionType === 'LIKERT' && 'Likert Ölçeği'}
                    {currentQuestion.questionType === 'YES_NO' && 'Evet/Hayır'}
                    {currentQuestion.questionType === 'RATING' && 'Puanlama'}
                    {currentQuestion.questionType === 'DROPDOWN' && 'Açılır Liste'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {renderQuestionInput(currentQuestion)}
                
                {/* Validation Error */}
                {validationError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <p className="text-red-700 text-sm">{validationError}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Önceki
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Anketi Gönder
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextQuestion}
                >
                  Sonraki
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}