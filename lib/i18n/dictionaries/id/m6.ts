import type { Dictionary } from "../../types";

/**
 * Asset mix screen (M6). `note.*` covers M6_NOTE_KEYS, `gate.*` M6_GATE_KEYS and `howto.*` M6_HOWTO_KEYS.
 * Never name a company, fund, broker or bank.
 */
export const m6: Dictionary["m6"] = {
  title: "Komposisi aset",
  intro: "Cara membagi uang jangka panjang Anda ke pendapatan tetap, saham, dan emas, apa yang dibeli untuk tiap bagian, dan cara menjaga pembagiannya tetap sesuai target.",
  demo: "Angka contoh untuk pratinjau saja. Jawaban Anda sendiri tidak dipakai di tampilan ini.",
  needProfile: "Jawab dulu lima pertanyaan awal, agar komposisinya bisa memakai usia dan cara Anda mendapat penghasilan.",
  startLink: "Jawab pertanyaan awal",
  backToPlan: "Kembali ke rencana saya",
  disclaimer: "Perkiraan untuk edukasi, bukan nasihat investasi. Pasar bisa turun dan bertahan rendah selama bertahun-tahun, dan imbal hasil masa lalu tidak menjamin imbal hasil masa depan.",

  flow: {
    progress: "Pertanyaan {n} dari {total}",
    gate: {
      title: "Apakah Anda punya dana darurat dan tidak punya utang kartu?",
      hint: "Uang jangka panjang baru diinvestasikan setelah dana darurat penuh dan utang kartu lunas. Berikut kondisi menurut rencana Anda.",
      emergencyOk: "Dana darurat Anda sudah penuh.",
      emergencyMissing: "Dana darurat Anda belum penuh.",
      cardOk: "Anda tidak punya utang kartu.",
      cardMissing: "Tagihan kartu Anda tidak dilunasi dari bulan ke bulan.",
      openEmergency: "Buka dana darurat",
      openDebt: "Buka cek utang",
      allClear: "Bagus: Anda siap berinvestasi untuk jangka panjang.",
      continue: "Lanjut",
      continueAnyway: "Tetap lanjut",
    },
    ageBand: {
      title: "Anda di kelompok usia mana?",
      hint: "Diisi dari usia Anda. Penabung muda punya lebih banyak tahun untuk melewati penurunan.",
    },
    incomeStability: {
      title: "Seberapa stabil penghasilan Anda?",
      hint: "Diisi dari cara Anda mendapat penghasilan. Penghasilan yang lebih stabil bisa menanggung sedikit lebih banyak risiko.",
    },
    horizon: {
      title: "Kapan Anda akan butuh uang ini?",
      hint: "Geser ke jumlah tahunnya. Uang yang segera dibutuhkan sebaiknya tidak ditaruh di saham.",
      band: "Itu termasuk: {band}.",
    },
    reaction: {
      title: "Bila investasi Anda turun 20% dalam setahun, Anda akan…",
      hint: "Tidak ada jawaban salah. Jujurlah: ini menentukan berapa banyak saham yang sanggup Anda tanggung.",
    },
    amounts: {
      title: "Berapa yang akan Anda investasikan?",
      hint: "Sekaligus, bulanan, atau keduanya. Anda bisa mengubahnya nanti.",
      needOne: "Masukkan jumlah sekaligus atau bulanan untuk melihat komposisi Anda.",
      seeResult: "Lihat komposisi saya",
    },
  },

  answer: {
    ageBand: { "0": "50 atau lebih", "1": "35 sampai 49", "2": "Di bawah 35" },
    incomeStability: { "0": "Penghasilan usaha", "1": "Lepas atau tidak tetap", "2": "Bergaji tetap" },
    horizon: { "0": "Dalam 5 tahun", "1": "Dalam 5 sampai 10 tahun", "2": "Lebih dari 10 tahun lagi" },
    reaction: { "0": "Menjual, untuk menghentikan kerugian", "1": "Menunggu sampai pulih", "2": "Membeli lagi selagi murah" },
  },

  profile: {
    careful: "Konservatif",
    balanced: "Seimbang",
    growth: "Pertumbuhan",
  },

  bucket: {
    fixedIncome: "Pendapatan tetap",
    equity: "Saham",
    gold: "Emas",
  },

  section: {
    result: "Komposisi Anda",
    instruments: "Apa yang dibeli",
    projection: "Bisa tumbuh jadi berapa",
    rebalance: "Saya sudah berinvestasi",
    inputs: "Jawaban Anda",
    netWorth: "Kekayaan bersih",
    notes: "Perlu diketahui",
  },

  input: {
    ageBand: { label: "Kelompok usia" },
    incomeStability: { label: "Seberapa stabil penghasilan Anda" },
    horizon: { label: "Kapan Anda butuh uangnya" },
    reaction: { label: "Bila investasi Anda turun 20% dalam setahun" },
    profileOverride: {
      label: "Profil risiko",
      hint: "Kami menyarankan satu dari jawaban Anda. Anda bisa memilih yang lain; porsi saham tidak pernah melewati batasnya.",
      suggested: "Disarankan dari jawaban Anda",
    },
    goldShare: {
      label: "Porsi emas",
      hint: "Sebagai lindung nilai, dijaga antara {min} dan {max} dari komposisi.",
      reset: "Kembali ke {share}",
    },
    horizonYears: {
      label: "Tahun sampai Anda butuh uangnya",
      hint: "Di bawah {noEquity} tahun tidak ada saham; di bawah {cashOnly} tahun hanya deposito dan surat perbendaharaan.",
    },
    lumpSum: {
      label: "Jumlah sekaligus untuk diinvestasikan sekarang",
      hint: "Uang yang bisa Anda sisihkan untuk jangka panjang hari ini.",
    },
    monthly: {
      label: "Jumlah bulanan",
      hint: "Yang bisa Anda tambahkan setiap bulan.",
    },
    propertyValue: {
      label: "Properti yang Anda miliki (opsional)",
      hint: "Tanah atau apartemen. Dihitung dalam kekayaan bersih tetapi tidak dalam pembagian, karena tidak bisa dibeli atau dijual sebagian-sebagian.",
    },
    directShares: {
      label: "Beli saham langsung, bukan reksa dana?",
      hint: "Hanya bila Anda siap memilih dan memantau sendiri setidaknya sepuluh perusahaan besar.",
    },
  },

  result: {
    score: "Skor risiko {score} dari {max}",
    profileLine: "Profil Anda: {profile}",
    suggestedLine: "Disarankan dari jawaban Anda: {profile}",
    barLabel: "Komposisi Anda: {parts}",
    lump: "sekaligus",
    monthly: "Setiap bulan",
    whySplit: "Kenapa pembagian ini?",
    horizon: {
      noEquity: "Anda butuh uang ini dalam beberapa tahun, jadi bagian saham dipindah ke pendapatan tetap.",
      cashOnly: "Anda butuh uang ini dalam setahun, jadi semuanya tetap di deposito atau surat perbendaharaan.",
    },
  },

  instrument: {
    title: "{bucket}: {share}",
    primary: "Mulai dengan",
    alternatives: "Pilihan lain",
    unavailable: "Tidak tersedia di negara Anda. Untuk sementara simpan bagian ini di pendapatan tetap.",
    localName: "Nama lokal: {name}",
  },

  projection: {
    intro: "{years} tahun, {paidIn} disetor. Tiga skenario, karena tidak ada yang tahu mana yang akan terjadi.",
    introNone: "Masukkan jumlah sekaligus atau bulanan untuk melihat rentangnya.",
    low: "Rendah",
    base: "Dasar",
    high: "Tinggi",
    rate: "{rate} per tahun",
    real: "{amount} dalam nilai uang hari ini",
    lowLosesValue: "Dalam skenario rendah, uang Anda tumbuh lebih lambat dari harga dan kehilangan daya beli.",
    why: "Kenapa angka-angka ini?",
  },

  rebalance: {
    intro: "Masukkan yang Anda miliki hari ini di tiap bagian, dan uang baru yang akan ditambahkan. Kami menghitung apa yang perlu dibeli atau dijual agar kembali ke komposisi Anda.",
    open: "Saya sudah berinvestasi",
    close: "Sembunyikan",
    holding: "{bucket} yang Anda miliki sekarang",
    newMoney: { label: "Uang baru untuk ditambahkan (opsional)", hint: "Uang baru masuk lebih dulu ke bagian yang tertinggal." },
    clear: "Kosongkan isian saya",
    total: "Total setelah perubahan: {amount}",
    buy: "Beli {amount}",
    sell: "Jual {amount}",
    none: "Tidak ada perubahan",
    target: "Target {share}",
    drift: "Sekarang {current}, selisih {drift} dari target",
    points: "{value} poin",
    triggered: "Setidaknya satu bagian menyimpang lebih dari {band} dari target: saatnya menyeimbangkan ulang.",
    withinBand: "Semua bagian masih dalam {band} dari target. Tetap seimbangkan ulang setahun sekali.",
    newMoneyOnly: "Uang baru saja sudah menutup selisihnya: tidak ada yang perlu dijual.",
    sellNote: "Menjual berarti ada biaya keluar dan mungkin pajak. Bila bisa, arahkan uang baru ke bagian yang tertinggal selama beberapa bulan ke depan.",
    why: "Kenapa transaksi ini?",
  },

  netWorth: {
    inMix: "Diinvestasikan dalam komposisi",
    property: "Properti (di luar pembagian)",
    total: "Kekayaan bersih",
  },

  note: {
    capApplied: "Porsi saham dijaga di batas maksimumnya, berapa pun panjang jangka waktu Anda.",
    horizonNoEquity: "Anda butuh uang ini dalam lima tahun, jadi tidak ada saham. Harga saham bisa tetap rendah selama bertahun-tahun.",
    horizonCashOnly: "Anda butuh uang ini dalam setahun, jadi hanya disimpan di deposito jangka pendek atau surat perbendaharaan negara.",
    propertyExcluded: "Properti dihitung dalam kekayaan bersih tetapi tidak dalam pembagian: tidak bisa dibeli atau dijual sebagian-sebagian atau diseimbangkan ulang.",
    lowLosesValue: "Dalam skenario rendah, uang tumbuh lebih lambat dari harga, jadi daya belinya lebih kecil dari yang Anda setor.",
    noIndexFund: "Di negara Anda tidak dijual reksa dana indeks, obligasi emas, atau reksa dana properti, jadi bagian saham memakai reksa dana terbuka yang terdiversifikasi dan emas dibeli dalam bentuk batangan atau koin.",
    neverBreakCertificates: "Jangan pernah mencairkan sertifikat tabungan lebih awal untuk menyeimbangkan ulang: bunganya turun tajam di tahun-tahun awal. Pakai uang baru saja.",
    exitCosts: "Sebelum menjual, cek biaya keluar, pajak dividen, dan harga yang mau dibayar toko emas.",
  },

  gate: {
    noEmergencyFund: "Penuhi dana darurat Anda dulu. Uang jangka panjang yang mungkin harus dijual terburu-buru bukanlah uang jangka panjang.",
    cardDebt: "Lunasi utang kartu dulu. Bunga kartu jauh lebih tinggi dari hasil investasi mana pun.",
  },

  howto: {
    fixedIncome:
      "Sertifikat tabungan pemerintah dijual di cabang bank dan kantor pos yang menyediakannya, surat perbendaharaan dan obligasi negara melalui bagian surat berharga negara di bank, dan deposito berjangka di bank umum mana saja. Bawa kartu identitas Anda; jumlah besar memerlukan nomor pajak atau bukti laporan pajak.",
    equityFund:
      "Pilih reksa dana terbuka yang terdiversifikasi dan mulai rencana bulanan dengan manajer investasinya atau bank yang menjual unitnya. Bawa kartu identitas dan rekening bank. Sebar ke banyak perusahaan; jangan taruh bagian ini di satu saham.",
    directShares:
      "Anda butuh rekening efek. Pegang setidaknya sepuluh perusahaan besar di lima sektor atau lebih, dengan tidak ada satu saham pun melebihi sepersepuluh bagian ini. Bersiaplah memantaunya sendiri.",
    gold: "Beli emas batangan atau koin 22 karat dari toko emas yang menjadi anggota asosiasi pedagang emas, dan simpan kuitansinya. Perhiasan dikenai ongkos pembuatan dan dijual kembali lebih murah, jadi untuk dipakai, bukan untuk investasi.",
  },
};
