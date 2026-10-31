import type { Dictionary } from "../../types";

/** "Why this number?" entries for M2 steps (placeholders: see en/explain-m2.ts). */
export const explainM2: Dictionary["explain"]["m2"] = {
  years: {
    title: "Tahun perlindungan",
    body: "Perlindungan jiwa berjalan dari usia Anda hari ini, {ageYears}, sampai usia {coverToAgeYears}, saat keluarga biasanya tidak lagi bergantung pada penghasilan Anda, atau sampai anak bungsu Anda berusia {childIndependentAgeYears} bila Anda mengisi usia anak dan itu lebih dulu: {result} tahun. Tidak pernah di bawah nol.",
  },
  incomeNeed: {
    title: "Penghasilan yang perlu digantikan",
    body: "Keluarga akan butuh {incomeShare} dari penghasilan bersih Anda {takeHome} sebulan: {yearlyNeed} setahun. Kebutuhan itu naik mengikuti harga sebesar {inflation} per tahun selama {coveredYears} tahun. Uang yang disimpan hari ini di tabungan aman bisa menghasilkan {afterTax} setelah pajak, yaitu {realRate} per tahun di atas kenaikan harga, jadi jumlah sekaligus hari ini yang membiayai kebutuhan setiap tahun, mulai sekarang, adalah {result}.",
  },
  lifeCover: {
    title: "Perlindungan jiwa yang dibutuhkan",
    body: "Penghasilan yang perlu digantikan {incomeNeed}, ditambah utang {debts} dan tujuan pendidikan {educationGoals}, dikurangi tabungan yang bisa diambil keluarga {liquidSavings} dan investasi {investments}: {result}. Tidak pernah di bawah nol.",
  },
  lifeGap: {
    title: "Perlindungan jiwa yang masih perlu dibeli",
    body: "Perlindungan yang dibutuhkan dikurangi perlindungan yang sudah Anda punya: {cover} − {existingLifeCover} = {result}.",
  },
  perStay: {
    title: "Perlindungan kesehatan per orang dewasa",
    body: "Satu kali rawat inap biasanya memakan sekitar {hospitalCost}. Keluarga membayar sendiri {oopShare} dari biaya kesehatan; kami memakai setidaknya {publicFloorShare}, jadi kami ambil {appliedShare}: perlindungan {result} per orang dewasa.",
  },
  healthTarget: {
    title: "Perlindungan kesehatan untuk keluarga",
    body: "Perlindungan per orang dewasa {perStay} dikali bobot {peopleCount} orang yang ditanggung, total {weightCount} (anak dihitung lebih kecil dari orang dewasa, orang tua lebih besar): {result}.",
  },
  healthGap: {
    title: "Perlindungan kesehatan yang masih perlu dibeli",
    body: "Target keluarga dikurangi perlindungan kesehatan yang sudah Anda punya: {target} − {existingHealthCover} = {result}.",
  },
  lifePremium: {
    title: "Premi asuransi jiwa berjangka per tahun",
    body: "Asuransi jiwa berjangka kira-kira {bandLow} sampai {bandHigh} per tahun untuk setiap {per} perlindungan di usia Anda, dikali {smokerMultipleCount} untuk perokok. Untuk perlindungan {gap} itu berarti {premiumLow} sampai {premiumHigh} per tahun; nilai tengahnya {result}.",
  },
  healthPremium: {
    title: "Premi asuransi kesehatan per tahun",
    body: "Harga asuransi kesehatan dihitung per setiap {per} perlindungan, menurut usia tiap orang. Untuk tambahan perlindungan {gap} bagi {peopleCount} orang itu berarti {premiumLow} sampai {premiumHigh} per tahun; nilai tengahnya {result}.",
  },
  monthlyNeed: {
    title: "Yang disisihkan setiap bulan",
    body: "Nilai tengah kedua rentang tahunan, asuransi jiwa berjangka {lifePremium} ditambah kesehatan {healthPremium}, dibagi ke {months} bulan: {result} sebulan.",
  },
  policyTerm: {
    title: "Asuransi berjangka untuk jumlah yang sama",
    body: "Asuransi jiwa berjangka untuk perlindungan polis {sumAssured} kira-kira {bandLow} sampai {bandHigh} per tahun untuk setiap {per} di usia Anda, dikali {smokerMultipleCount} untuk perokok. Nilai tengahnya {result} per tahun.",
  },
  policyInvest: {
    title: "Menabung selisihnya",
    body: "Bila Anda berhenti sekarang, yang dikembalikan perusahaan asuransi, {surrenderValue}, tumbuh menjadi {surrenderValueFV} di simpanan aman dengan hasil {afterTax} setelah pajak. Premi Anda {annualPremium} dikurangi premi berjangka {termPremium} menyisakan {yearlyDifference} per tahun; bila dimasukkan ke simpanan yang sama di awal setiap tahun selama {remainingYears} tahun tersisa, totalnya menjadi {result}.",
  },
  policyIrr: {
    title: "Imbal hasil tahunan polis",
    body: "Melanjutkan polis berarti melepas {surrenderValue} hari ini dan membayar {annualPremium} per tahun selama {remainingYears} tahun tersisa dari {termYears}, untuk mendapat {expectedMaturity} di akhir: sama seperti menghasilkan {result} per tahun atas uang itu. Berhenti dan menabung selisihnya akan mencapai {investValue}, selisih {difference}.",
  },
};
