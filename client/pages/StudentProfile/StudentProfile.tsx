import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { AlertCircle, Loader2 } from "lucide-react";
import { useStudentProfile, useStudentData } from "@/hooks/features/student-profile";
import { StudentHeader } from "./components/StudentHeader";
import { StudentProfileTabs } from "./StudentProfileTabs";

export default function StudentProfile() {
  const { id } = useParams();
  const [refresh, setRefresh] = useState(0);
  const [scoresData, setScoresData] = useState<any>(null);
  const [loadingScores, setLoadingScores] = useState(false);
  
  const { student, studentId, isLoading, error } = useStudentProfile(id);
  const { data } = useStudentData(studentId, refresh);

  const handleUpdate = () => setRefresh((x) => x + 1);

  // Fetch standardized scores and profile completeness
  useEffect(() => {
    if (!studentId) return;
    
    setLoadingScores(true);
    fetch(`/api/student-profile/${studentId}/scores`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setScoresData(result.data);
        }
      })
      .catch(err => console.error('Error loading scores:', err))
      .finally(() => setLoadingScores(false));
  }, [studentId, refresh]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Yükleniyor...
            </CardTitle>
            <CardDescription className="text-base">
              Öğrenci bilgileri yükleniyor
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="border-2 border-destructive/20 shadow-xl bg-gradient-to-br from-destructive/5 via-background to-destructive/5">
          <CardHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              Hata Oluştu
            </CardTitle>
            <CardDescription className="text-base">
              Öğrenci verileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <Button asChild variant="outline" className="shadow-md hover:shadow-lg transition-all">
              <Link to="/ogrenci">Listeye Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!student) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="border-2 border-amber-500/20 shadow-xl bg-gradient-to-br from-amber-500/5 via-background to-amber-500/5">
          <CardHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-amber-500/10">
                <AlertCircle className="h-12 w-12 text-amber-500" />
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
              Öğrenci bulunamadı
            </CardTitle>
            <CardDescription className="text-base">No: {id}</CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <Button asChild variant="outline" className="shadow-md hover:shadow-lg transition-all">
              <Link to="/ogrenci">Listeye Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6 space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <StudentHeader student={student} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <StudentProfileTabs
          student={student}
          studentId={studentId as string}
          data={data}
          onUpdate={handleUpdate}
          scoresData={scoresData}
          loadingScores={loadingScores}
        />
      </motion.div>
    </motion.div>
  );
}
