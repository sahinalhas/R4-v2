import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/atoms/Toaster";
import { TooltipProvider } from "@/components/organisms/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import ErrorBoundary from "./components/features/common/ErrorBoundary";
import { setupGlobalErrorHandlers } from "./lib/error-handler";
import { usePrefetchRoutes } from "./hooks/usePrefetchRoutes";
import { Loader2 } from "lucide-react";
import Layout from "./layout/Rehber360Layout";
import Index from "./pages/Index";
import Students from "./pages/Students";
import Login from "./pages/Login";
import Register from "./pages/Register";

const StudentProfile = lazy(() => import("./pages/StudentProfile/StudentProfile"));
const CounselingSessions = lazy(() => import("./pages/CounselingSessions"));
const Surveys = lazy(() => import("./pages/Surveys"));
const Reports = lazy(() => import("./pages/Reports"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const PublicSurvey = lazy(() => import("./pages/PublicSurvey"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AIToolsPage = lazy(() => import("./pages/AIToolsPage"));
const AdvancedStudentAnalysis = lazy(() => import("./pages/AdvancedStudentAnalysis"));
const Notifications = lazy(() => import("./pages/Notifications"));
const InterventionTracking = lazy(() => import("./pages/InterventionTracking"));
const ParentAccess = lazy(() => import("./pages/ParentAccess"));
const SchoolDashboard = lazy(() => import("./pages/SchoolDashboard"));
const BackupManagement = lazy(() => import("./pages/BackupManagement"));
const ExamManagementPage = lazy(() => import("./pages/ExamManagementPage"));
const AssessmentList = lazy(() => import("./pages/self-assessments/AssessmentList"));
const AssessmentForm = lazy(() => import("./pages/self-assessments/AssessmentForm"));
const AssessmentComplete = lazy(() => import("./pages/self-assessments/AssessmentComplete"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minute - data is fresh for quick page transitions
      gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for fast back/forward navigation
      refetchOnWindowFocus: false, // Don't refetch when switching tabs (reduces unnecessary requests)
      refetchOnReconnect: true, // Refetch when connection is restored
      refetchOnMount: 'always', // Always check for fresh data, but use cache while fetching
      retry: 1,
    },
  },
});

function PrefetchWrapper() {
  usePrefetchRoutes();
  return null;
}

const App = () => {
  useEffect(() => {
    const cleanup = setupGlobalErrorHandlers();
    return cleanup;
  }, []);

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <PrefetchWrapper />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/ogrenci" element={<Students />} />
                  <Route path="/ogrenci/:id" element={<Suspense fallback={<LoadingFallback />}><StudentProfile /></Suspense>} />
                  <Route
                    path="/gorusmeler"
                    element={<Suspense fallback={<LoadingFallback />}><CounselingSessions /></Suspense>}
                  />
                  <Route
                    path="/anketler"
                    element={<Suspense fallback={<LoadingFallback />}><Surveys /></Suspense>}
                  />
                  <Route
                    path="/raporlar"
                    element={<Suspense fallback={<LoadingFallback />}><Reports /></Suspense>}
                  />
                  <Route
                    path="/olcme-degerlendirme"
                    element={<Suspense fallback={<LoadingFallback />}><ExamManagementPage /></Suspense>}
                  />
                  <Route path="/ayarlar" element={<Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense>} />
                  <Route
                    path="/ai-araclari"
                    element={<Suspense fallback={<LoadingFallback />}><AIToolsPage /></Suspense>}
                  />
                  <Route
                    path="/istatistik"
                    element={<Navigate to="/raporlar" replace />}
                  />
                  <Route
                    path="/risk"
                    element={<Navigate to="/ai-araclari?tab=risk" replace />}
                  />
                  <Route
                    path="/ai-asistan"
                    element={<Navigate to="/ai-araclari?tab=ai-asistan" replace />}
                  />
                  <Route
                    path="/ai-insights"
                    element={<Navigate to="/ai-araclari?tab=ai-insights" replace />}
                  />
                  <Route
                    path="/gunluk-plan"
                    element={<Navigate to="/ai-araclari?tab=gunluk-plan" replace />}
                  />
                  <Route
                    path="/gelismis-analiz"
                    element={<Navigate to="/ai-araclari?tab=gelismis-analiz" replace />}
                  />
                  <Route
                    path="/ogrenci/:studentId/gelismis-analiz"
                    element={<Suspense fallback={<LoadingFallback />}><AdvancedStudentAnalysis /></Suspense>}
                  />
                  <Route
                    path="/bildirimler"
                    element={<Suspense fallback={<LoadingFallback />}><Notifications /></Suspense>}
                  />
                  <Route
                    path="/mudahale-takip"
                    element={<Suspense fallback={<LoadingFallback />}><InterventionTracking /></Suspense>}
                  />
                  <Route
                    path="/veli-erisim"
                    element={<Suspense fallback={<LoadingFallback />}><ParentAccess /></Suspense>}
                  />
                  <Route
                    path="/okul-dashboard"
                    element={<Suspense fallback={<LoadingFallback />}><SchoolDashboard /></Suspense>}
                  />
                  <Route
                    path="/yedekleme"
                    element={<Suspense fallback={<LoadingFallback />}><BackupManagement /></Suspense>}
                  />
                  <Route
                    path="/oz-degerlendirme"
                    element={<Suspense fallback={<LoadingFallback />}><AssessmentList /></Suspense>}
                  />
                  <Route
                    path="/self-assessments"
                    element={<Suspense fallback={<LoadingFallback />}><AssessmentList /></Suspense>}
                  />
                  <Route
                    path="/self-assessments/:assessmentId"
                    element={<Suspense fallback={<LoadingFallback />}><AssessmentForm /></Suspense>}
                  />
                  <Route
                    path="/self-assessments/:assessmentId/complete"
                    element={<Suspense fallback={<LoadingFallback />}><AssessmentComplete /></Suspense>}
                  />
                </Route>
                <Route path="/anket/:publicLink" element={<Suspense fallback={<LoadingFallback />}><PublicSurvey /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
