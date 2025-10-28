/**
 * Profile Quality Validator Service
 * Profil Kalitesi Doğrulama Servisi
 * 
 * Her profil tipinin veri kalitesini kontrol eder ve uyarılar üretir
 */

export interface ProfileQualityReport {
  profileType: string;
  qualityScore: number; // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'incomplete';
  missingCriticalFields: string[];
  missingOptionalFields: string[];
  dataQualityIssues: string[];
  recommendations: string[];
}

export interface StudentQualityReport {
  studentId: string;
  overallQuality: number;
  profiles: {
    basic: ProfileQualityReport;
    academic: ProfileQualityReport;
    socialEmotional: ProfileQualityReport;
    talentsInterests: ProfileQualityReport;
    health: ProfileQualityReport;
    motivation: ProfileQualityReport;
    riskProtective: ProfileQualityReport;
  };
  criticalWarnings: string[];
  actionItems: string[];
}

export class ProfileQualityValidator {
  
  /**
   * Validate basic student information
   * Temel öğrenci bilgilerini doğrula
   */
  validateBasicInfo(student: any): ProfileQualityReport {
    const criticalFields = ['id', 'ad', 'soyad', 'class'];
    const optionalFields = ['cinsiyet', 'dogumTarihi', 'telefon', 'eposta', 'adres', 'veliTelefon'];
    
    const missingCritical: string[] = [];
    const missingOptional: string[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Kritik alanlar kontrolü
    criticalFields.forEach(field => {
      if (!student[field] || (typeof student[field] === 'string' && student[field].trim() === '')) {
        missingCritical.push(field);
      }
    });
    
    // Opsiyonel alanlar kontrolü
    optionalFields.forEach(field => {
      if (!student[field]) {
        missingOptional.push(field);
      }
    });
    
    // Veri kalitesi kontrolleri
    if (student.eposta && !this.isValidEmail(student.eposta)) {
      issues.push('Geçersiz e-posta formatı');
    }
    
    if (student.telefon && !this.isValidPhone(student.telefon)) {
      issues.push('Geçersiz telefon numarası formatı');
    }
    
    if (student.dogumTarihi && !this.isValidDate(student.dogumTarihi)) {
      issues.push('Geçersiz doğum tarihi');
    }
    
    // Öneriler
    if (missingOptional.includes('veliTelefon')) {
      recommendations.push('Veli iletişim bilgisi eklenmeli');
    }
    
    if (!student.acilKisi || !student.acilTelefon) {
      recommendations.push('Acil durum iletişim bilgileri tamamlanmalı');
    }
    
    const qualityScore = this.calculateQualityScore(
      criticalFields.length,
      criticalFields.length - missingCritical.length,
      optionalFields.length,
      optionalFields.length - missingOptional.length,
      issues.length
    );
    
    return {
      profileType: 'Temel Bilgiler',
      qualityScore,
      status: this.getQualityStatus(qualityScore),
      missingCriticalFields: missingCritical,
      missingOptionalFields: missingOptional,
      dataQualityIssues: issues,
      recommendations
    };
  }
  
  /**
   * Validate academic profile
   * Akademik profili doğrula
   */
  validateAcademicProfile(profile: any): ProfileQualityReport {
    const criticalFields = ['strongSubjects', 'weakSubjects', 'primaryLearningStyle'];
    const optionalFields = ['strongSkills', 'weakSkills', 'secondaryLearningStyle', 'overallMotivation', 'studyHoursPerWeek', 'homeworkCompletionRate'];
    
    const missingCritical: string[] = [];
    const missingOptional: string[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    if (!profile) {
      return {
        profileType: 'Akademik Profil',
        qualityScore: 0,
        status: 'incomplete',
        missingCriticalFields: ['Profil oluşturulmamış'],
        missingOptionalFields: [],
        dataQualityIssues: [],
        recommendations: ['Akademik profil oluşturulmalı']
      };
    }
    
    // Kritik alanlar
    criticalFields.forEach(field => {
      if (!profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0)) {
        missingCritical.push(field);
      }
    });
    
    // Opsiyonel alanlar
    optionalFields.forEach(field => {
      if (!profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0)) {
        missingOptional.push(field);
      }
    });
    
    // Veri kalitesi kontrolleri
    if (profile.overallMotivation && (profile.overallMotivation < 1 || profile.overallMotivation > 10)) {
      issues.push('Motivasyon seviyesi 1-10 arasında olmalı');
    }
    
    if (profile.homeworkCompletionRate && (profile.homeworkCompletionRate < 0 || profile.homeworkCompletionRate > 100)) {
      issues.push('Ödev tamamlama oranı 0-100 arasında olmalı');
    }
    
    // Öneriler
    if (!profile.strongSubjects || profile.strongSubjects.length === 0) {
      recommendations.push('Güçlü ders alanları belirlenm eli');
    }
    
    if (!profile.primaryLearningStyle) {
      recommendations.push('Öğrenme stili değerlendirilmeli');
    }
    
    if (!profile.overallMotivation || profile.overallMotivation <= 3) {
      recommendations.push('Motivasyon düşük - destek planı oluşturulmalı');
    }
    
    const qualityScore = this.calculateQualityScore(
      criticalFields.length,
      criticalFields.length - missingCritical.length,
      optionalFields.length,
      optionalFields.length - missingOptional.length,
      issues.length
    );
    
    return {
      profileType: 'Akademik Profil',
      qualityScore,
      status: this.getQualityStatus(qualityScore),
      missingCriticalFields: missingCritical,
      missingOptionalFields: missingOptional,
      dataQualityIssues: issues,
      recommendations
    };
  }
  
