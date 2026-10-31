import type { Dictionary } from "../../types";

/** "Why this number?" entries for M6 steps (placeholders: see en/explain-m6.ts). */
export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "Skor risiko",
    body: "Masing-masing dari empat jawaban bernilai 0 sampai 2: kelompok usia {ageBandCount}, penghasilan {incomeCount}, kapan Anda butuh uangnya {horizonCount}, dan apa yang Anda lakukan bila investasi turun 20% {reactionCount}. Totalnya: {result} dari 8. 0 sampai 3 Konservatif, 4 sampai 5 Seimbang, 6 sampai 8 Pertumbuhan.",
  },
  equity: {
    title: "Porsi saham",
    body: "Profil Anda dimulai dari {startShare} saham sampai usia 30, lalu berkurang satu poin untuk setiap tahun sesudahnya, tetapi tidak pernah di bawah {floorShare}: di usia {ageYears} itu menjadi {ageEquityShare}, dan tidak pernah di atas batas {capShare}. Uang yang dibutuhkan dalam {noEquityYears} tahun tidak memuat saham, dan dalam {cashOnlyYears} tahun hanya deposito atau surat perbendaharaan; uang Anda dibutuhkan dalam {horizonYears} tahun. Saham: {result}.",
  },
  gold: {
    title: "Porsi emas",
    body: "Emas adalah lindung nilai, bukan taruhan: pilihan Anda {chosenShare}, dijaga antara {minShare} dan {maxShare}. Emas: {result}.",
  },
  fixedIncome: {
    title: "Porsi pendapatan tetap",
    body: "Semua yang bukan saham atau emas: 100% − {equityShare} − {goldShare} = {result}.",
  },
  mixLow: {
    title: "Imbal hasil komposisi, skenario rendah",
    body: "Imbal hasil tahunan skenario rendah tiap bagian, dibobot dengan porsinya: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} per tahun.",
  },
  mixBase: {
    title: "Imbal hasil komposisi, skenario dasar",
    body: "Imbal hasil tahunan skenario dasar tiap bagian, dibobot dengan porsinya: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} per tahun. Skenario dasar saham sengaja ditetapkan tidak lebih tinggi dari instrumen yang aman.",
  },
  mixHigh: {
    title: "Imbal hasil komposisi, skenario tinggi",
    body: "Imbal hasil tahunan skenario tinggi tiap bagian, dibobot dengan porsinya: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} per tahun.",
  },
  fv: {
    title: "Bisa tumbuh jadi berapa (skenario dasar)",
    body: "{monthly} sebulan dan {lumpSum} hari ini, tumbuh {mixRate} per tahun ({monthlyRate} per bulan) selama {years} tahun. Anda menyetor {paidIn}; di akhir Anda bisa memiliki {result}. Skenario rendah dan tinggi memakai imbal hasil komposisinya sendiri.",
  },
  real: {
    title: "Dalam nilai uang hari ini",
    body: "Harga juga naik. {fv} dibagi (1 + {inflation})^{years} = {result} menurut daya beli uang hari ini.",
  },
  trade: {
    title: "Transaksi penyeimbangan ulang",
    body: "Anda memiliki {holdingsTotal} dan menambah {newMoney}, jadi total barunya {result}. Target tiap bagian adalah porsinya dari total itu ({equityShare}, {goldShare}, {fixedIncomeShare}) dikurangi yang dimilikinya sekarang: saham {equityTrade}, emas {goldTrade}, pendapatan tetap {fixedIncomeTrade} (plus = beli, minus = jual). Uang baru masuk lebih dulu ke bagian yang tertinggal, dan bagian yang menyimpang lebih dari {driftBandShare} dari target adalah tanda untuk menyeimbangkan ulang.",
  },
};
