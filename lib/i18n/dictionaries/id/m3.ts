import type { Dictionary } from "../../types";

/** M3 Debt health check. `path.*` covers M3_PATH_KEYS, `flag.<DebtFlagId>` covers every DebtFlagId. */
export const m3: Dictionary["m3"] = {
  title: "Cek kesehatan utang",
  intro: "Urutkan setiap pinjaman dan kartu menurut bunganya. Lunasi yang termahal dulu, dan jangan pernah berutang untuk gaya hidup.",

  input: {
    takeHome: { label: "Penghasilan bersih bulanan", hint: "Yang benar-benar masuk ke rekening Anda setiap bulan." },
    essentials: { label: "Pengeluaran pokok bulanan", hint: "Sewa, makan, listrik dan air, transportasi, biaya sekolah, kiriman untuk orang tua." },
    savingsTarget: { label: "Tabungan bulanan", hint: "Jumlah menabung dulu dari anggaran Anda. Disisihkan sebelum cicilan apa pun." },
    cashBuffer: { label: "Cadangan tunai", hint: "Sedikit kelonggaran tiap bulan untuk hal tak terduga. Kami menyarankan sebagian dari penghasilan bersih; ubah bila mau." },
    extraMonthly: { label: "Tambahan untuk utang per bulan", hint: "Apa pun di atas pembayaran minimum Anda. Kosongkan untuk memakai sisa ruang yang ada." },
    loans: {
      title: "Pinjaman",
      add: "Tambah pinjaman",
      remove: "Hapus pinjaman",
      empty: "Belum ada pinjaman.",
      type: { label: "Jenis pinjaman", hint: "Pilih yang paling mirip; ini hanya mengubah labelnya." },
      outstanding: { label: "Sisa utang", hint: "Sisa pokok pinjaman hari ini, dari laporan terbaru Anda." },
      annualRate: { label: "Bunga (per tahun)", hint: "Bunga di perjanjian atau laporan pinjaman Anda." },
      emi: { label: "Cicilan bulanan", hint: "Jumlah tetap yang Anda bayar setiap bulan." },
      monthsLeft: { label: "Sisa bulan", hint: "Cicilan yang masih harus dibayar." },
    },
    cards: {
      title: "Kartu kredit",
      add: "Tambah kartu",
      remove: "Hapus kartu",
      empty: "Belum ada kartu.",
      balance: { label: "Saldo terutang", hint: "Jumlah di tagihan terbaru Anda." },
      limit: { label: "Limit kartu", hint: "Batas maksimal yang diizinkan bank untuk Anda belanjakan." },
      annualRate: { label: "Bunga (per tahun)", hint: "Kosongkan untuk memakai bunga kartu resmi atau yang umum." },
      paysInFull: { label: "Apakah Anda melunasi tagihan penuh setiap bulan, dalam masa bebas bunga?", hint: "Bila ya, kartu tidak memakan biaya. Bila tidak, inilah uang termahal yang Anda punya." },
    },
    scenario: {
      title: "Berapa yang bisa saya pinjam?",
      annualRate: { label: "Bunga pinjaman (per tahun)", hint: "Bunga yang ditawarkan bank kepada Anda, atau nilai bawaan kami untuk pinjaman pribadi." },
      months: { label: "Jangka waktu pelunasan", hint: "Dalam bulan." },
    },
  },

  result: {
    totalEmi: "Total cicilan bulanan",
    emiRatio: "Porsi cicilan dari penghasilan bersih",
    emiCapacity: "Kemampuan cicilan",
    emiCapacityHint: "Sisa untuk cicilan setelah tabungan, kebutuhan pokok, dan cadangan tunai.",
    headroom: "Sisa ruang",
    headroomHint: "Kemampuan cicilan dikurangi cicilan yang sudah Anda bayar.",
    maxAffordableLoan: "Pinjaman maksimal yang terjangkau",
    scenario: "Dengan bunga {rate} selama {months}",
    scenarioEmi: "Cicilan bulanan untuk pinjaman ini",
    flags: "Peringatan",
    noFlags: "Tidak ada peringatan. Utang Anda terkendali.",
    noDebt: "Tidak ada pinjaman atau kartu. Tidak ada yang perlu dibenahi — pertahankan begitu.",
    highInterestDebts: "Utang dengan bunga di atas {threshold} per tahun",
    payoffOrder: "Urutan pelunasan",
    payoffOrderHint: "Bunga tertinggi dulu. Bayar minimum untuk yang lain dan arahkan semua uang lebih ke yang teratas di daftar.",
    avalanche: "Bunga tertinggi dulu",
    snowball: "Saldo terkecil dulu",
    interestSaved: "Bunga yang dihemat dengan mendahulukan bunga tertinggi",
    payoffMonths: "Bebas utang dalam {months}",
    totalInterest: "Total bunga",
    minPayment: "Pembayaran minimum",
    path: "Bila Anda merasa terjebak",
    emiRatioNote: "Pemberi pinjaman punya batasnya sendiri. Kami menandai apa pun di atas {threshold} dari penghasilan bersih karena hanya sedikit yang tersisa untuk menabung atau menahan guncangan.",
    maxLoanNote: "Rumus pastinya memberi sekitar {loan} untuk cicilan bulanan {emi} dengan bunga {rate} selama {months}. Bank juga melihat penghasilan dan riwayat Anda, jadi tambahkan batas aman Anda sendiri sebelum meminjam.",
    primaryFlag: "Paling mendesak",
    otherFlags: "Juga perlu dibenahi",
    cardLabel: "Kartu kredit",
    extraUsed: "Tambahan untuk utang: {amount} per bulan",
    compare: "Dibanding saldo terkecil dulu",
    numbers: "Angka Anda",
    borrow: "Berapa yang bisa saya pinjam?",
  },

  profile: {
    title: "Dari profil Anda",
    hint: "Ubah ini dan rencana Anda ikut diperbarui.",
  },

  demoBanner: "Angka contoh. Tambahkan pinjaman dan kartu Anda sendiri untuk melihat gambaran sebenarnya.",

  flag: {
    card_carried: {
      title: "Tagihan kartu tidak lunas saat jatuh tempo",
      body: "Bunga saldo kartu yang tidak dilunasi sekitar {rate} per tahun — uang paling mahal yang ada. Lunasi ini sebelum utang lainnya.",
    },
    card_utilisation: {
      title: "Pemakaian kartu di atas {threshold} dari limit",
      body: "Anda memakai {value} dari limit kartu. Jaga di bawah setengah: tagihan lebih kecil, catatan CIB Anda terlindungi, dan masih ada ruang untuk keadaan darurat sungguhan.",
    },
    emi_ratio: {
      title: "Cicilan di atas {threshold} dari penghasilan bersih",
      body: "{value} dari penghasilan bersih Anda habis untuk cicilan. Pemberi pinjaman punya batasnya sendiri; kami menandai apa pun di atas {threshold} karena hanya sedikit yang tersisa untuk menabung atau menahan guncangan.",
    },
    negative_capacity: {
      title: "Tidak ada ruang untuk cicilan",
      body: "Setelah tabungan, kebutuhan pokok, dan cadangan tunai, tidak ada yang tersisa untuk membayar pinjaman. Kurangi pengeluaran, tambah penghasilan, atau restrukturisasi utang sebelum meminjam lagi.",
    },
  },

  path: {
    listLoans: "Catat setiap pinjaman dan kartu: sisa utang, bunga, dan pembayaran bulanannya. Urutkan menurut bunga, dari yang tertinggi.",
    tellFamily: "Beri tahu keluarga Anda. Utang yang disembunyikan makin besar; rumah tangga yang tahu bisa berhemat bersama.",
    stopBorrowing: "Hentikan semua pinjaman baru, termasuk belanja kartu yang tidak bisa Anda lunasi penuh bulan ini.",
    sellUnaffordable: "Jual barang yang Anda beli secara kredit tetapi sebenarnya tidak terjangkau — motor, ponsel, gawai — dan pakai uangnya untuk utang termahal.",
    refinanceCheaper: "Ambil pinjaman pengganti hanya bila jelas lebih murah setelah biaya, dan jangan pernah untuk membuka ruang belanja lagi.",
  },

  status: {
    red: "Utang mahal perlu ditangani sekarang",
    amber: "Masih terkendali, tetapi pantau",
    green: "Utang terkendali",
  },
};