  /**
   * Validate social-emotional profile
   * Sosyal-duygusal profili doğrula
   */
  validateSocialEmotionalProfile(profile: any): ProfileQualityReport {
    const criticalFields = ['empathyLevel', 'selfAwarenessLevel', 'emotionRegulationLevel'];
    const optionalFields = ['strongSocialSkills', 'developingSocialSkills', 'conflictResolutionLevel', 'leadershipLevel', 'teamworkLevel', 'communicationLevel', 'friendCircleSize', 'socialRole'];
    
    const missingCritical: string[] = [];
    const missingOptional: string[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    if (!profile) {
      return {
        profileType: 'Sosyal-Duygusal Profil',
        qualityScore: 0,
        status: 'incomplete',
        missingCriticalFields: ['Profil oluşturulmamış'],
        missingOptionalFields: [],
        dataQualityIssues: [],
        recommendations: ['Sosyal-duygusal profil oluşturulmalı']
      };
    }
    
    criticalFields.forEach(field => {
      if (!profile[field] || profile[field] === 0) {
        missingCritical.push(field);
      }
    });
    
    optionalFields.forEach(field => {
      if (!profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0)) {
        missingOptional.push(field);
      }
    });
    
    // SEL seviyeleri kontrolü
    const selFields = ['empathyLevel', 'selfAwarenessLevel', 'emotionRegulationLevel', 'conflictResolutionLevel', 'leadershipLevel', 'teamworkLevel', 'communicationLevel'];
    selFields.forEach(field => {
      if (profile[field] && (profile[field] < 1 || profile[field] > 10)) {
        issues.push(`${field} 1-10 arasında olmalı`);
      }
    });
    
    // Öneriler
    if (profile.bullyingStatus && profile.bullyingStatus !== 'YOK') {
      recommendations.push('Zorbalık durumu tespit edildi - acil müdahale gerekli');
    }
    
    if (profile.friendCircleSize === 'YOK' || profile.friendCircleSize === 'AZ') {
      recommendations.push('Sosyal destek programı önerilir');
    }
    
    if (profile.emotionRegulationLevel && profile.emotionRegulationLevel <= 3) {
      recommendations.push('Duygu düzenleme becerileri geliştirilmeli');
    }
    
    const qualityScore = this.calculateQualityScore(
      criticalFields.length,
      criticalFields.length - missingCritical.length,
      optionalFields.length,
      optionalFields.length - missingOptional.length,
      issues.length
    );
    
    return {
      profileType: 'Sosyal-Duygusal Profil',
      qualityScore,
      status: this.getQualityStatus(qualityScore),
      missingCriticalFields: missingCritical,
      missingOptionalFields: missingOptional,
      dataQualityIssues: issues,
      recommendations
    };
  }
  
