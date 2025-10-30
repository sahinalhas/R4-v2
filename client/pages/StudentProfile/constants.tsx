import {
  LayoutDashboard,
  User,
  Activity,
  GraduationCap,
  Brain,
  ShieldAlert,
  Briefcase,
  MessageCircle,
  Bot,
  Heart,
  Sparkles,
  Target,
  TrendingUp,
  ClipboardList,
  BookOpen,
  Trophy,
  PieChart,
  Users,
  Home,
  Calendar,
} from "lucide-react";

/**
 * Optimized Student Profile Navigation Structure
 * 6 Ana Sekme - Yeni Mantıksal Yapı
 * Bilgi tekrarı yok, rehber öğretmen iş akışına göre optimize edilmiş
 * 
 * Tarih: 30 Ekim 2025
 * Optimizasyon: 8 sekme → 6 sekme (%25 azalma)
 */

// 6 ANA SEKME - Optimize Edilmiş Yapı
// Her bilgi tek bir yerde, mantıklı iş akışı
export const MAIN_TABS = [
  {
    value: "overview",
    label: "📊 Genel Bakış",
    icon: LayoutDashboard,
    description: "360° durum özeti, trendler, hızlı aksiyonlar ve önemli bilgiler"
  },
  {
    value: "identity-family",
    label: "👨‍👩‍👧 Kimlik & Aile",
    icon: Users,
    description: "Öğrenci ve aile bilgileri, iletişim, sosyoekonomik durum"
  },
  {
    value: "academics",
    label: "🎓 Akademik",
    icon: GraduationCap,
    description: "Notlar, sınavlar, devam, öğrenme stratejisi ve ilerleme"
  },
  {
    value: "wellbeing",
    label: "💚 İyilik Hali & Gelişim",
    icon: Heart,
    description: "Sağlık, sosyal-duygusal, kişilik, motivasyon ve kariyer"
  },
  {
    value: "risk-support",
    label: "🛡️ Risk & Müdahale",
    icon: ShieldAlert,
    description: "Risk faktörleri, davranış takibi ve müdahale planları"
  },
  {
    value: "communication",
    label: "💬 İletişim & Kayıtlar",
    icon: MessageCircle,
    description: "Görüşmeler, notlar, ev ziyaretleri, belgeler ve AI araçları"
  },
] as const;

// AKADEMİK ALT SEKMELERİ (Değişiklik yok)
export const AKADEMIK_TABS = [
  {
    value: "performans",
    label: "Akademik Performans",
    icon: TrendingUp,
  },
  {
    value: "sinavlar",
    label: "Sınavlar & Değerlendirme",
    icon: ClipboardList,
  },
  {
    value: "calisma-programi",
    label: "Çalışma Programı",
    icon: BookOpen,
  },
  {
    value: "ilerleme",
    label: "İlerleme & Başarılar",
    icon: Trophy,
  },
  {
    value: "anketler",
    label: "Anketler",
    icon: PieChart,
  },
] as const;

// İLETİŞİM MERKEZİ ALT SEKMELERİ (Değişiklik yok)
export const ILETISIM_TABS = [
  {
    value: "tum-gorusmeler",
    label: "Tüm Görüşmeler",
    icon: MessageCircle,
  },
  {
    value: "ev-ziyaretleri",
    label: "Ev Ziyaretleri",
    icon: Home,
  },
  {
    value: "aile-katilimi",
    label: "Aile Katılımı",
    icon: Users,
  },
  {
    value: "gecmis",
    label: "İletişim Geçmişi",
    icon: Calendar,
  },
  {
    value: "ai-araclari",
    label: "AI Araçları",
    icon: Bot,
  },
] as const;

/**
 * Semantic Color System - Optimized
 * Her sekme için anlamlı renk paleti (6 ana sekme)
 */
export const TAB_COLORS = {
  overview: {
    gradient: "from-primary via-purple-500 to-primary",
    bg: "bg-gradient-to-r from-primary/10 to-purple-500/10",
    border: "border-primary/20",
  },
  "identity-family": {
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    border: "border-blue-200/50 dark:border-blue-800/50",
  },
  academics: {
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
    border: "border-blue-200/50 dark:border-blue-800/50",
  },
  wellbeing: {
    gradient: "from-green-500 to-emerald-500",
    bg: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
    border: "border-green-200/50 dark:border-green-800/50",
  },
  "risk-support": {
    gradient: "from-red-500 to-orange-500",
    bg: "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20",
    border: "border-red-200/50 dark:border-red-800/50",
  },
  communication: {
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
    border: "border-violet-200/50 dark:border-violet-800/50",
  },
  ai: {
    gradient: "from-indigo-500 to-purple-500",
    bg: "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20",
    border: "border-indigo-200/50 dark:border-indigo-800/50",
  },
} as const;
