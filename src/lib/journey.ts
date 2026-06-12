export interface JourneyItem {
  year: number;
  title: string;
  description: string;
  side: "left" | "right";
  tag?: string;
}

export const journeyItems: JourneyItem[] = [
  {
    year: 2024,
    title: "Juara 1 Provinsi & Finalis Nasional FLS2N",
    description:
      "Meraih Juara 1 tingkat Provinsi Bali dan maju sebagai Finalis Nasional FLS2N 2024 dalam bidang Film Pendek — menggabungkan storytelling, sinematografi, dan kreativitas teknis di panggung nasional.",
    side: "left",
    tag: "Achievement",
  },
  {
    year: 2024,
    title: "Member — Google Developer Group on Campus",
    description:
      "Bergabung sebagai member Study Group Google Developer Group on Campus Telkom University, mendalami jalur Backend Developer dan mengeksplorasi ekosistem teknologi Google bersama komunitas developer kampus.",
    side: "right",
    tag: "Community",
  },
  {
    year: 2024,
    title: "Member — CCI (Central Computer Improvement)",
    description:
      "Aktif sebagai anggota CCI Telkom University, organisasi berbasis teknologi kampus dengan fokus pada Backend Development — membangun fondasi solid di arsitektur sistem dan pengembangan API.",
    side: "left",
    tag: "Community",
  },
  {
    year: 2025,
    title: "Talent Community — Prodigi",
    description:
      "Terpilih sebagai talent community di Prodigi, memperdalam ilmu di bidang Data Mining dan Inovasi Pengembangan Perangkat Lunak — menggabungkan kemampuan analitik dengan engineering.",
    side: "right",
    tag: "Community",
  },
  {
    year: 2025,
    title: "Festival AI Nusantara — Microsoft Elevate",
    description:
      "Inovasi FirStep lolos seleksi dan dipamerkan di Festival AI Nusantara by Microsoft Elevate — sebuah platform AI simulator karier untuk mahasiswa Indonesia yang diakui di tingkat nasional.",
    side: "left",
    tag: "Achievement",
  },
  {
    year: 2025,
    title: "Software Engineering Bootcamp — RevoU",
    description:
      "Sedang menjalani Software Engineering x AI Bootcamp di RevoU — memperdalam full-stack engineering dengan pendekatan berbasis industri dan AI. Ongoing.",
    side: "right",
    tag: "On Going",
  },
];
