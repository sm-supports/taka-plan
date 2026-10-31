import type { Dictionary } from "../../types";

export const errors: Dictionary["errors"] = {
  generic: "Terjadi kesalahan. Silakan coba lagi.",
  offline: "Anda sedang offline. Suku bunga tersimpan sedang dipakai; sambungkan lagi untuk yang terbaru.",
  engineNotReady: "Kalkulator ini masih disiapkan.",
  invalidInput: "Beberapa angka ini tidak cocok. Periksa lalu coba lagi.",
  missingRate: "Suku bunga yang dibutuhkan kalkulator ini tidak ada. Silakan coba lagi nanti.",
  notFound: "Halaman itu tidak ditemukan.",
  unauthorized: "Anda perlu masuk untuk melihat halaman ini.",
  ratesUnavailable: "Tabel suku bunga tidak bisa dimuat. Periksa koneksi Anda lalu coba lagi.",
};
