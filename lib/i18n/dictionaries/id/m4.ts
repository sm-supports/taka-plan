import type { Dictionary } from "../../types";

/** M4 Save-first budget: income − savings = expenses. */
export const m4: Dictionary["m4"] = {
  title: "Anggaran menabung dulu",
  intro: "Balik rumusnya. Menabung dulu saat gajian; belanjakan sisanya. Kebiasaannya lebih penting daripada jumlahnya.",
  demo: "Angka contoh untuk pratinjau saja. Data Anda sendiri tidak dipakai di tampilan ini.",

  section: {
    inputs: "Angka Anda",
    result: "Anggaran Anda: menabung dulu",
    where: "Ke mana uangnya",
    nextStep: "Langkah berikutnya",
  },

  input: {
    takeHome: { label: "Penghasilan bersih bulanan", hint: "Yang benar-benar masuk ke rekening Anda." },
    essentials: { label: "Pengeluaran pokok bulanan", hint: "Sewa, makan, listrik dan air, transportasi, biaya sekolah, kiriman untuk orang tua, cicilan." },
    incomeType: { label: "Cara Anda mendapat penghasilan", hint: "Pekerja lepas dan pemilik usaha menabung sebagian dari tiap pembayaran, bukan jumlah tetap." },
    savingsRate: {
      label: "Porsi tabungan",
      hint: "Kami menyarankan {suggested} dari penghasilan bersih. Turunkan ke jumlah yang benar-benar bisa Anda jalani.",
      suggested: "Disarankan: {rate}",
      useSuggested: "Pakai saran",
    },
    payday: { label: "Tanggal gaji Anda masuk", hint: "Kami akan menyarankan transfer sehari setelahnya, sebelum uangnya terpakai." },
    last6Incomes: { label: "Penghasilan enam bulan terakhir", hint: "Satu angka per bulan. Kami memakai rata-ratanya sebagai penghasilan bersih Anda.", month: "Bulan {n}" },
  },

  result: {
    equation: "{income} − {savings} = {expenses}",
    equationLabel: "Penghasilan − tabungan = pengeluaran",
    averageIncome: "Rata-rata penghasilan bulanan",
    suggestedRate: "Porsi tabungan yang disarankan",
    feasibleRate: "Paling banyak yang bisa ditabung",
    feasibleRateHint: "Sisa setelah kebutuhan pokok, sebagai porsi dari penghasilan.",
    savingsRate: "Porsi tabungan",
    savingsAmount: "Tabung setiap bulan",
    expensesAllowed: "Sisa untuk dibelanjakan",
    essentialsShortfall: "Kebutuhan pokok melebihi anggaran sebesar",
    essentialsShortfallHint: "Kebutuhan pokok Anda lebih besar dari sisa setelah menabung. Turunkan porsinya, atau cari satu kebutuhan pokok yang bisa dikurangi.",
    modeLabel: "Cara Anda menabung",
    mode: {
      fixed: "Jumlah tetap setiap bulan",
      percentOfEachPayment: "Sebagian dari setiap pembayaran yang Anda terima",
    },
    percentOfEachPayment: "Pindahkan {percent} dari setiap pembayaran ke tabungan pada hari uangnya masuk",
    instrument: "Taruh di",
    instrumentHint: "Uangnya berpindah otomatis pada tanggal tetap, jadi tabungan terjadi sebelum sempat Anda belanjakan.",
    transferDay: "Transfer rutin pada tanggal {day} setiap bulan",
    transferDayUnknown: "Beri tahu tanggal gajian Anda dan kami akan menyarankan tanggal transfer.",
  },

  next: {
    dps: "Minta bank Anda membuka {product} dengan debit otomatis pada tanggal {day} setiap bulan, sehari setelah gaji masuk. Berapa pun jumlahnya tidak masalah; kebiasaannya lebih penting daripada besarnya.",
    dpsNoPayday: "Minta bank Anda membuka {product} dengan debit otomatis sehari setelah gaji masuk. Berapa pun jumlahnya tidak masalah; kebiasaannya lebih penting daripada besarnya.",
    percentOfEachPayment: "Pada hari pembayaran masuk, pindahkan {percent} darinya ke rekening tabungan terpisah sebelum membelanjakan sedikit pun. Pertahankan porsinya sama di bulan besar maupun kecil; setelah saldonya stabil, beralihlah ke transfer bulanan tetap.",
  },

  note: {
    instrumentDps: "Kami menyarankan transfer bulanan otomatis karena berjalan pada tanggal tetap, jadi tabungan terjadi sebelum sempat Anda belanjakan.",
  },

  status: {
    red: "Belum menabung sama sekali",
    amber: "Menabung sedikit — teruskan",
    green: "Menabung dulu setiap bulan",
  },
};
