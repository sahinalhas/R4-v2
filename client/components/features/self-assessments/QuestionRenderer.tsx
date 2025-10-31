import { RadioGroup, RadioGroupItem } from '@/components/atoms/RadioGroup';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Slider } from '@/components/atoms/Slider';
import { Textarea } from '@/components/atoms/Textarea';
import { Label } from '@/components/atoms/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import type { SelfAssessmentQuestion } from '../../../../shared/types/self-assessment.types';

interface QuestionRendererProps {
  question: SelfAssessmentQuestion;
  value: any;
  onChange: (value: any) => void;
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  const renderByType = () => {
    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        return (
          <RadioGroup value={value || ''} onValueChange={onChange}>
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label 
                    htmlFor={`${question.id}-${option}`}
                    className="font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'MULTI_SELECT':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={Array.isArray(value) && value.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    const newValue = checked
                      ? [...currentValue, option]
                      : currentValue.filter((v: string) => v !== option);
                    onChange(newValue);
                  }}
                />
                <Label 
                  htmlFor={`${question.id}-${option}`}
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'SCALE':
        const scaleValue = typeof value === 'number' ? value : 5;
        return (
          <div className="space-y-4 py-4">
            <Slider
              value={[scaleValue]}
              onValueChange={([v]) => onChange(v)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Hiç Katılmıyorum (1)</span>
              <span className="font-bold text-lg text-primary">{scaleValue}</span>
              <span className="text-gray-500">Tamamen Katılıyorum (10)</span>
            </div>
          </div>
        );

      case 'TEXT':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Cevabınızı buraya yazın..."
            rows={4}
            className="w-full"
          />
        );

      case 'YES_NO':
        return (
          <RadioGroup value={value || ''} onValueChange={onChange}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`} className="font-normal cursor-pointer">
                  Evet
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`} className="font-normal cursor-pointer">
                  Hayır
                </Label>
              </div>
            </div>
          </RadioGroup>
        );

      case 'DROPDOWN':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <div className="text-gray-500 italic">
            Desteklenmeyen soru tipi: {question.questionType}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-lg font-medium flex items-start gap-2">
          <span>{question.questionText}</span>
          {question.required && (
            <span className="text-red-500 text-sm">*</span>
          )}
        </Label>
        {question.helpText && (
          <p className="text-sm text-gray-500">{question.helpText}</p>
        )}
      </div>
      {renderByType()}
    </div>
  );
}
