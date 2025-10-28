import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Phone, Users as UsersIcon, Settings2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SESSION_MODES } from "@shared/constants/common.constants";

import type { IndividualSessionFormValues, GroupSessionFormValues } from "../types";

interface SessionDetailsStepProps {
  form: UseFormReturn<IndividualSessionFormValues | GroupSessionFormValues>;
}

export default function SessionDetailsStep({ form }: SessionDetailsStepProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const sessionMode = form.watch("sessionMode");

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      <div className="relative pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl blur-lg opacity-20" />
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Settings2 className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Görüşme Detayları
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Tarih, saat ve görüşme şeklini belirleyin
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sessionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tarih <span className="text-rose-500">*</span>
                </FormLabel>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
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
                          setDateOpen(false);
                        }
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
            name="sessionTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Saat <span className="text-rose-500">*</span>
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

        <FormField
          control={form.control}
          name="sessionMode"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Görüşme Şekli <span className="text-rose-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3"
                >
                  <div>
                    <RadioGroupItem
                      value={SESSION_MODES.YUZ_YUZE}
                      id="yuz_yuze"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="yuz_yuze"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-emerald-400 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-950/30 cursor-pointer transition-all"
                    >
                      <UsersIcon className="mb-2 h-6 w-6 text-emerald-600" />
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Yüz Yüze</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value={SESSION_MODES.ONLINE}
                      id="online"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="online"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-blue-400 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/30 cursor-pointer transition-all"
                    >
                      <Video className="mb-2 h-6 w-6 text-blue-600" />
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Online</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value={SESSION_MODES.TELEFON}
                      id="telefon"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="telefon"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-orange-400 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50 dark:peer-data-[state=checked]:bg-orange-950/30 cursor-pointer transition-all"
                    >
                      <Phone className="mb-2 h-6 w-6 text-orange-600" />
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Telefon</span>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sessionLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Görüşme Yeri <span className="text-rose-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder={
                      sessionMode === SESSION_MODES.ONLINE 
                        ? "Zoom, Teams, vb." 
                        : sessionMode === SESSION_MODES.TELEFON
                        ? "Telefon görüşmesi"
                        : "Rehberlik Servisi"
                    }
                    className="h-10 rounded-lg border-2 bg-white dark:bg-slate-900"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="disciplineStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Disiplin / Davranış Değerlendirme
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10 rounded-lg bg-white dark:bg-slate-900">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="none">Seçiniz</SelectItem>
                    <SelectItem value="kurulu_sevk">Kurulu sevk edilen öğrenci</SelectItem>
                    <SelectItem value="gorusu_alinan">Görüşü alınan öğrenci / şahit</SelectItem>
                    <SelectItem value="akran_gorusmesi">Akran Görüşmesi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