  /**
   * Validate health profile
   * Sağlık profilini doğrula
   */
  validateHealthProfile(profile: any): ProfileQualityReport {
    const criticalFields = ['emergencyContact1Name', 'emergencyContact1Phone'];
    const optionalFields = ['bloodType', 'chronicDiseases', 'allergies', 'currentMedications', 'emergencyContact2Name', 'lastHealthCheckup'];
    
    const missingCritical: string[] = [];
    const missingOptional: string[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    if (!profile) {
      return {
        profileType: 'Sağlık Profili',
        qualityScore: 0,
        status: 'incomplete',
        missingCriticalFields: ['Profil oluşturulmamış'],
        missingOptionalFields: [],
        dataQualityIssues: [],
        recommendations: ['Sağlık profili oluşturulmalı - acil durum bilgileri kritik']
      };
    }
    
    criticalFields.forEach(field => {
      if (!profile[field]) {
        missingCritical.push(field);
      }
    });
    
    optionalFields.forEach(field => {
      if (!profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0)) {
        missingOptional.push(field);
      }
    });
    
    // Kritik sağlık durumları kontrolü
    if (profile.chronicDiseases && Array.isArray(profile.chronicDiseases) && profile.chronicDiseases.length > 0) {
      recommendations.push('Kronik hastalık mevcut - düzenli takip gerekli');
    }
    
    if (profile.allergies && Array.isArray(profile.allergies) && profile.allergies.length > 0) {
      recommendations.push('Alerji bilgisi mevcut - öğretmenlere bildirilmeli');
    }
    
    if (!profile.lastHealthCheckup) {
      recommendations.push('Sağlık kontrolü tarihi eksik');
    }
    
    const qualityScore = this.calculateQualityScore(
      criticalFields.length,
      criticalFields.length - missingCritical.length,
      optionalFields.length,
      optionalFields.length - missingOptional.length,
      issues.length
    );
    
    return {
      profileType: 'Sağlık Profili',
      qualityScore,
      status: this.getQualityStatus(qualityScore),
      missingCriticalFields: missingCritical,
      missingOptionalFields: missingOptional,
      dataQualityIssues: issues,
      recommendations
    };
  }
  
  /**
   * Calculate overall quality score
   * Genel kalite skorunu hesapla
   */
  private calculateQualityScore(
    totalCritical: number,
    filledCritical: number,
    totalOptional: number,
    filledOptional: number,
    issuesCount: number
  ): number {
    const criticalWeight = 0.7;
    const optionalWeight = 0.3;
    
    const criticalScore = totalCritical > 0 ? (filledCritical / totalCritical) * 100 : 100;
    const optionalScore = totalOptional > 0 ? (filledOptional / totalOptional) * 100 : 100;
    
    const baseScore = (criticalScore * criticalWeight) + (optionalScore * optionalWeight);
    const issuesPenalty = issuesCount * 5;
    
    return Math.max(0, Math.round(baseScore - issuesPenalty));
  }
  
