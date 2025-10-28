
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Loader2, 
  Star, 
  MessageSquare, 
  Activity, 
  Brain, 
  Target, 
  FileText, 
  ClipboardCheck, 
  CheckCircle2,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  TrendingUp,
  ListChecks
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EnhancedTextarea as Textarea } from "@/components/ui/enhanced-textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { completeSessionSchema, type CompleteSessionFormValues, type CounselingSession } from "../types";
import ActionItemsManager from "./ActionItemsManager";
import { cn } from "@/lib/utils";

interface EnhancedCompleteSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CounselingSession | null;
  onSubmit: (data: CompleteSessionFormValues) => void;
  isPending: boolean;
}

export default function EnhancedCompleteSessionDialog({
  open,
  onOpenChange,
  session,
  onSubmit,
  isPending,
}: EnhancedCompleteSessionDialogProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const form = useForm<CompleteSessionFormValues>({
    resolver: zodResolver(completeSessionSchema),
    mode: "onBlur",
    defaultValues: {
      exitTime: new Date().toTimeString().slice(0, 5),
      detailedNotes: "",
      actionItems: [],
      followUpNeeded: false,
      cooperationLevel: 3,
      emotionalState: "sakin",
      physicalState: "normal",
      communicationQuality: "açık",
      followUpDate: undefined,
      followUpTime: undefined,
    },
  });

  const followUpNeeded = form.watch("followUpNeeded");

  useEffect(() => {
    if (followUpNeeded && !form.getValues("followUpDate")) {
      setDatePickerOpen(true);
    }
  }, [followUpNeeded]);

  const handleSubmit = (data: CompleteSessionFormValues) => {
    onSubmit(data);
    form.reset();
  };

  const getCurrentStepLabel = () => {
    switch(activeTab) {
      case "summary": return "1/2";
      case "assessment": return "2/2";
      default: return "";
    }
  };

  const getSubmitButtonText = () => {
    if (followUpNeeded) {
      return "Kaydet ve Takip Planla";
    }
    return "Görüşmeyi Kaydet";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl border border-slate-200/50 dark:border-slate-700/50">
        <DialogHeader>
          <div className="relative pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-400/20 rounded-xl blur-lg" />
                  <div className="relative p-3 rounded-xl bg-violet-100/60 dark:bg-violet-900/30">
                    <MessageSquare className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
                <div>
                  <DialogTitle className="font-bold text-xl text-slate-800 dark:text-slate-100">
                    Görüşmeyi Tamamla
                  </DialogTitle>
                  <DialogDescription className="mt-1.5 text-slate-600 dark:text-slate-400">
                    Görüşme detaylarını kaydedin ve takip planı oluşturun
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-medium px-2.5 py-1 rounded-lg">
                Adım {getCurrentStepLabel()}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl gap-1 border border-slate-200/50 dark:border-slate-700/50">
                  <TabsTrigger 
                    value="summary" 
                    className="data-[state=active]:bg-violet-100/80 dark:data-[state=active]:bg-violet-900/40 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    <FileText className="h-4 w-4 mr-1.5" />
                    Özet & Takip
                  </TabsTrigger>
                  <TabsTrigger 
                    value="assessment"
                    className="data-[state=active]:bg-emerald-100/80 dark:data-[state=active]:bg-emerald-900/40 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-1.5" />
                    Değerlendirme
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6 mt-6">
                  {/* Özet Kartı */}
                  <Card className="border-2 border-violet-200/60 dark:border-violet-800/40 bg-gradient-to-br from-violet-50/80 to-purple-50/40 dark:from-violet-950/20 dark:to-purple-950/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 space-y-5">
                      <div className="flex items-center gap-3 pb-3 border-b border-violet-200/50 dark:border-violet-800/30">
                        <div className="p-2 rounded-lg bg-violet-100/80 dark:bg-violet-900/40">
                          <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="font-semibold text-lg text-violet-900 dark:text-violet-100">
                          Görüşme Özeti
                        </h3>
                      </div>

                      <FormField
                        control={form.control}
                        name="exitTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Çıkış Saati <span className="text-rose-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                {...field} 
                                className="h-10 rounded-lg border-2 focus:border-violet-400 transition-all bg-white dark:bg-slate-900" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="detailedNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Görüşme Notları <span className="text-slate-400 text-sm font-normal">(İsteğe Bağlı)</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Görüşmede neler konuşuldu, hangi kararlar alındı, ulaşılan sonuçlar neler oldu..."
                                rows={6}
                                className="rounded-lg border-2 focus:border-violet-400 resize-none bg-white dark:bg-slate-900"
                                enableVoice={true}
                                voiceLanguage="tr-TR"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Takip & Aksiyon Kartı */}
                  <Card className="border-2 border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-amber-200/50 dark:border-amber-800/30">
                        <div className="p-2 rounded-lg bg-amber-100/80 dark:bg-amber-900/40">
                          <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-semibold text-lg text-amber-900 dark:text-amber-100">
                          Takip & Aksiyon Planı
                        </h3>
                      </div>

                      <FormField
                        control={form.control}
                        name="followUpNeeded"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border-2 border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:from-amber-950/15 dark:to-orange-950/10 p-3 backdrop-blur-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Takip Görüşmesi Planla
                              </FormLabel>
                              <FormDescription className="text-xs text-slate-600 dark:text-slate-400">
                                Takip gerekiyorsa açın
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {followUpNeeded && (
                        <div className="space-y-4 rounded-xl border-2 border-orange-200/60 dark:border-orange-800/40 bg-gradient-to-br from-orange-50/60 to-amber-50/30 dark:from-orange-950/15 dark:to-amber-950/10 p-5 backdrop-blur-sm animate-in fade-in-50 slide-in-from-top-4 duration-300">
                          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold mb-3">
                            <TrendingUp className="h-5 w-5" />
                            <span>Takip Randevusu Detayları</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="followUpDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Takip Tarihi <span className="text-rose-500">*</span>
                                  </FormLabel>
                                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "justify-start text-left font-normal h-10 rounded-lg border-2 bg-white dark:bg-slate-900",
                                            !field.value && "text-slate-400"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {field.value ? (
                                            format(field.value, "d MMMM yyyy", { locale: tr })
                                          ) : (
                                            <span>Tarih seçin</span>
                                          )}
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-lg" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                          if (date) {
                                            field.onChange(date);
                                            setDatePickerOpen(false);
                                          }
                                        }}
                                        disabled={(date) => {
                                          const today = new Date();
                                          today.setHours(0, 0, 0, 0);
                                          return date < today;
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="followUpTime"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Takip Saati <span className="text-rose-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="time" 
                                      {...field} 
                                      className="h-10 rounded-lg border-2 bg-white dark:bg-slate-900" 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="actionItems"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Aksiyon Maddeleri <span className="text-slate-400 text-sm font-normal">(İsteğe Bağlı)</span>
                            </FormLabel>
                            <FormControl>
                              <ActionItemsManager
                                items={field.value || []}
                                onItemsChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="assessment" className="space-y-4 mt-6">
                  <Card className="border border-emerald-200/60 dark:border-emerald-700/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                        <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100">
                          Değerlendirme
                        </h3>
                        <Badge variant="outline" className="ml-auto text-xs">İsteğe Bağlı</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sessionFlow"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Görüşme Seyri
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10 rounded-lg bg-white dark:bg-slate-900">
                                    <SelectValue placeholder="Seçiniz" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="çok_olumlu">✅ Çok Olumlu</SelectItem>
                                  <SelectItem value="olumlu">😊 Olumlu</SelectItem>
                                  <SelectItem value="nötr">😐 Nötr</SelectItem>
                                  <SelectItem value="sorunlu">😟 Sorunlu</SelectItem>
                                  <SelectItem value="kriz">🚨 Kriz</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="studentParticipationLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Katılım Düzeyi
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10 rounded-lg bg-white dark:bg-slate-900">
                                    <SelectValue placeholder="Seçiniz" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="çok_aktif">Çok Aktif</SelectItem>
                                  <SelectItem value="aktif">Aktif</SelectItem>
                                  <SelectItem value="pasif">Pasif</SelectItem>
                                  <SelectItem value="dirençli">Dirençli</SelectItem>
                                  <SelectItem value="kapalı">Kapalı</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emotionalState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Duygu Durumu
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10 rounded-lg bg-white dark:bg-slate-900">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="sakin">😌 Sakin</SelectItem>
                                  <SelectItem value="kaygılı">😰 Kaygılı</SelectItem>
                                  <SelectItem value="üzgün">😢 Üzgün</SelectItem>
                                  <SelectItem value="sinirli">😠 Sinirli</SelectItem>
                                  <SelectItem value="mutlu">😊 Mutlu</SelectItem>
                                  <SelectItem value="karışık">😕 Karışık</SelectItem>
                                  <SelectItem value="diğer">🤔 Diğer</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="physicalState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Fiziksel Durum
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10 rounded-lg bg-white dark:bg-slate-900">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="yorgun">Yorgun</SelectItem>
                                  <SelectItem value="huzursuz">Huzursuz</SelectItem>
                                  <SelectItem value="ajite">Ajite</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="communicationQuality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                İletişim Kalitesi
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10 rounded-lg bg-white dark:bg-slate-900">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="açık">Açık</SelectItem>
                                  <SelectItem value="ketum">Ketum</SelectItem>
                                  <SelectItem value="seçici">Seçici</SelectItem>
                                  <SelectItem value="kapalı">Kapalı</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cooperationLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                İşbirliği: {field.value}/5
                              </FormLabel>
                              <FormControl>
                                <Slider
                                  min={1}
                                  max={5}
                                  step={1}
                                  value={[field.value || 3]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  className="py-2"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-3 sm:gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="h-11 px-5 rounded-xl border font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="h-11 px-6 rounded-xl font-medium bg-violet-500/90 hover:bg-violet-600/90 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {getSubmitButtonText()}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
