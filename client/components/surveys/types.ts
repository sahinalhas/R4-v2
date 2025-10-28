import { z } from "zod";

export const surveyTemplateSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  description: z.string().optional(),
  type: z.enum(["MEB_STANDAR", "OZEL", "AKADEMIK", "SOSYAL", "REHBERLIK"]),
  mebCompliant: z.boolean().default(false),
  estimatedDuration: z.number().min(1).max(180).optional(),
  targetGrades: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  questions: z.array(z.object({
    questionText: z.string().min(1, "Soru metni gereklidir"),
    questionType: z.enum(["MULTIPLE_CHOICE", "OPEN_ENDED", "LIKERT", "YES_NO", "RATING", "DROPDOWN"]),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    validation: z.object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
    }).optional(),
  })).default([])
});

export type SurveyTemplateForm = z.infer<typeof surveyTemplateSchema>;
