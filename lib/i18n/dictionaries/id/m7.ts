import type { Dictionary } from "../../types";

/**
 * Retirement & family screen (M7, "Plan to 100"). `note.*` covers M7_NOTE_KEYS and `option.*`
 * covers M7_OPTION_KEYS. Tone: independence and dignity, never fear; no death imagery.
 */
export const m7: Dictionary["m7"] = {
  title: "Pensiun & keluarga",
  intro: "Berapa yang perlu disisihkan agar Anda bisa hidup dari uang sendiri, dengan cara Anda sendiri, sampai usia 100.",
  introRetired: "Berapa yang bisa Anda ambil dari tabungan setiap bulan agar uang Anda cukup, dengan cara Anda sendiri, sampai usia 100.",
  demo: "Angka contoh untuk pratinjau saja. Data Anda sendiri tidak dipakai di tampilan ini.",

  flow: {
    mode: {
      title: "Anda masih bekerja, atau sudah pensiun?",
      hint: "Bila masih bekerja, kami menghitung berapa yang disisihkan tiap bulan. Bila sudah pensiun, kami menghitung berapa yang bisa diambil tiap tahun.",
    },
    age: {
      title: "Berapa usia Anda?",
      hint: "Dari rencana Anda. Ubah bila tidak tepat.",
      label: "Usia Anda",
    },
    retirementAge: {
      title: "Di usia berapa Anda ingin berhenti bekerja?",
      hint: "Kebanyakan pekerjaan swasta berakhir di usia {age}. Pilih usia yang sesuai dengan pekerjaan dan kesehatan Anda.",
      label: "Usia pensiun",
    },
    spending: {
      title: "Berapa pengeluaran rumah tangga Anda sebulan saat ini?",
      hint: "Dalam nilai uang hari ini. Kami mulai dari pengeluaran pokok Anda; tambahkan apa pun yang masih akan Anda bayar setelah berhenti bekerja.",
      label: "Pengeluaran rumah tangga sebulan",
    },
    savings: {
      title: "Berapa yang sudah Anda tabung dan investasikan sejauh ini?",
      hint: "Tabungan, deposito, {product}, reksa dana, dan saham yang Anda simpan untuk hari tua. Bukan rumah Anda, dan bukan dana hari tua dari kantor (itu diisi nanti).",
      label: "Tabungan dan investasi saat ini",
    },
    monthlySaving: {
      title: "Berapa yang Anda sisihkan setiap bulan sekarang?",
      hint: "Hanya uang yang disisihkan untuk hari tua. Nol juga jawaban yang wajar: di sinilah rencana dimulai.",
      label: "Tabungan sebulan saat ini",
    },
    sex: {
      title: "Anda laki-laki atau perempuan?",
      hint: "Opsional. Rata-rata perempuan hidup sekitar dua tahun lebih lama, dan bantuan sosial lansia dimulai di usia yang berbeda.",
      skip: "Lewati pertanyaan ini",
    },
    retireeType: {
      title: "Anda pensiun dari pemerintahan atau swasta?",
      hint: "Pensiunan pemerintah, semi-pemerintah, dan angkatan bersenjata bisa memakai sertifikat tabungan yang hanya terbuka untuk mereka.",
    },
    retiredSavings: {
      title: "Tabungan apa yang Anda miliki sekarang?",
      hint: "Pencairan dana hari tua dan pesangon, deposito berjangka, sertifikat tabungan, dan apa pun yang menjadi sumber hidup Anda.",
      label: "Tabungan saat ini",
    },
    otherIncome: {
      title: "Apa lagi yang masuk setiap bulan?",
      hint: "Uang pensiun, sewa, atau apa pun selain tabungan Anda. Biarkan nol bila tidak ada.",
      label: "Penghasilan lain sebulan",
    },
    retiredSpending: {
      title: "Berapa pengeluaran rumah tangga Anda sebulan?",
      hint: "Semuanya, termasuk obat dan bantuan di rumah.",
      label: "Pengeluaran rumah tangga sebulan",
    },
    seeResult: "Lihat rencana saya sampai 100",
  },

  mode: {
    working: "Masih bekerja",
    workingHint: "Cari tabungan bulanan yang cukup sampai 100",
    retired: "Sudah pensiun",
    retiredHint: "Cari penarikan tahunan yang cukup sampai 100",
  },
  sex: {
    male: "Laki-laki",
    female: "Perempuan",
    unknown: "Tidak ingin menyebutkan",
  },
  retireeType: {
    government: "Pemerintahan",
    governmentHint: "Pemerintah, semi-pemerintah, atau angkatan bersenjata",
    private: "Swasta atau usaha sendiri",
    privateHint: "Karyawan perusahaan, usaha, atau pekerja lepas",
  },

  section: {
    inputs: "Angka Anda",
    sources: "Penghasilan setelah berhenti bekerja",
    result: "Rencana Anda",
  },

  input: {
    mode: "Bekerja atau pensiun",
    age: {
      label: "Usia Anda",
      hint: "Mengubahnya di sini juga mengubahnya di rencana Anda.",
    },
    sex: {
      label: "Laki-laki atau perempuan (opsional)",
      hint: "Hanya dipakai untuk dua catatan: perempuan rata-rata hidup lebih lama, dan usia bantuan sosial lansia.",
    },
    retirementAge: {
      label: "Usia pensiun",
      hint: "Usia yang umum di sini adalah {age}.",
    },
    planToAge: {
      label: "Rencana sampai usia",
      hint: "Secara bawaan kami merencanakan sampai 100. Anda bisa menurunkannya sampai {min}, tidak lebih rendah, atau menaikkannya sampai {max}.",
    },
    spending: {
      label: "Pengeluaran rumah tangga sebulan, saat ini",
      hint: "Dalam nilai uang hari ini; kami menaikkannya mengikuti harga sampai tahun Anda berhenti bekerja.",
    },
    savings: {
      label: "Tabungan dan investasi saat ini",
      hint: "Disimpan untuk hari tua. Bukan rumah Anda, bukan dana hari tua dari kantor.",
    },
    monthlySaving: {
      label: "Tabungan sebulan saat ini",
      hint: "Yang sudah Anda sisihkan untuk hari tua.",
    },
    retireeType: "Pensiun dari",
    retiredSavings: {
      label: "Tabungan saat ini",
      hint: "Semua sumber hidup Anda: pencairan, deposito berjangka, sertifikat tabungan.",
    },
    otherIncome: {
      label: "Penghasilan lain sebulan",
      hint: "Uang pensiun, sewa, atau apa pun selain tabungan Anda.",
    },
  },

  sources: {
    intro: "Tambahkan yang Anda perkirakan akan dimiliki. Masing-masing mengurangi yang perlu Anda tabung.",
    add: "Tambah",
    remove: "Hapus",
    notCounted: "Tidak dihitung",
    lowered: "Sumber penghasilan Anda mengurangi tabungan bulanan sebesar {amount}.",
    retiredIntro: "Penghasilan lain Anda sudah dihitung di atas. Dua hal ini ditampilkan untuk gambaran lengkap, tidak pernah dihitung.",
    pf: {
      title: "Dana hari tua",
      hint: "Tumbuh dengan bunga dana itu sendiri, lalu dicairkan sekaligus saat Anda berhenti bekerja.",
      balance: "Saldo saat ini",
      contribution: "Iuran setiap bulan (bagian Anda plus bagian pemberi kerja)",
      contributionHint: "Pemberi kerja besar kini menyetor kurang lebih sama dengan Anda; cek slip gaji Anda.",
      rate: "Bunga tahunan dana itu",
      rateHint: "Dari laporan tahunan dana Anda. Kami tidak pernah mengasumsikannya, karena tiap dana berbeda.",
    },
    gratuity: {
      title: "Pesangon",
      hint: "Uang sekaligus saat Anda keluar: sejumlah hari gaji pokok terakhir untuk tiap tahun masa kerja, menurut undang-undang atau aturan pemberi kerja bila lebih baik.",
      years: "Masa kerja saat berhenti (tahun)",
      basic: "Gaji pokok terakhir sebulan",
      employerDays: "Hari per tahun dari pemberi kerja (hanya bila lebih dari undang-undang)",
      employerDaysHint: "Kosongkan untuk memakai aturan undang-undang.",
    },
    pension: {
      title: "Program pensiun publik",
      hint: "Dibayar seumur hidup dalam jumlah tetap, jadi daya belinya berkurang tiap tahun. Kami menilainya seperti itu.",
      scheme: "Program: {name}",
      contribution: "Iuran Anda sebulan",
      expected: "Uang pensiun sebulan yang Anda harapkan (bila tahu)",
      expectedHint: "Kosongkan dan kami memakai proyeksi resmi programnya.",
    },
    fixedPension: {
      title: "Uang pensiun tetap lainnya",
      hint: "Uang pensiun apa pun yang tidak naik mengikuti harga.",
      label: "Uang pensiun sebulan",
    },
    rent: {
      title: "Sewa yang Anda terima",
      hint: "Sewa biasanya naik mengikuti harga, jadi langsung mengurangi pengeluaran Anda.",
      label: "Sewa sebulan, saat ini",
    },
    allowance: {
      title: "Bantuan sosial lansia",
      hint: "Bantuan negara yang kecil, hanya untuk yang memenuhi syarat ekonomi. Ditampilkan untuk gambaran lengkap, tidak pernah dihitung dalam rencana.",
      label: "Mungkinkah Anda berhak?",
      amount: "Sekitar {amount} sebulan mulai usia {age}",
    },
    family: {
      title: "Bantuan dari keluarga",
      hint: "Bantuan anak-anak tentu baik, tetapi mereka akan punya biaya sendiri. Anggap bonus, bukan rencana.",
      label: "Bantuan sebulan yang mungkin Anda terima",
    },
  },

  result: {
    headline: "Sisihkan setiap bulan",
    caption: "agar uang Anda cukup sampai usia {planTo}. Target saat berhenti di usia {retirementAge}: {corpus}.",
    funded: "Yang sudah Anda miliki sudah mencukupi target sampai usia {planTo}. Biarkan tetap diinvestasikan.",
    currentSaving: "Anda menyisihkan {amount} sebulan saat ini.",
    mixUsed: "Sebelum Anda berhenti bekerja, tabungan Anda tumbuh sesuai imbal hasil komposisi aset Anda.",
    contrast: {
      title: "Merencanakan sampai usia {contrast} atau {planTo}",
      to: "Sampai usia {age}",
      target: "Target",
      monthly: "Sebulan",
      extra: "Tambahan {amount} sebulan membiayai {years} tahun lagi hidup dari uang sendiri, dari usia {contrast} sampai {planTo}.",
      noExtra: "Tabungan Anda sudah mencukupi tahun-tahun setelah usia {contrast}.",
      footnote: "Usia {contrast} ditampilkan hanya sebagai pembanding: banyak orang hidup jauh melewatinya.",
    },
    range: {
      title: "Tergantung imbal hasil",
      low: "Bila imbal hasil lebih rendah",
      base: "Skenario dasar kami",
      high: "Bila imbal hasil lebih tinggi",
      hint: "Proyeksi jangka panjang tidak pernah tepat; kami menampilkan rentang dan membulatkan setiap angka.",
    },
    chart: {
      title: "Berapa lama uang saya akan cukup?",
      hint: "Tabungan Anda dengan jumlah yang Anda sisihkan sekarang, dari tahun ke tahun, dalam nilai uang tiap tahun.",
      label: "Tabungan dari usia {from} sampai {to}: tertinggi {peak} di usia {peakAge}. {verdict}.",
      axisAge: "Usia",
      retire: "Berhenti kerja",
    },
    verdict: {
      onTrack: "Sesuai rencana sampai {age}",
      lastsTo: "Cukup sampai {age}",
      runsOut: "Habis di usia {age}",
    },
    shift: {
      title: "Bedanya bila mulai {years} tahun lebih awal atau lebih lambat",
      earlier: "Seandainya mulai di usia {age}",
      later: "Bila mulai di usia {age}",
      now: "Mulai sekarang, di usia {age}",
      perMonth: "{amount} sebulan",
      notPossible: "Terlalu dekat dengan pensiun",
      hint: "Pengeluaran, tabungan, dan usia pensiun sama; hanya waktu mulainya yang bergeser.",
    },
    income: {
      title: "Tambahan dari sumber penghasilan Anda",
      pf: "Dana hari tua saat berhenti",
      gratuity: "Pesangon",
      pensions: "Uang pensiun tetap, dinilai saat berhenti",
      publicPension: "Pensiun publik sebulan",
      rent: "Sewa setahun saat berhenti",
      allowance: "Bantuan sosial lansia sebulan",
      family: "Bantuan keluarga sebulan",
    },
    addSources: "Tambahkan sumber penghasilan Anda",
    editAnswers: "Ubah jawaban Anda",
  },

  retired: {
    headline: "Yang bisa Anda ambil setiap bulan",
    caption: "Yaitu {firstYear} di tahun pertama, naik mengikuti harga setiap tahun sesudahnya, dan cukup sampai usia {planTo}.",
    chartHint: "Tabungan Anda dari tahun ke tahun dengan penarikan di atas, dalam nilai uang tiap tahun.",
    range: {
      title: "Yang bisa Anda ambil, tergantung imbal hasil",
      low: "Bila imbal hasil hanya menyamai inflasi",
      hint: "Proyeksi jangka panjang tidak pernah tepat; kami menampilkan rentang dan membulatkan setiap angka.",
    },
    runsOut: "Dengan pengeluaran {spending} sebulan dari tabungan, uangnya akan cukup sampai sekitar usia {age}.",
    lasts: "Dengan pengeluaran {spending} sebulan dari tabungan, uangnya cukup sampai usia {planTo}.",
    target: {
      title: "Tabungan yang dibutuhkan untuk pengeluaran Anda",
      hint: "Yang dibutuhkan pengeluaran Anda dari tabungan, sampai usia {contrast} dan {planTo}.",
    },
    pot: {
      title: "Aturan dua wadah",
      body: "Simpan {amount} — penarikan untuk {years} tahun — di deposito berjangka dan surat perbendaharaan negara yang bisa cepat dicairkan. Sisanya tetap diinvestasikan dan mengisi ulang wadah ini setahun sekali.",
    },
    options: {
      title: "Cara mengubah tabungan menjadi penghasilan rutin",
      localName: "Di sini: {name}",
    },
  },

  bucket: {
    title: "Ke mana uang ini sebaiknya ditaruh?",
    body: "Uang untuk hari tua butuh tempat yang lebih tahan lama dari satu perusahaan mana pun. Bila tidak ada reksa dana indeks yang luas, rencana menyusun yang paling mendekati dari tiga bagian: reksa dana terbuka yang terdiversifikasi lewat rencana bulanan untuk pertumbuhan; penghasilan yang dijamin pemerintah seperti program pensiun publik, sertifikat tabungan, dan obligasi negara; serta komposisi yang makin aman setiap tahun saat Anda makin dekat ke usia {retirementAge}.",
    bodyRetired: "Uang untuk sisa hidup Anda butuh tempat yang lebih tahan lama dari satu perusahaan mana pun. Simpan penarikan beberapa tahun ke depan di deposito dan surat perbendaharaan negara yang bisa cepat dicairkan, dan sisanya di penghasilan yang dijamin pemerintah seperti sertifikat tabungan dan obligasi negara, dengan sebagian kecil di reksa dana terbuka yang terdiversifikasi untuk pertumbuhan.",
    lock: "Tandai uang ini “tidak sebelum usia {retirementAge}” dan jangan diganggu sampai saat itu.",
    link: "Lihat komposisi aset Anda",
  },

  lifeTable: {
    title: "Berapa lama orang hidup setelah usia 60",
    hint: "Rata-rata sisa tahun hidup di tiap usia. Separuh orang hidup lebih lama dari rata-rata, karena itulah rencana tidak pernah berhenti di sana.",
    age: "Usia",
    total: "Rata-rata",
    men: "Laki-laki",
    women: "Perempuan",
    projected: "Proyeksi",
    source: "{source}, {date}",
  },
  supportRatio: "Pada {fromYear} ada {fromValue} orang usia kerja untuk setiap lansia. Pada {toYear} hanya akan ada sekitar {toValue}, jadi andalkan uang Anda sendiri lebih dulu.",

  notes: {
    title: "Perlu diketahui",
  },
  backToPlan: "Kembali ke rencana saya",

  note: {
    planTo100: "Secara bawaan rencana berjalan sampai usia 100 karena banyak orang yang mencapai 60 hidup jauh melewati 80. Anda bisa menurunkannya, tetapi tidak di bawah 85.",
    lifeAt60: "Angka harapan hidup saat lahir mencampur semua usia sejak kanak-kanak, jadi tampak rendah. Orang yang mencapai 60 rata-rata bisa berharap hidup sekitar dua puluh tahun lagi, dan separuhnya lebih lama.",
    womenLiveLonger: "Rata-rata perempuan hidup sekitar dua tahun lebih lama, jadi rencana pasangan suami istri sebaiknya mencakup masa pensiun istri yang lebih panjang.",
    familyNotCounted: "Bantuan keluarga tidak pernah dihitung: anak-anak Anda akan punya keluarga dan biaya sendiri. Anggap bonus, bukan rencana.",
    allowanceNotCounted: "Bantuan sosial lansia ditampilkan tetapi tidak pernah dihitung: jumlahnya kecil, hanya untuk yang memenuhi syarat ekonomi, dan bisa berubah.",
    pensionFixed: "Uang pensiun yang dibayar dalam jumlah tetap makin berkurang daya belinya setiap tahun saat harga naik, jadi dinilai seperti itu.",
    pensionEntryClosed: "Program pensiun publik hanya menerima peserta baru sampai batas usia masuknya, jadi tidak dihitung untuk Anda.",
    supportRatio: "Dalam beberapa dekade ke depan, makin sedikit orang usia kerja yang menopang setiap lansia, jadi tabungan Anda sendiri makin penting.",
    lock: "Simpan uang ini hanya untuk hari tua. Memakainya lebih awal adalah alasan paling umum sebuah rencana tidak tercapai.",
    startEarlier: "Mulai lebih awal sangat mengurangi jumlah bulanan, karena uangnya punya waktu lebih lama untuk tumbuh.",
    noStatutoryGratuity: "Kami tidak punya catatan undang-undang pesangon untuk negara Anda, jadi hanya hari dari pemberi kerja yang dihitung. Cek kontrak Anda atau tanyakan ke pemberi kerja.",
    lowCaseInflation: "Skenario rendah mengasumsikan uang Anda hanya mengimbangi kenaikan harga selama pensiun, tanpa imbal hasil riil tambahan.",
  },

  option: {
    pensionerCertificate: "Sertifikat tabungan pensiunan: keuntungan bulanan, khusus pensiunan pemerintah, semi-pemerintah, dan angkatan bersenjata, sampai batas tertentu.",
    savingsCertificate: "Sertifikat tabungan pemerintah: keuntungan tetap yang dijamin negara.",
    tbonds: "Obligasi negara: dijamin pemerintah, dengan kupon tetap setiap enam bulan.",
    depositLadder: "Tangga deposito: deposito yang jatuh tempo bergantian, sehingga sebagian uang bisa dipakai setiap tahun.",
    annuity: "Anuitas seumur hidup dari perusahaan asuransi milik negara: uang pensiun seumur hidup, berapa pun panjang usia Anda. Konsekuensinya: uangnya tidak bisa diwariskan.",
  },
};
