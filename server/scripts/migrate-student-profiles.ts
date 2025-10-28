/**
 * Student Profile Migration Script
 * Öğrenci Profil Göç Scripti
 * 
 * Mevcut tüm öğrenciler için eksik profilleri oluşturur
 */

import getDatabase from '../lib/database.js';
import AutoProfileInitializer from '../services/auto-profile-initializer.service.js';
import UnifiedScoringEngine from '../services/unified-scoring-engine.service.js';

async function migrateStudentProfiles() {
  console.log('🚀 Öğrenci profil migrasyonu başlatılıyor...\n');
  
  const db = getDatabase();
  const profileInitializer = new AutoProfileInitializer();
  const scoringEngine = new UnifiedScoringEngine();
  
  try {
    // Tüm öğrencileri al
    const studentsStmt = db.prepare('SELECT id, name FROM students');
    const students = studentsStmt.all() as { id: string; name: string }[];
    
    console.log(`📊 Toplam ${students.length} öğrenci bulundu.\n`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const student of students) {
      try {
        console.log(`\n📝 İşleniyor: ${student.name} (${student.id})`);
        
        // Mevcut profilleri kontrol et
        const existingProfiles = await profileInitializer.checkProfilesExist(student.id);
        
        const missingProfiles: string[] = [];
        if (!existingProfiles.academic) missingProfiles.push('Akademik');
        if (!existingProfiles.socialEmotional) missingProfiles.push('Sosyal-Duygusal');
        if (!existingProfiles.talentsInterests) missingProfiles.push('Yetenek & İlgi');
        if (!existingProfiles.health) missingProfiles.push('Sağlık');
        if (!existingProfiles.motivation) missingProfiles.push('Motivasyon');
        if (!existingProfiles.riskProtective) missingProfiles.push('Risk & Koruyucu Faktörler');
        
        if (missingProfiles.length > 0) {
          console.log(`  ⚠️  Eksik profiller: ${missingProfiles.join(', ')}`);
          
          // Eksik profilleri oluştur
          await profileInitializer.initializeMissingProfiles(student.id, 'MIGRATION_SCRIPT');
          console.log(`  ✅ Eksik profiller oluşturuldu`);
        } else {
          console.log(`  ✓ Tüm profiller mevcut`);
        }
        
        // Skorları hesapla ve kaydet
        try {
          const scores = await scoringEngine.calculateUnifiedScores(student.id);
          await scoringEngine.saveAggregateScores(student.id, scores);
          console.log(`  ✅ Skorlar hesaplandı ve kaydedildi`);
          console.log(`     - Akademik: ${scores.akademikSkor}`);
          console.log(`     - Sosyal-Duygusal: ${scores.sosyalDuygusalSkor}`);
          console.log(`     - Davranışsal: ${scores.davranissalSkor}`);
          console.log(`     - Motivasyon: ${scores.motivasyonSkor}`);
          console.log(`     - Risk: ${scores.riskSkoru}`);
        } catch (scoreError) {
          console.log(`  ⚠️  Skor hesaplama hatası: ${scoreError instanceof Error ? scoreError.message : 'Unknown error'}`);
        }
        
        processedCount++;
        
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Hata: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migrasyon Özeti:');
    console.log(`  ✅ Başarılı: ${processedCount}`);
    console.log(`  ✗ Hata: ${errorCount}`);
    console.log(`  📈 Toplam: ${students.length}`);
    console.log('='.repeat(60) + '\n');
    
    console.log('✨ Migrasyon tamamlandı!\n');
    
  } catch (error) {
    console.error('\n❌ Kritik hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateStudentProfiles()
    .then(() => {
      console.log('👋 İşlem başarıyla tamamlandı.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export default migrateStudentProfiles;
