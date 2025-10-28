import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { SurveyTemplate, SurveyTemplateType } from "@/lib/survey-types";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: SurveyTemplate[];
  onSelect: (template: SurveyTemplate) => void;
}

const getTypeBadge = (type: SurveyTemplateType) => {
  const typeStyles = {
    MEB_STANDAR: "bg-blue-100 text-blue-700",
    OZEL: "bg-purple-100 text-purple-700",
    AKADEMIK: "bg-orange-100 text-orange-700",
    SOSYAL: "bg-green-100 text-green-700",
    REHBERLIK: "bg-yellow-100 text-yellow-700",
  };

  const typeLabels = {
    MEB_STANDAR: "MEB Standart",
    OZEL: "Özel",
    AKADEMIK: "Akademik",
    SOSYAL: "Sosyal",
    REHBERLIK: "Rehberlik",
  };

  return (
    <Badge className={typeStyles[type]}>
      {typeLabels[type]}
    </Badge>
  );
};

export default function TemplateSelector({ open, onOpenChange, templates, onSelect }: TemplateSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anket Şablonu Seçin</DialogTitle>
          <DialogDescription>
            Dağıtım için bir anket şablonu seçin. Seçtiğiniz şablon ile sınıflara dağıtım yapabilirsiniz.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p>Henüz anket şablonu bulunmuyor</p>
              <p className="text-sm">Önce bir anket şablonu oluşturun</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{template.title}</h4>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {getTypeBadge(template.type)}
                          {template.mebCompliant && (
                            <Badge className="bg-green-100 text-green-700">✓ MEB Uyumlu</Badge>
                          )}
                          {template.estimatedDuration && (
                            <Badge variant="outline">{template.estimatedDuration} dk</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Seç
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
