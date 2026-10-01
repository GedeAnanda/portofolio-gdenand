/*
 * Data for the GEMASTIK section. The numbers come from the team's paper; the
 * reviews in the game are written for it, in the style of the dataset, and the
 * model's verdict on each one is illustrative.
 */

export type Label = "neg" | "pos";

export interface Review {
  app: "M-Pajak" | "Mobile JKN" | "MyPertamina" | "SIGNAL";
  text: string;
  truth: Label;
  model: Label;
  /** Why the model slipped, for the reviews it gets wrong. */
  why?: string;
}

export const reviews: Review[] = [
  { app: "M-Pajak", text: "Mau lapor SPT malah gagal login terus, OTP nggak pernah masuk ke email.", truth: "neg", model: "neg" },
  { app: "M-Pajak", text: "Aplikasinya ribet banget, verifikasi wajah gagal berkali-kali.", truth: "neg", model: "neg" },
  { app: "M-Pajak", text: "Tiap mau bayar pajak muncul error, kode billing nggak keluar.", truth: "neg", model: "neg" },
  { app: "Mobile JKN", text: "Antrean online penuh terus dari jam 6 pagi, susah dapat jadwal.", truth: "neg", model: "neg" },
  { app: "Mobile JKN", text: "Sudah update tapi aplikasinya force close pas buka kartu peserta.", truth: "neg", model: "neg" },
  { app: "MyPertamina", text: "Daftar subsidi harus upload foto berkali-kali, gagal verifikasi terus.", truth: "neg", model: "neg" },
  { app: "MyPertamina", text: "Barcode nggak muncul pas di SPBU, akhirnya antre ulang dari belakang.", truth: "neg", model: "neg" },
  { app: "SIGNAL", text: "Pembayaran pajak kendaraan sudah terpotong tapi status masih belum lunas.", truth: "neg", model: "neg" },
  { app: "SIGNAL", text: "Data kendaraan nggak ketemu padahal plat dan NIK sudah benar.", truth: "neg", model: "neg" },
  { app: "Mobile JKN", text: "Ganti faskes harus nunggu tiga bulan, aplikasinya juga lemot.", truth: "neg", model: "neg" },

  { app: "SIGNAL", text: "Bayar pajak motor tinggal klik, e-TBPKP langsung jadi. Mantap.", truth: "pos", model: "pos" },
  { app: "Mobile JKN", text: "Ambil antrean dari rumah, sampai puskesmas langsung dipanggil. Membantu banget.", truth: "pos", model: "pos" },
  { app: "MyPertamina", text: "QR code langsung jadi setelah daftar, isi BBM jadi cepat.", truth: "pos", model: "pos" },
  { app: "SIGNAL", text: "Nggak perlu ke Samsat lagi, prosesnya kurang dari sepuluh menit.", truth: "pos", model: "pos" },
  { app: "Mobile JKN", text: "Fitur cek tagihan dan riwayat berobat jelas, tampilannya rapi.", truth: "pos", model: "pos" },
  { app: "M-Pajak", text: "Lapor SPT tahunan lancar, panduannya gampang diikuti.", truth: "pos", model: "pos" },
  { app: "MyPertamina", text: "Poin reward-nya lumayan, bayar nontunai juga praktis.", truth: "pos", model: "pos" },
  { app: "Mobile JKN", text: "Konsultasi dokter online sangat membantu waktu anak sakit malam-malam.", truth: "pos", model: "pos" },
  { app: "SIGNAL", text: "Notifikasi jatuh tempo pajak berguna, jadi nggak telat bayar.", truth: "pos", model: "pos" },
  { app: "M-Pajak", text: "Setelah update terbaru, login pakai NIK jadi jauh lebih cepat.", truth: "pos", model: "pos" },

  {
    app: "M-Pajak",
    text: "Hebat sekali, tiga hari mencoba login dan sukses gagal terus. Terima kasih.",
    truth: "neg",
    model: "pos",
    why: "Sarcasm. Words like “hebat” and “sukses” pull TF-IDF toward positive.",
  },
  {
    app: "MyPertamina",
    text: "Mantap, mau beli solar aja harus jadi ahli IT dulu.",
    truth: "neg",
    model: "pos",
    why: "Sarcasm again: “mantap” is one of the strongest positive words in the data.",
  },
  {
    app: "Mobile JKN",
    text: "Dulu ribet dan sering error, sekarang antrean online lancar dan nggak perlu nunggu lama.",
    truth: "pos",
    model: "neg",
    why: "The complaint is in the past tense, but “ribet” and “error” still weigh the most.",
  },
  {
    app: "SIGNAL",
    text: "Awalnya gagal bayar karena saldo kurang, salah saya sendiri. Aplikasinya oke.",
    truth: "pos",
    model: "neg",
    why: "“Gagal” and “salah” outweigh a short “oke” at the end.",
  },
];

export const ROUND = 12;

/** Eleven reviews the model gets right and one it gets wrong, shuffled. */
export function dealRound(): Review[] {
  const right = reviews.filter((r) => r.truth === r.model);
  const wrong = reviews.filter((r) => r.truth !== r.model);
  const pick = <T,>(list: T[], n: number) => [...list].sort(() => Math.random() - 0.5).slice(0, n);
  return pick([...pick(right, ROUND - 1), ...pick(wrong, 1)], ROUND);
}

/** SVM confusion matrix on the 775-review test set (rows: actual, columns: predicted). */
export const confusion = {
  neg: { neg: 356, pos: 31 },
  pos: { neg: 35, pos: 353 },
};

export const models = [
  { name: "SVM", accuracy: 91.48 },
  { name: "Naive Bayes", accuracy: 91.1 },
  { name: "Random Forest", accuracy: 90.32 },
];

/** Share of reviews labelled negative, per app. */
export const negativeShare = [
  { app: "M-Pajak", negative: 87.3 },
  { app: "Mobile JKN", negative: 41.7 },
  { app: "MyPertamina", negative: 37.0 },
  { app: "SIGNAL", negative: 32.8 },
];