  /**
   * Get quality status from score
   * Skordan kalite durumunu belirle
   */
  private getQualityStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'incomplete' {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    if (score > 0) return 'poor';
    return 'incomplete';
  }
  
  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  /**
   * Validate phone format
   */
  private isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\s/g, '');
    const regex = /^[0-9]{10,11}$/;
    return regex.test(cleaned);
  }
  
  /**
   * Validate date format
   */
  private isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }
  
  /**
   * Generate comprehensive quality report for a student
   * Öğrenci için kapsamlı kalite raporu oluştur
   */
  generateStudentQualityReport(
    student: any,
    academic: any,
    socialEmotional: any,
    talentsInterests: any,
    health: any,
    motivation: any,
    riskProtective: any
  ): StudentQualityReport {
    const basicReport = this.validateBasicInfo(student);
    const academicReport = this.validateAcademicProfile(academic);
    const selReport = this.validateSocialEmotionalProfile(socialEmotional);
    const talentsReport = this.validateTalentsInterestsProfile(talentsInterests);
    const healthReport = this.validateHealthProfile(health);
    const motivationReport = this.validateMotivationProfile(motivation);
    const riskReport = this.validateRiskProtectiveProfile(riskProtective);
    
    const overallQuality = Math.round(
      (basicReport.qualityScore + 
       academicReport.qualityScore + 
       selReport.qualityScore + 
       talentsReport.qualityScore + 
       healthReport.qualityScore + 
       motivationReport.qualityScore + 
       riskReport.qualityScore) / 7
    );
    
    const criticalWarnings: string[] = [];
    const actionItems: string[] = [];
    
    // Kritik uyarıları topla
    [basicReport, academicReport, selReport, talentsReport, healthReport, motivationReport, riskReport].forEach(report => {
      if (report.missingCriticalFields.length > 0) {
        criticalWarnings.push(`${report.profileType}: ${report.missingCriticalFields.join(', ')} eksik`);
      }
      if (report.dataQualityIssues.length > 0) {
        report.dataQualityIssues.forEach(issue => {
          criticalWarnings.push(`${report.profileType}: ${issue}`);
        });
      }
    });
    
    // Eylem planı oluştur
    [basicReport, academicReport, selReport, talentsReport, healthReport, motivationReport, riskReport].forEach(report => {
      report.recommendations.forEach(rec => {
        actionItems.push(`${report.profileType}: ${rec}`);
      });
    });
    
    return {
      studentId: student.id,
      overallQuality,
      profiles: {
        basic: basicReport,
        academic: academicReport,
        socialEmotional: selReport,
        talentsInterests: talentsReport,
        health: healthReport,
        motivation: motivationReport,
        riskProtective: riskReport
      },
      criticalWarnings,
      actionItems
    };
  }
  
  private validateTalentsInterestsProfile(profile: any): ProfileQualityReport {
    if (!profile) {
      return {
        profileType: 'Yetenek ve İlgi Profili',
        qualityScore: 0,
        status: 'incomplete',
        missingCriticalFields: ['Profil oluşturulmamış'],
        missingOptionalFields: [],
        dataQualityIssues: [],
        recommendations: ['Yetenek ve ilgi profili oluşturulmalı']
      };
    }
    
    const score = 50; // Basit skor
    return {
      profileType: 'Yetenek ve İlgi Profili',
      qualityScore: score,
      status: this.getQualityStatus(score),
      missingCriticalFields: [],
      missingOptionalFields: [],
      dataQualityIssues: [],
      recommendations: []
    };
  }
  
  private validateMotivationProfile(profile: any): ProfileQualityReport {
    if (!profile) {
      return {
        profileType: 'Motivasyon Profili',
        qualityScore: 0,
        status: 'incomplete',
        missingCriticalFields: ['Profil oluşturulmamış'],
        missingOptionalFields: [],
        dataQualityIssues: [],
        recommendations: ['Motivasyon profili oluşturulmalı']
      };
    }
    
    const score = 50;
    return {
      profileType: 'Motivasyon Profili',
      qualityScore: score,
      status: this.getQualityStatus(score),
      missingCriticalFields: [],
      missingOptionalFields: [],
      dataQualityIssues: [],
      recommendations: []
    };
  }
  
  private validateRiskProtectiveProfile(profile: any): ProfileQualityReport {
    if (!profile) {
      return {
        profileType: 'Risk ve Koruyucu Faktörler',
        qualityScore: 0,
        status: 'incomplete',
        missingCriticalFields: ['Profil oluşturulmamış'],
        missingOptionalFields: [],
        dataQualityIssues: [],
        recommendations: ['Risk değerlendirmesi yapılmalı']
      };
    }
    
    const score = 50;
    return {
      profileType: 'Risk ve Koruyucu Faktörler',
      qualityScore: score,
      status: this.getQualityStatus(score),
      missingCriticalFields: [],
      missingOptionalFields: [],
      dataQualityIssues: [],
      recommendations: []
    };
  }
}

export default ProfileQualityValidator;
