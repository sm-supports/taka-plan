import type { Dictionary } from "../../types";

/** /{locale}/about: title, lead, methodology and the sources-table chrome (see en/about.ts). */
export const about: Dictionary["about"] = {
  title: "Tentang Taka Plan",
  lead: "Kalkulator gratis yang memberi tahu Anda berapa yang dibutuhkan tiap tujuan dan ke mana menaruh uangnya setiap bulan. Aplikasi ini mengajarkan dan menghitung; Anda yang bertindak melalui bank, pialang, atau perusahaan asuransi Anda sendiri.",
  disclaimer: { heading: "Penafian" },
  method: {
    heading: "Cara rencana disusun",
    intro: "Rencana mengikuti tujuh langkah dengan urutan tetap: lindungi dulu, lalu tabung, lalu kembangkan. Tiap langkah adalah satu kalkulator kecil, dan bersama-sama menghasilkan satu jumlah bulanan.",
    phase: { protect: "Lindungi", save: "Tabung", grow: "Kembangkan" },
    order:
      "Jumlah bulanan Anda diisi menurut prioritas: dana darurat dulu, lalu premi asuransi, lalu utang mahal, dan baru kemudian tujuan dan pensiun. Selama dana darurat belum penuh, setidaknya {share} dari jumlah bulanan masuk ke sana, jadi sisanya tetap memulai kebiasaan berinvestasi Anda hari ini.",
    returnsHeading: "Imbal hasil setelah pajak dan setelah inflasi",
    returns:
      "Setiap imbal hasil ditampilkan setelah dua kali dipotong: pertama setelah pajak yang dipotong langsung, lalu setelah inflasi. Yang penting bukan bunga tertera, melainkan berapa yang Anda simpan dan apa yang masih bisa dibelinya. Sebuah instrumen bisa memberi bunga tetapi tetap kalah dari inflasi, dan aplikasi menandainya dengan merah bila itu terjadi.",
    exampleCaption: "Dengan tabel suku bunga hari ini:",
    rounding: "Hasil dibulatkan ke angka bulat terdekat karena proyeksi dua puluh tahun tidak pernah tepat sampai satuan terkecil. Rentang (rendah, perkiraan, tinggi) ditampilkan bila imbal hasil masa depan tidak pasti.",
    onDevice: "Semua perhitungan berjalan di ponsel Anda, dan jawaban Anda tetap di sana. Server hanya menyimpan tabel suku bunga dan data tiap negara.",
  },
  sources: {
    heading: "Sumber dan asumsi",
    intro: "Setiap baris di bawah adalah satu asumsi yang dibaca kalkulator. Versi suku bunga {version}, terbit {date}. Baris bertanda “asumsi kami” adalah nilai bawaan yang kami pilih dan bisa berubah; sisanya disalin dari sumber resmi yang ditautkan di sampingnya.",
    group: {
      macro: "Inflasi dan suku bunga acuan",
      bank: "Simpanan bank",
      sanchayapatra: "Sanchayapatra",
      govt: "Surat berharga negara",
      market: "Saham dan emas",
      risk: "Kredit, asuransi, dan harapan hidup",
      tax: "Aturan pajak (FY2026-27)",
      policy: "Nilai bawaan aplikasi",
      other: "Lainnya",
    },
    value: "Nilai",
    dates: "Tanggal",
    nextReview: "Tinjauan berikutnya",
    note: "Catatan",
    slabNext: "{rate} untuk {width} berikutnya",
    slabRest: "{rate} untuk sisanya",
    unverifiedHeading: "Belum terverifikasi",
    unverifiedIntro: "Kami belum bisa memastikan hal-hal ini, jadi belum ada kalkulator yang memakainya:",
    unverified: [
      "Premi asuransi jiwa berjangka saat ini untuk pertanggungan 10 lakh dan 1 crore.",
      "Batas investasi Sanchayapatra untuk 2026.",
      "Apakah keringanan pajak bagi investor kecil Sanchayapatra masih berlaku setelah Finance Act.",
      "Rasio EMI terhadap penghasilan dari Bangladesh Bank (tampaknya tidak ada; kami memakai ambang batas sendiri).",
      "Suku bunga pinjaman pribadi dan KPR di seluruh pasar.",
    ],
  },
};
