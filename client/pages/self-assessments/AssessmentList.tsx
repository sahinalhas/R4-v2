import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import {
  AssessmentCard,
  AssessmentStats
} from '@/components/features/self-assessments';
import {
  useActiveTemplatesForStudent,
  useMyAssessments,
  useStartAssessment,
  useDeleteAssessment
} from '@/hooks/features/self-assessments';
import { FileText, AlertCircle, Trash2 } from 'lucide-react';
import type { SelfAssessmentCategory } from '../../../shared/types/self-assessment.types';

export default function AssessmentList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'available' | 'my-assessments'>('available');

  const studentId = user?.id || '';
  const studentGrade = undefined;

  const { templates, isLoading: templatesLoading } = useActiveTemplatesForStudent(
    studentId,
    studentGrade
  );

  const { assessments, isLoading: assessmentsLoading } = useMyAssessments({
    studentId
  });

  const startAssessmentMutation = useStartAssessment();
  const deleteAssessmentMutation = useDeleteAssessment();

  const handleStartAssessment = async (templateId: string) => {
    try {
      const result = await startAssessmentMutation.mutateAsync({
        studentId,
        templateId
      });
      
      if (result?.assessmentId) {
        navigate(`/self-assessments/${result.assessmentId}`);
      }
    } catch (error) {
      console.error('Failed to start assessment:', error);
    }
  };

  const handleContinueAssessment = (assessmentId: string) => {
    navigate(`/self-assessments/${assessmentId}`);
  };

  const handleDeleteDraft = async (assessmentId: string) => {
    if (!confirm('Bu taslak anketi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await deleteAssessmentMutation.mutateAsync(assessmentId);
    } catch (error) {
      console.error('Failed to delete assessment:', error);
    }
  };

  const completedAssessments = assessments.filter(a => a.status === 'APPROVED').length;
  const inProgressAssessments = assessments.filter(a => a.status === 'DRAFT').length;
  const submittedAssessments = assessments.filter(
    a => a.status === 'SUBMITTED' || a.status === 'PROCESSING'
  ).length;
  
  const totalAvailable = templates.length;
  const completionRate = totalAvailable > 0
    ? Math.round((completedAssessments / totalAvailable) * 100)
    : 0;

  const lastAssessmentDate = assessments.length > 0
    ? assessments.sort((a, b) => 
        new Date(b.submittedAt || b.created_at || 0).getTime() - 
        new Date(a.submittedAt || a.created_at || 0).getTime()
      )[0]?.submittedAt || assessments[0]?.created_at
    : undefined;

  const renderAvailableTemplates = () => {
    if (templatesLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (templates.length === 0) {
      return (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Şu anda sizin için aktif bir öz değerlendirme anketi bulunmuyor.
          </AlertDescription>
        </Alert>
      );
    }

    const categorizedTemplates = templates.reduce((acc, template) => {
      const cat = template.category || 'OTHER';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(template);
      return acc;
    }, {} as Record<string, typeof templates>);

    return (
      <div className="space-y-6">
        {Object.entries(categorizedTemplates).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3 capitalize">
              {category.replace('_', ' ').toLowerCase()}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((template) => {
                return (
                  <AssessmentCard
                    key={template.id}
                    id={template.id}
                    title={template.title}
                    description={template.description}
                    category={template.category as SelfAssessmentCategory}
                    estimatedDuration={template.estimatedDuration}
                    requiresParentConsent={template.requiresParentConsent}
                    completionStatus='NOT_STARTED'
                    onStart={() => handleStartAssessment(template.id)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMyAssessments = () => {
    if (assessmentsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (assessments.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Henüz hiç anket doldurmadınız. "Mevcut Anketler" sekmesinden başlayabilirsiniz.
          </AlertDescription>
        </Alert>
      );
    }

    const statusGroups = {
      draft: assessments.filter(a => a.status === 'DRAFT'),
      submitted: assessments.filter(
        a => a.status === 'SUBMITTED' || a.status === 'PROCESSING'
      ),
      approved: assessments.filter(a => a.status === 'APPROVED'),
      rejected: assessments.filter(a => a.status === 'REJECTED')
    };

    return (
      <div className="space-y-6">
        {statusGroups.draft.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Taslaklar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusGroups.draft.map((assessment) => (
                <div key={assessment.id} className="relative">
                  <AssessmentCard
                    id={assessment.id}
                    title={assessment.templateTitle || 'Bilinmeyen Anket'}
                    category={assessment.templateCategory as SelfAssessmentCategory || 'ACADEMIC'}
                    status={assessment.status}
                    completionPercentage={assessment.completionPercentage}
                    lastAttemptDate={assessment.created_at}
                    onContinue={() => handleContinueAssessment(assessment.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteDraft(assessment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {statusGroups.submitted.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Gönderilen Anketler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusGroups.submitted.map((assessment) => (
                <AssessmentCard
                  key={assessment.id}
                  id={assessment.id}
                  title={assessment.templateTitle || 'Bilinmeyen Anket'}
                  category={assessment.templateCategory as SelfAssessmentCategory || 'ACADEMIC'}
                  status={assessment.status}
                  submittedAt={assessment.submittedAt}
                  onView={() => handleContinueAssessment(assessment.id)}
                />
              ))}
            </div>
          </div>
        )}

        {statusGroups.approved.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Onaylanan Anketler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusGroups.approved.map((assessment) => (
                <AssessmentCard
                  key={assessment.id}
                  id={assessment.id}
                  title={assessment.templateTitle || 'Bilinmeyen Anket'}
                  category={assessment.templateCategory as SelfAssessmentCategory || 'ACADEMIC'}
                  status={assessment.status}
                  submittedAt={assessment.submittedAt}
                  reviewedAt={assessment.reviewedAt}
                  onView={() => handleContinueAssessment(assessment.id)}
                />
              ))}
            </div>
          </div>
        )}

        {statusGroups.rejected.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Reddedilen Anketler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusGroups.rejected.map((assessment) => (
                <AssessmentCard
                  key={assessment.id}
                  id={assessment.id}
                  title={assessment.templateTitle || 'Bilinmeyen Anket'}
                  category={assessment.templateCategory as SelfAssessmentCategory || 'ACADEMIC'}
                  status={assessment.status}
                  submittedAt={assessment.submittedAt}
                  reviewedAt={assessment.reviewedAt}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Öz Değerlendirme Anketleri</h1>
        <p className="text-gray-600 mt-2">
          Kendinizi daha iyi tanımanız ve rehber öğretmeninizin sizi daha iyi desteklemesi için anketleri doldurun.
        </p>
      </div>

      <AssessmentStats
        totalTemplates={totalAvailable}
        completedCount={completedAssessments}
        inProgressCount={inProgressAssessments + submittedAssessments}
        notStartedCount={Math.max(0, totalAvailable - completedAssessments - inProgressAssessments)}
        completionRate={completionRate}
        lastAssessmentDate={lastAssessmentDate}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">
            Mevcut Anketler
            {templates.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {templates.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-assessments">
            Anketlerim
            {assessments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {assessments.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          {renderAvailableTemplates()}
        </TabsContent>

        <TabsContent value="my-assessments" className="mt-6">
          {renderMyAssessments()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
