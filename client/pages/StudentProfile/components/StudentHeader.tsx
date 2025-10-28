import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, GraduationCap, ShieldAlert, Sparkles, Calendar, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Student } from "@/lib/storage";
import { RiskPill } from "./RiskPill";

interface StudentHeaderProps {
  student: Student;
}

export function StudentHeader({ student }: StudentHeaderProps) {
  const fullName = `${student.ad} ${student.soyad}`;
  const currentYear = new Date().getFullYear();
  const birthYear = new Date(student.dogumTarihi).getFullYear();
  const age = currentYear - birthYear;
  
  const initials = `${student.ad.charAt(0)}${student.soyad.charAt(0)}`.toUpperCase();
  
  const getGenderColor = (gender: string) => {
    if (gender === "Kız") return "from-pink-500 to-purple-500";
    if (gender === "Erkek") return "from-blue-500 to-cyan-500";
    return "from-gray-500 to-slate-500";
  };

  return (
    <>
      {/* Back Button */}
      <Button 
        asChild 
        variant="ghost" 
        className="mb-3 hover:bg-primary/10 transition-colors"
      >
        <Link to="/ogrenci" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Öğrenci Listesine Dön
        </Link>
      </Button>

      {/* Minimal Modern Header */}
      <Card className="relative overflow-hidden border border-border/50 shadow-lg bg-gradient-to-br from-background via-background to-primary/5">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10"></div>
        
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            {/* Compact Avatar */}
            <Avatar className={`h-16 w-16 md:h-20 md:w-20 border-2 border-white shadow-lg bg-gradient-to-br ${getGenderColor(student.cinsiyet)} flex-shrink-0`}>
              <AvatarFallback className="text-xl md:text-2xl font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Student Info - Compact */}
            <div className="flex-1 min-w-0">
              {/* Name and Risk */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
                    {fullName}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="font-medium">Risk:</span>
                    <RiskPill risk={student.risk} />
                  </div>
                </div>
                
                {/* Action Button - Compact */}
                <Button 
                  asChild 
                  size="sm"
                  className="gap-1.5 shadow-md hover:shadow-lg transition-all flex-shrink-0"
                >
                  <Link to={`/ogrenci/${student.id}/gelismis-analiz`}>
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Gelişmiş Analiz</span>
                    <span className="sm:hidden">Analiz</span>
                  </Link>
                </Button>
              </div>
              
              {/* Compact Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  {student.class}
                </Badge>
                
                <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
                  {student.cinsiyet === "K" ? "Kız" : "Erkek"}
                </Badge>
                
                <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
                  <Calendar className="h-3 w-3 mr-1" />
                  {age} yaş
                </Badge>

                {student.okulNo && (
                  <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
                    <User className="h-3 w-3 mr-1" />
                    {student.okulNo}
                  </Badge>
                )}
              </div>

              {/* Contact Info - Compact Grid */}
              {(student.eposta || student.telefon || student.adres) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {student.eposta && (
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 rounded px-2 py-1">
                      <Mail className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="truncate max-w-[150px]">{student.eposta}</span>
                    </div>
                  )}
                  {student.telefon && (
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 rounded px-2 py-1">
                      <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                      <span>{student.telefon}</span>
                    </div>
                  )}
                  {student.adres && (
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 rounded px-2 py-1 max-w-full">
                      <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="truncate">{student.adres}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
}
