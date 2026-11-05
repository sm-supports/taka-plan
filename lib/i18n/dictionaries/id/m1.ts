import type { Dictionary } from "../../types";

/** M1 Emergency fund. `rule.*` covers M1_RULE_KEYS, `next.*` covers M1_NEXT_KEYS. */
export const m1: Dictionary["m1"] = {
  title: "Dana darurat",
  intro: "Uang yang bisa Anda ambil dalam satu atau dua hari saat penghasilan berhenti atau ada tagihan mendadak. Sesuaikan dengan keluarga Anda, bukan dengan aturan baku.",
  demo: "Angka contoh untuk pratinjau saja. Data Anda sendiri tidak dipakai di tampilan ini.",

  section: {
    inputs: "Angka Anda",
    result: "Dana darurat Anda",
    rules: "Aturan untuk uang ini",
    nextStep: "Langkah berikutnya",
  },

  input: {
    essentials: {
      label: "Pengeluaran pokok bulanan",
      hint: "Sewa, makan, listrik dan air, transportasi, biaya sekolah, kiriman untuk orang tua, cicilan yang berjalan.",
    },
    incomeType: {
      label: "Cara Anda mendapat penghasilan",
      hint: "Penghasilan pekerja lepas dan usaha kurang stabil, jadi dana daruratnya dimulai lebih besar.",
    },
    dependents: {
      label: "Siapa yang bergantung pada Anda",
      hint: "Pilih semua yang sesuai.",
    },
    soleEarner: {
      label: "Apakah Anda satu-satunya pencari nafkah di rumah?",
      hint: "Bila tidak ada orang lain yang berpenghasilan, dana ini perlu bertahan lebih lama.",
    },
    hasHealthInsurance: {
      label: "Apakah Anda punya asuransi kesehatan?",
      hint: "Tanpa asuransi, biaya rumah sakit diambil dari dana ini, jadi dananya lebih besar.",
    },
    liquidSavings: {
      label: "Tabungan yang bisa Anda ambil hari ini",
      hint: "Uang tunai, rekening tabungan, dan deposito yang bisa dicairkan dalam beberapa hari. Bukan uang di {product}, saham, atau emas.",
    },
    months: {
      label: "Jumlah bulan yang ditanggung",
      hint: "Kami menyarankan titik awal; geser sesuai yang terasa tepat untuk keluarga Anda, dari {min} sampai {max} bulan.",
      suggested: "Disarankan: {months}",
      useSuggested: "Pakai saran",
    },
    buildMonths: {
      label: "Kumpulkan dalam",
      hint: "Berapa bulan yang Anda inginkan untuk mengisi dana ini.",
    },
  },

  result: {
    suggestedMonths: "Disarankan: {months}",
    months: "Jumlah bulan yang ditanggung",
    target: "Target",
    saved: "Sudah terkumpul",
    gap: "Masih perlu ditabung",
    monthlySaving: "Tabungan bulanan",
    monthsCovered: "Bulan yang terpenuhi",
    monthsCoveredOf: "{covered} dari {months} bulan terpenuhi",
    monthsToFull: "Penuh dalam {months}",
    full: "Dana darurat Anda sudah penuh",
    tiers: {
      title: "Di mana menyimpannya",
      savingsAccount: "Rekening tabungan (tarik hari itu juga)",
      savingsAccountHint: "Kebutuhan pokok satu bulan yang bisa Anda tarik hari itu juga.",
      fdrLadder: "Tangga deposito 3 bulan",
      fdrLadderHint: "Sisanya, di tiga deposito berjangka yang dibuka berselang satu bulan agar satu jatuh tempo setiap bulan.",
      fdrPerSlice: "Tiap deposito",
      fdrSlices: "Tiga deposito masing-masing {amount}, satu dibuka setiap bulan.",
      banksNeeded: "Jumlah bank untuk menyebarnya",
      banksNeededHint: "Penjaminan simpanan hanya menanggung {limit} per bank, jadi jangan simpan lebih dari itu di satu bank.",
      sanchayapatraLayer: "Lapisan ketiga: {product}",
      sanchayapatraLayerHint: "Dana Anda cukup besar sehingga sebagian bisa ditaruh di {product}, yang bunganya lebih tinggi tetapi kena penalti bila dicairkan lebih awal.",
    },
  },

  rule: {
    noStocks: "Jangan taruh uang ini di saham atau reksa dana saham. Uang ini harus ada, dengan nilai penuh, di hari yang buruk.",
    sanchayapatraThirdLayer: "{product} hanya lapisan ketiga untuk dana darurat yang sangat besar: bunganya lebih tinggi, tetapi mencairkannya lebih awal memotong sebagian keuntungan.",
    cardBridge: "Kartu kredit bisa menjembatani satu atau dua hari yang dibutuhkan untuk mencairkan deposito berjangka — hanya bila Anda melunasi tagihannya penuh dalam masa bebas bunga.",
    refill: "Dana sudah terpakai? Isi lagi sebelum menaruh uang di tempat lain.",
    notAnEmergency: "Liburan, ponsel, atau kado pernikahan bukan keadaan darurat. Tabung untuk itu sebagai tujuan.",
  },

  next: {
    openSavings: "Buka rekening tabungan di bank mana saja dengan kartu identitas Anda; pindahkan kebutuhan pokok satu bulan ke sana dan atur transfer rutin untuk sisanya.",
    fdrLadder: "Datangi bank mana saja dengan kartu identitas dan nomor pajak Anda; minta {product} 3 bulan. Buka satu setiap bulan selama tiga bulan agar satu jatuh tempo setiap bulan.",
    splitBanks: "Dana Anda lebih besar dari batas penjaminan simpanan untuk satu bank. Buka deposito berjangka di bank kedua agar tidak ada bank yang menyimpan lebih dari batas itu.",
    full: "Dana Anda sudah penuh. Biarkan deposito terus diperpanjang, dan isi lagi dana setelah ada penarikan sebelum menabung untuk hal lain.",
  },

  status: {
    red: "Terpenuhi kurang dari satu bulan",
    amber: "Sebagian terpenuhi — terus kumpulkan",
    green: "Terpenuhi seluruhnya",
  },
};
