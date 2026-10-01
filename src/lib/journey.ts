export type JourneyTag = "Achievement" | "Community" | "On Going";

export interface JourneyItem {
  year: number;
  title: string;
  /** Short uppercase label that fits on the departure board (max 21 characters). */
  board: string;
  description: string;
  tag: JourneyTag;
}

export const journeyItems: JourneyItem[] = [
  {
    year: 2024,
    title: "Juara 1 Provinsi & Finalis Nasional FLS2N",
    board: "FLS2N FINALIST",
    description:
      "Meraih Juara 1 tingkat Provinsi Bali dan maju sebagai Finalis Nasional FLS2N 2024 dalam bidang Film Pendek, menggabungkan storytelling, sinematografi, dan kreativitas teknis di panggung nasional.",
    tag: "Achievement",
  },
  {
    year: 2024,
    title: "Member, Google Developer Group on Campus",
    board: "GDG ON CAMPUS",
    description:
      "Bergabung sebagai member Study Group Google Developer Group on Campus Telkom University, mendalami jalur Backend Developer dan mengeksplorasi ekosistem teknologi Google bersama komunitas developer kampus.",
    tag: "Community",
  },
  {
    year: 2024,
    title: "Member, CCI (Central Computer Improvement)",
    board: "CCI TELKOM UNIV",
    description:
      "Aktif sebagai anggota CCI Telkom University, organisasi berbasis teknologi kampus dengan fokus pada Backend Development. Membangun fondasi solid di arsitektur sistem dan pengembangan API.",
    tag: "Community",
  },
  {
    year: 2025,
    title: "Talent Community, Prodigi",
    board: "PRODIGI TALENT",
    description:
      "Terpilih sebagai talent community di Prodigi, memperdalam ilmu di bidang Data Mining dan Inovasi Pengembangan Perangkat Lunak, menggabungkan kemampuan analitik dengan engineering.",
    tag: "Community",
  },
  {
    year: 2025,
    title: "Festival AI Nusantara, Microsoft Elevate",
    board: "FESTIVAL AI NUSANTARA",
    description:
      "Inovasi FirStep lolos seleksi dan dipamerkan di Festival AI Nusantara by Microsoft Elevate: sebuah platform AI simulator karier untuk mahasiswa Indonesia yang diakui di tingkat nasional.",
    tag: "Achievement",
  },
  {
    year: 2025,
    title: "Software Engineering Bootcamp, RevoU",
    board: "REVOU BOOTCAMP",
    description:
      "Sedang menjalani Software Engineering x AI Bootcamp di RevoU, memperdalam full-stack engineering dengan pendekatan berbasis industri dan AI.",
    tag: "On Going",
  },
  {
    year: 2026,
    title: "Seleksi Internal GEMASTIK XVIII, Data Mining",
    board: "GEMASTIK XVIII",
    description:
      "Lolos seleksi internal Telkom University untuk GEMASTIK XVIII kategori Data Mining sebagai ketua tim, dengan riset analisis sentimen aplikasi e-government memakai IndoBERT dan SVM.",
    tag: "Achievement",
  },
];
