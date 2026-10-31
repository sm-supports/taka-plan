import type { Dictionary } from "../../types";

/** "Why this number?" entries for M7 steps (placeholders: see en/explain-m7.ts). */
export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "Pengeluaran di tahun pertama pensiun",
    body: "Pengeluaran hari ini {monthlySpending} sebulan, dikali 12, dinaikkan mengikuti harga sebesar {inflation} per tahun selama {retireInYears} tahun sampai Anda berhenti: 12 × {monthlySpending} × (1 + {inflation})^{retireInYears}. Sewa yang Anda terima dikurangkan lebih dulu, karena juga naik mengikuti harga. Hasil: {result} per tahun.",
  },
  corpusContrast: {
    title: "Target sampai usia pembanding",
    body: "Dana yang membayar {spendingAtRetirement} di tahun pertama, naik mengikuti harga ({inflation}), selama {retiredForYears} tahun sementara sisanya menghasilkan {returnRate} setelah pajak: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Ditampilkan hanya sebagai pembanding.",
  },
  corpusPlan: {
    title: "Target agar cukup sampai usia rencana",
    body: "Rumus yang sama selama {retiredForYears} tahun: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Inilah tepat dana yang dalam grafik tahunan habis menjadi nol di usia itu.",
  },
  savingsFv: {
    title: "Tabungan Anda saat berhenti",
    body: "Yang Anda miliki hari ini, {savings}, tetap diinvestasikan dengan {accumulationRate} per tahun selama {retireInYears} tahun: {savings} × (1 + {accumulationRate})^{retireInYears} = {result}.",
  },
  providentFund: {
    title: "Dana hari tua saat berhenti",
    body: "Saldo hari ini {balance} ditambah iuran {monthlyContribution} setiap bulan, keduanya tumbuh dengan bunga dana itu sendiri sebesar {fundRate} selama {retireInYears} tahun = {result}.",
  },
  gratuity: {
    title: "Pesangon",
    body: "Gaji pokok terakhir {basicMonthly} ÷ {daysPerMonthCount} hari × {daysCount} hari untuk setiap tahun dari {serviceYears} tahun masa kerja = {result}, dibayar sekaligus saat Anda keluar.",
  },
  fixedPensions: {
    title: "Uang pensiun tetap, dinilai saat berhenti",
    body: "Pensiun publik {publicPensionMonthly} sebulan mulai usia {pensionFromAgeYears} dan penghasilan tetap lain {fixedPensionMonthly} sebulan, dibayar sampai usia rencana Anda ({retiredForYears} tahun pensiun) tanpa naik mengikuti harga, bernilai sebesar ini saat Anda berhenti, dengan {returnRate}: {result}. Karena itulah daya belinya menyusut selama masa pensiun yang panjang.",
  },
  gap: {
    title: "Masih perlu dikumpulkan",
    body: "Target {corpus}, dikurangi semua yang sudah akan ada (tabungan, dana hari tua, pesangon, dan nilai uang pensiun tetap), tidak pernah di bawah nol: {result}.",
  },
  monthly: {
    title: "Tabungan bulanan",
    body: "Jumlah yang, dibayar setiap bulan selama {savingMonths} bulan dan tumbuh {monthlyRate} per bulan, terkumpul menjadi {gap}: {gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}, dibulatkan ke atas agar cukup.",
  },
  withdrawal: {
    title: "Penarikan tahun pertama",
    body: "Yang bisa dibayar {savings} di tahun pertama, naik mengikuti harga ({inflation}) setiap tahun sesudahnya, agar cukup selama {retiredForYears} tahun sambil menghasilkan {returnRate}: {savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}, dibulatkan ke bawah agar tidak pernah kurang.",
  },
  safePot: {
    title: "Wadah aman",
    body: "Penarikan tahun pertama {firstYear} dikali {potYears} tahun = {result}, disimpan di tempat yang aman dan cepat dicairkan.",
  },
};
