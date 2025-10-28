import { UseFormReturn } from "react-hook-form";
import { AppSettings } from "@/lib/app-settings";
import ClassPeriodsEditor from "@/components/settings/ClassPeriodsEditor";

interface ClassHoursSettingsTabProps {
  form: UseFormReturn<AppSettings>;
}

export default function ClassHoursSettingsTab({
  form,
}: ClassHoursSettingsTabProps) {
  return (
    <ClassPeriodsEditor
      periods={form.watch("school.periods")}
      onChange={(v) =>
        form.setValue("school.periods", v, { shouldValidate: true })
      }
    />
  );
}
