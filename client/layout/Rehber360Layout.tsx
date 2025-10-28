import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sun,
  Moon,
  Users2,
  CalendarDays,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Search,
  Sparkles,
  ClipboardList,
  LogOut,
  User,
  Bell,
  Home,
  Menu,
  X,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { loadSettings, updateSettings, SETTINGS_KEY, AppSettings } from "@/lib/app-settings";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import AIStatusIndicator from "@/components/AIStatusIndicator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Modern minimalist logo
function AppLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-3 px-3 py-4 transition-all duration-200 group",
        "hover:bg-accent/50 rounded-lg"
      )}
    >
      <div className="size-8 rounded-md bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground font-bold text-base shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
        R
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight">Rehber360</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
            Dijital Rehberlik
          </span>
        </div>
      )}
    </Link>
  );
}

// Modern breadcrumb
function useBreadcrumbs() {
  const location = useLocation();
  const crumbs = useMemo(() => {
    const map: Record<string, string> = {
      "": "Ana Sayfa",
      ogrenci: "Öğrenci Yönetimi",
      gorusmeler: "Görüşmeler",
      anketler: "Anket & Test",
      raporlar: "Raporlama",
      "olcme-degerlendirme": "Ölçme Değerlendirme",
      ayarlar: "Ayarlar",
      "ai-araclari": "AI Araçları",
    };
    const parts = location.pathname.split("/").filter(Boolean);
    return parts.map((p, i) => ({
      key: p,
      label: map[p] || p,
      to: "/" + parts.slice(0, i + 1).join("/"),
    }));
  }, [location.pathname]);
  return crumbs;
}

// Modern navigation
const navigationItems = [
  { label: "Ana Sayfa", icon: Home, to: "/", end: true },
  { label: "Öğrenci Yönetimi", icon: Users2, to: "/ogrenci" },
  { label: "Görüşmeler", icon: CalendarDays, to: "/gorusmeler" },
  { label: "Anket & Test", icon: MessageSquare, to: "/anketler" },
  { label: "Raporlama", icon: FileText, to: "/raporlar" },
  { label: "Ölçme Değerlendirme", icon: ClipboardList, to: "/olcme-degerlendirme" },
  { label: "AI Araçları", icon: Sparkles, to: "/ai-araclari" },
  { label: "Ayarlar", icon: Settings, to: "/ayarlar" },
];

export default function Rehber360Layout() {
  const { isAuthenticated, logout } = useAuth();
  const [dark, setDark] = useState(false);
  const [account, setAccount] = useState<AppSettings["account"] | undefined>(undefined);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const crumbs = useBreadcrumbs();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const initials = useMemo(() => {
    const n = account?.displayName || "";
    const parts = n.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "K";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  }, [account]);

  useEffect(() => {
    loadSettings().then(settings => {
      setDark(settings.theme === "dark");
      setAccount(settings.account);
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY) {
        try {
          loadSettings().then(next => {
            setDark(next.theme === "dark");
            setAccount(next.account);
          });
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const { data: searchResults } = useQuery<{
    students: any[];
    counselingSessions: any[];
    surveys: any[];
    pages: any[];
  }>({
    queryKey: ['/api/search/global', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        return { students: [], counselingSessions: [], surveys: [], pages: [] };
      }
      const response = await fetch(`/api/search/global?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to fetch search results');
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((v) => !v);
        if (!searchOpen) {
          setTimeout(() => {
            document.getElementById('header-search-input')?.focus();
          }, 100);
        }
      }
      if (e.key === "Escape" && searchOpen) {
        e.preventDefault();
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            "flex flex-col border-r bg-sidebar transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div className="h-16 flex items-center px-2 border-b">
            <AppLogo collapsed={!sidebarOpen} />
          </div>

          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "text-sm font-medium text-sidebar-foreground/70",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </nav>
          </ScrollArea>

          <div className="border-t px-3 py-4">
            <AIStatusIndicator collapsed={!sidebarOpen} />
          </div>
        </aside>
      )}

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <AppLogo />
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </ScrollArea>
            <div className="border-t p-4">
              <AIStatusIndicator />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center gap-4 px-4 md:px-6">
            {isMobile ? (
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <Separator orientation="vertical" className="h-6" />

            <Breadcrumb className="hidden sm:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-sm font-medium">Ana Sayfa</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {crumbs.map((c, i) => (
                  <Fragment key={c.key}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {i === crumbs.length - 1 ? (
                        <BreadcrumbPage className="text-sm font-medium">{c.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={c.to} className="text-sm font-medium">{c.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-2">
              {!searchOpen ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchOpen(true);
                    setTimeout(() => {
                      document.getElementById('header-search-input')?.focus();
                    }, 100);
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              ) : (
                <div className="relative w-[300px]">
                  <Input
                    id="header-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ara..."
                    className="pr-8"
                    onBlur={() => {
                      setTimeout(() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }, 200);
                    }}
                  />
                  {searchQuery && searchQuery.length >= 2 && searchResults && (
                    <Card className="absolute top-12 w-full max-h-[300px] overflow-hidden shadow-lg z-50">
                      <ScrollArea className="h-full max-h-[300px]">
                        {searchResults.students.length > 0 && (
                          <div className="p-2">
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                              Öğrenciler
                            </div>
                            {searchResults.students.map((student) => (
                              <button
                                key={student.id}
                                onClick={() => {
                                  navigate(`/ogrenci/${student.id}`);
                                  setSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-accent text-left"
                              >
                                <Users2 className="h-4 w-4 text-muted-foreground" />
                                <div className="text-sm">{student.name}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setDark((v) => {
                    const next = !v;
                    updateSettings({ theme: next ? "dark" : "light" });
                    return next;
                  })
                }
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/ayarlar" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/bildirimler" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Bildirimler
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          <div className="w-full px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 2xl:px-12 mx-auto max-w-[1920px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
