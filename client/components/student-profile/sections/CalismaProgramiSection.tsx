import WeeklySchedule from "@/components/student-profile/WeeklySchedule";
import TopicPlanner from "@/components/student-profile/TopicPlanner";

interface CalismaProgramiSectionProps {
  studentId: string;
}

export default function CalismaProgramiSection({ studentId }: CalismaProgramiSectionProps) {
  return (
    <div className="grid gap-4">
      <WeeklySchedule sid={studentId} />
      <TopicPlanner sid={studentId} />
    </div>
  );
}
