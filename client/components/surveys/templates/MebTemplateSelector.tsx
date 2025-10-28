import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MEB_SURVEY_TEMPLATES } from "@/lib/survey-types";

interface MebTemplateSelectorProps {
  onTemplateSelect: (templateKey: keyof typeof MEB_SURVEY_TEMPLATES) => void;
}

export function MebTemplateSelector({ onTemplateSelect }: MebTemplateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">MEB Standart Şablonları</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(MEB_SURVEY_TEMPLATES).map(([key, template]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              type="button"
              onClick={() => onTemplateSelect(key as keyof typeof MEB_SURVEY_TEMPLATES)}
              className="justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="font-medium text-sm">{template.title}</div>
                <div className="text-xs text-muted-foreground">
                  {template.estimatedDuration} dk • {template.targetGrades.join(", ")}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
