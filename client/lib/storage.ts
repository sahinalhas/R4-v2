export * from "./types/student.types";
export * from "./types/common.types";
export * from "./types/attendance.types";
export * from "./types/academic.types";
export * from "./types/study.types";
export * from "./types/coaching.types";
export * from "./types/family.types";

export type { SpecialEducation } from "@shared/types";

export * from "./api/endpoints/students.api";
export * from "./api/endpoints/notes.api";
export * from "./api/endpoints/documents.api";
export * from "./api/endpoints/attendance.api";
export * from "./api/endpoints/academic.api";
export * from "./api/endpoints/survey.api";
export * from "./api/endpoints/study.api";
export * from "./api/endpoints/coaching.api";
export * from "./api/endpoints/family.api";
export * from "./api/endpoints/risk.api";
export * from "./api/endpoints/student-profile.api";

export * from "./utils/templates";
export * from "./utils/study-planning";

export function defaultSeed() {
  return [
    {
      id: "1001",
      ad: "Ayşe",
      soyad: "Yılmaz",
      class: "9/A",
      cinsiyet: "K",
      risk: "Düşük",
      telefon: "+90 555 111 22 33",
      veliAdi: "Fatma Yılmaz",
      veliTelefon: "+90 555 000 11 22",
    },
    {
      id: "1002",
      ad: "Mehmet",
      soyad: "Demir",
      class: "10/B",
      cinsiyet: "E",
      risk: "Orta",
      telefon: "+90 555 333 44 55",
    },
    {
      id: "1003",
      ad: "Zeynep",
      soyad: "Kaya",
      class: "11/C",
      cinsiyet: "K",
      risk: "Yüksek",
    },
    {
      id: "1004",
      ad: "Ali",
      soyad: "Çelik",
      class: "12/A",
      cinsiyet: "E",
      risk: "Düşük",
    },
  ];
}
