import { SurveyQuestionType, MEB_SURVEY_TEMPLATES } from "@/lib/survey-types";

export interface MebQuestion {
  questionText: string;
  questionType: SurveyQuestionType;
  required: boolean;
  options?: string[];
}

const commonQuestions: MebQuestion[] = [
  {
    questionText: "Bu anketi doldurduğunuz sınıf düzeyinizi belirtiniz.",
    questionType: "DROPDOWN",
    required: true,
    options: ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
  },
  {
    questionText: "Cinsiyetinizi belirtiniz.",
    questionType: "MULTIPLE_CHOICE",
    required: true,
    options: ["Kız", "Erkek"],
  }
];

export function getMebDefaultQuestions(templateKey: keyof typeof MEB_SURVEY_TEMPLATES): MebQuestion[] {
  switch (templateKey) {
    case "OGRENCI_MEMNUNIYET":
      return [
        ...commonQuestions,
        {
          questionText: "Okulunuzdan genel olarak ne kadar memnunsunuz?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Öğretmenlerinizin ders anlatımından ne kadar memnunsunuz?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Okul imkanlarından (kütüphane, laboratuvar, spor salonu vb.) ne kadar memnunsunuz?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Okul yönetiminin öğrencilere yaklaşımından memnun musunuz?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Okulunuzda verilen rehberlik hizmetlerinden memnun musunuz?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Okul kantin ve yemek hizmetlerinden memnun musunuz?",
          questionType: "LIKERT",
          required: false,
        },
        {
          questionText: "Okulunuzla ilgili öneriniz var mı? (İsteğe bağlı)",
          questionType: "OPEN_ENDED",
          required: false,
        }
      ];
    
    case "OGRETMEN_DEGERLENDIRME":
      return [
        ...commonQuestions,
        {
          questionText: "Değerlendireceğiniz öğretmenin dersi:",
          questionType: "DROPDOWN",
          required: true,
          options: ["Matematik", "Türkçe", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Diğer"],
        },
        {
          questionText: "Öğretmeniniz dersi etkili bir şekilde anlatıyor mu?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Öğretmeniniz sorularınızı sabırla yanıtlıyor mu?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Öğretmeniniz derste teknoloji ve materyal kullanıyor mu?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Öğretmeniniz sınıf disiplinini sağlıyor mu?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Öğretmeniniz ödevleri düzenli kontrol ediyor mu?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Bu öğretmen hakkında eklemek istediğiniz görüş:",
          questionType: "OPEN_ENDED",
          required: false,
        }
      ];

    case "OKUL_IKLIMI":
      return [
        ...commonQuestions,
        {
          questionText: "Okulunuzda kendinizi güvende hissediyor musunuz?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Arkadaşlarınızla ilişkiniz nasıl?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Okul kuralları adil bir şekilde uygulanıyor mu?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Okulda zorbalık yaşıyor musunuz?",
          questionType: "YES_NO",
          required: true,
        },
        {
          questionText: "Öğretmenleriniz sizinle saygılı bir şekilde konuşuyor mu?",
          questionType: "LIKERT",
          required: true,
        }
      ];

    case "REHBERLIK_IHTIYAC":
      return [
        ...commonQuestions,
        {
          questionText: "Hangi konularda rehberlik desteğine ihtiyaç duyuyorsunuz? (Birden fazla seçebilirsiniz)",
          questionType: "MULTIPLE_CHOICE",
          required: true,
          options: ["Ders çalışma teknikleri", "Sınav kaygısı", "Meslek seçimi", "Arkadaş ilişkileri", "Aile sorunları", "Kişisel gelişim"],
        },
        {
          questionText: "Rehber öğretmeninizle görüşme sıklığınız:",
          questionType: "DROPDOWN",
          required: true,
          options: ["Hiç görüşmedim", "Ayda bir", "Haftada bir", "İhtiyaç duyduğumda", "Düzenli aralıklarla"],
        },
        {
          questionText: "Rehberlik hizmetlerinden ne kadar memnunsunuz?",
          questionType: "LIKERT",
          required: true,
        }
      ];

    case "AKADEMIK_BASARI":
      return [
        ...commonQuestions,
        {
          questionText: "Genel akademik başarınızı nasıl değerlendiriyorsunuz?",
          questionType: "DROPDOWN",
          required: true,
          options: ["Çok başarılı", "Başarılı", "Orta", "Düşük", "Çok düşük"],
        },
        {
          questionText: "Hangi derslerde daha başarılısınız? (Birden fazla seçebilirsiniz)",
          questionType: "MULTIPLE_CHOICE",
          required: true,
          options: ["Matematik", "Türkçe", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Sanat dersleri", "Beden eğitimi"],
        },
        {
          questionText: "Ders çalışmaya ne kadar zaman ayırıyorsunuz?",
          questionType: "DROPDOWN",
          required: true,
          options: ["1 saatten az", "1-2 saat", "2-3 saat", "3-4 saat", "4 saatten fazla"],
        },
        {
          questionText: "Ödevlerinizi düzenli yapıyor musunuz?",
          questionType: "LIKERT",
          required: true,
        }
      ];

    case "SOSYAL_BECERI":
      return [
        ...commonQuestions,
        {
          questionText: "Arkadaşlarınızla iletişim kurma becerinizi nasıl değerlendiriyorsunuz?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Grup çalışmalarında aktif rol alır mısınız?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Okul etkinliklerine katılım düzeyiniz:",
          questionType: "DROPDOWN",
          required: true,
          options: ["Hiç katılmam", "Nadiren", "Bazen", "Sık sık", "Her zaman"],
        },
        {
          questionText: "Liderlik özellikleriniz gelişmiş midir?",
          questionType: "LIKERT",
          required: true,
        }
      ];

    case "TEKNOLOJI_KULLANIMI":
      return [
        ...commonQuestions,
        {
          questionText: "Teknoloji kullanımında kendinizi nasıl değerlendiriyorsunuz?",
          questionType: "DROPDOWN",
          required: true,
          options: ["Çok iyi", "İyi", "Orta", "Zayıf", "Çok zayıf"],
        },
        {
          questionText: "Hangi teknolojik araçları aktif kullanıyorsunuz? (Birden fazla seçebilirsiniz)",
          questionType: "MULTIPLE_CHOICE",
          required: true,
          options: ["Bilgisayar", "Tablet", "Akıllı telefon", "Akıllı tahta", "Eğitim yazılımları"],
        },
        {
          questionText: "Derslerde teknoloji kullanımı size yardımcı oluyor mu?",
          questionType: "LIKERT",
          required: true,
        }
      ];

    case "OKUL_GUVENLIGI":
      return [
        ...commonQuestions,
        {
          questionText: "Okulunuzun fiziki güvenliği hakkında ne düşünüyorsunuz?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Okul kuralları size uygun mu?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Disiplin sorunlarıyla karşılaştığınızda adaletli davranılıyor mu?",
          questionType: "LIKERT",
          required: true,
        },
        {
          questionText: "Güvenlik konusunda önerileriniz:",
          questionType: "OPEN_ENDED",
          required: false,
        }
      ];
      
    default:
      return commonQuestions;
  }
}
