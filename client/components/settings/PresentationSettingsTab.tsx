import { UseFormReturn } from "react-hook-form";
import { AppSettings } from "@/lib/app-settings";
import PresentationSystemEditor from "@/components/settings/PresentationSystemEditor";

interface PresentationSettingsTabProps {
  form: UseFormReturn<AppSettings>;
}

export default function PresentationSettingsTab({
  form,
}: PresentationSettingsTabProps) {
  return (
    <div className="space-y-4">
      <PresentationSystemEditor
        tabs={form.watch("presentationSystem") || []}
        onChange={(tabs) =>
          form.setValue("presentationSystem", tabs, {
            shouldValidate: true,
          })
        }
      />
    </div>
  );
}
