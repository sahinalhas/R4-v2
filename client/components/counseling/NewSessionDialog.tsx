import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Users } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import IndividualSessionForm from "./IndividualSessionForm";
import GroupSessionForm from "./GroupSessionForm";
import { 
  individualSessionSchema, 
  groupSessionSchema,
  type IndividualSessionFormValues, 
  type GroupSessionFormValues,
  type Student,
  type CounselingTopic,
} from "./types";

interface NewSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionType: 'individual' | 'group';
  onSessionTypeChange: (type: 'individual' | 'group') => void;
  students: Student[];
  topics: CounselingTopic[];
  selectedStudents: Student[];
  onSelectedStudentsChange: (students: Student[]) => void;
  onSubmit: (data: IndividualSessionFormValues | GroupSessionFormValues) => void;
  isPending: boolean;
}

export default function NewSessionDialog({
  open,
  onOpenChange,
  sessionType,
  onSessionTypeChange,
  students,
  topics,
  selectedStudents,
  onSelectedStudentsChange,
  onSubmit,
  isPending,
}: NewSessionDialogProps) {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  const individualForm = useForm<IndividualSessionFormValues>({
    resolver: zodResolver(individualSessionSchema),
    defaultValues: {
      studentId: "",
      topic: "",
      participantType: "öğrenci",
      relationshipType: "",
      sessionMode: "yüz_yüze",
      sessionLocation: "Rehberlik Servisi",
      disciplineStatus: "none",
      sessionDate: now,
      sessionTime: currentTime,
      sessionDetails: "",
    },
  });

  const groupForm = useForm<GroupSessionFormValues>({
    resolver: zodResolver(groupSessionSchema),
    defaultValues: {
      groupName: "",
      studentIds: [],
      topic: "",
      participantType: "öğrenci",
      sessionMode: "yüz_yüze",
      sessionLocation: "Rehberlik Servisi",
      disciplineStatus: "none",
      sessionDate: now,
      sessionTime: currentTime,
      sessionDetails: "",
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    individualForm.reset();
    groupForm.reset();
    onSelectedStudentsChange([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Görüşme Başlat</DialogTitle>
          <DialogDescription>
            Rehberlik görüşmesi kaydı oluşturun
          </DialogDescription>
        </DialogHeader>

        <Tabs value={sessionType} onValueChange={(v) => onSessionTypeChange(v as 'individual' | 'group')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">
              <User className="h-4 w-4 mr-2" />
              Bireysel Görüşme
            </TabsTrigger>
            <TabsTrigger value="group">
              <Users className="h-4 w-4 mr-2" />
              Grup Görüşmesi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <IndividualSessionForm
              form={individualForm}
              students={students}
              topics={topics}
              onSubmit={onSubmit}
              onCancel={handleClose}
              isPending={isPending}
            />
          </TabsContent>

          <TabsContent value="group">
            <GroupSessionForm
              form={groupForm}
              students={students}
              topics={topics}
              selectedStudents={selectedStudents}
              onSelectedStudentsChange={onSelectedStudentsChange}
              onSubmit={onSubmit}
              onCancel={handleClose}
              isPending={isPending}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
