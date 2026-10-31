import type { Dictionary } from "../../types";

/**
 * Insurance & health screen (M2). `note.*` covers M2_NOTE_KEYS and `check.*` covers M2_CHECK_KEYS.
 * `check.claimSettlement` takes {claimSettlement} (a percent).
 */
export const m2: Dictionary["m2"] = {
  title: "Asuransi & kesehatan",
  intro: "Berapa perlindungan jiwa dan kesehatan yang dibutuhkan keluarga Anda, kira-kira biayanya, dan cara memeriksa perusahaan asuransi sebelum tanda tangan.",
  demo: "Angka contoh untuk pratinjau saja. Data Anda sendiri tidak dipakai di tampilan ini.",
  backToPlan: "Kembali ke rencana saya",

  needProfile: {
    title: "Pertama, beberapa pertanyaan tentang Anda",
    body: "Cek ini memakai usia, penghasilan, dan tanggungan Anda. Jawab lima pertanyaan awal, lalu kembali ke sini.",
    cta: "Jawab pertanyaannya",
  },

  flow: {
    eyebrow: "Cek asuransi",
    smoker: {
      title: "Apakah Anda merokok atau memakai tembakau?",
      hint: "Perusahaan asuransi mengenakan premi jiwa lebih mahal untuk perokok, jadi rentang harganya bergantung pada ini.",
    },
    lifeCover: {
      title: "Berapa perlindungan jiwa yang sudah Anda punya?",
      hint: "Jumlahkan uang pertanggungan semua polis jiwa Anda, termasuk dari kantor. Ketik 0 bila tidak ada.",
      none: "Saya tidak punya",
    },
    healthCover: {
      title: "Berapa perlindungan kesehatan yang sudah dimiliki keluarga Anda?",
      hint: "Batas tahunan polis kesehatan Anda sendiri atau dari kantor, untuk semua orang. Ketik 0 bila tidak ada.",
      none: "Kami tidak punya",
    },
    people: {
      title: "Siapa saja yang ditanggung asuransi kesehatan?",
      hint: "Kami mengisinya dari tanggungan Anda. Ubah bila ada orang lain yang perlu ditanggung.",
    },
    seeResult: "Lihat hasil saya",
  },

  section: {
    inputs: "Jawaban Anda",
    result: "Perlindungan yang dibutuhkan keluarga Anda",
    notes: "Perlu diketahui",
  },

  input: {
    smoker: {
      label: "Apakah Anda merokok atau memakai tembakau?",
      hint: "Perokok membayar lebih untuk asuransi jiwa. Nyatakan juga di setiap formulir pengajuan.",
    },
    existingLifeCover: {
      label: "Perlindungan jiwa yang sudah Anda punya",
      hint: "Uang pertanggungan semua polis jiwa Anda, termasuk dari kantor. 0 bila tidak ada.",
    },
    existingHealthCover: {
      label: "Perlindungan kesehatan yang sudah dimiliki keluarga",
      hint: "Batas tahunan semua polis kesehatan, milik Anda atau dari kantor, untuk semua orang. 0 bila tidak ada.",
    },
    people: {
      label: "Siapa yang ditanggung asuransi kesehatan",
      hint: "Pilih semua yang perlu ditanggung.",
    },
    childrenCount: {
      label: "Jumlah anak yang ditanggung",
    },
    parentsCount: {
      label: "Jumlah orang tua yang ditanggung",
    },
    parentAge: {
      label: "Usia orang tua yang lebih tua",
      hint: "Asuransi kesehatan makin mahal seiring usia, jadi rentang harganya memakai angka ini.",
    },
    coverToAge: {
      label: "Perlindungan jiwa sampai usia",
      hint: "Kebanyakan keluarga tidak lagi bergantung pada penghasilan Anda setelah anak-anak dewasa, jadi perlindungan jarang perlu melewati masa pensiun.",
    },
    incomeShare: {
      label: "Porsi penghasilan Anda yang dibutuhkan keluarga",
      hint: "Tanpa Anda sebagian biaya berhenti, jadi keluarga butuh sebagian penghasilan Anda, bukan seluruhnya.",
    },
    investments: {
      label: "Investasi yang bisa dijual keluarga",
      hint: "Saham, reksa dana, sertifikat tabungan, atau emas. Dana darurat Anda sudah dihitung.",
    },
    youngestChildAge: {
      label: "Usia anak bungsu Anda (opsional)",
      hint: "Perlindungan jiwa lalu berjalan sampai anak itu bisa menghidupi diri sendiri, bila itu lebih dulu dari usia di bawah.",
    },
  },

  person: {
    self: "Saya",
    partner: "Pasangan",
    child: "Anak",
    parent: "Orang tua",
  },

  status: {
    red: "Perlindungan jauh dari cukup",
    amber: "Sebagian perlindungan kurang",
    green: "Terlindungi untuk saat ini",
  },

  life: {
    title: "Asuransi jiwa",
    label: "Perlindungan jiwa yang dibutuhkan keluarga Anda",
    multiple: "Sekitar {multiple} kali penghasilan tahunan Anda",
    existing: "Perlindungan yang sudah Anda punya",
    gap: "Masih perlu dibeli",
    years: "Tahun yang ditanggung",
    yearsValue: "{years} (sampai usia {age})",
    incomeNeed: "Untuk menggantikan penghasilan Anda",
    incomeNeedHint: "Yang dibutuhkan keluarga selama tahun-tahun itu, dalam nilai uang hari ini.",
    enough: "Perlindungan yang Anda punya sudah cukup untuk saat ini.",
    notNeeded: "Belum diperlukan",
    why: "Kenapa perlindungan jiwa {amount}?",
    status: {
      red: "Sebagian besar perlindungan belum ada",
      amber: "Sebagian perlindungan belum ada",
      green: "Perlindungan jiwa cukup",
    },
  },

  health: {
    title: "Asuransi kesehatan",
    label: "Perlindungan kesehatan untuk keluarga",
    caption: "Untuk {people} orang",
    captionOne: "Untuk {people} orang",
    perPerson: "Per orang dewasa",
    perPersonHint: "Kira-kira biaya satu kali rawat inap.",
    existing: "Perlindungan yang sudah dimiliki keluarga",
    gap: "Masih perlu dibeli",
    enough: "Perlindungan kesehatan keluarga sudah cukup untuk saat ini.",
    why: "Kenapa perlindungan kesehatan {amount}?",
    status: {
      red: "Sebagian besar perlindungan belum ada",
      amber: "Sebagian perlindungan belum ada",
      green: "Perlindungan kesehatan cukup",
    },
  },

  premium: {
    title: "Kira-kira biayanya",
    monthly: "Sisihkan setiap bulan",
    caption: "Rencana Anda menyisihkan ini untuk kedua perlindungan.",
    captionNone: "Tidak ada lagi yang perlu disisihkan: perlindungan Anda sudah cukup untuk saat ini.",
    captionHealth: "Rencana Anda menyisihkan ini untuk asuransi kesehatan.",
    captionLife: "Rencana Anda menyisihkan ini untuk asuransi jiwa berjangka.",
    life: "Asuransi jiwa berjangka, per tahun",
    lifeHint: "Untuk perlindungan {gap}.",
    smokerHint: "Untuk perlindungan {gap}, dengan harga perokok.",
    health: "Asuransi kesehatan, per tahun",
    healthHint: "Untuk tambahan perlindungan {gap}.",
    range: "{low} – {high}",
    none: "Tidak ada lagi yang perlu dibeli",
    indicative: "Rentang kasar, bukan penawaran harga",
    why: "Kenapa {amount} sebulan?",
  },

  policy: {
    title: "Sudah membayar polis jenis tabungan?",
    hint: "Polis yang mengembalikan uang di akhir (asuransi dwiguna). Lihat perbandingannya dengan asuransi jiwa berjangka biasa.",
    intro: "Ketik angka dari dokumen polis Anda. Kami membandingkan yang dibayar polis di akhir dengan membeli asuransi jiwa berjangka untuk jumlah yang sama dan menaruh sisa preminya di simpanan yang aman.",
    annualPremium: {
      label: "Premi yang Anda bayar per tahun",
    },
    sumAssured: {
      label: "Perlindungan jiwa dari polis",
      hint: "Uang pertanggungan yang tertulis di polis.",
    },
    termYears: {
      label: "Masa polis penuh",
    },
    yearsPaid: {
      label: "Tahun yang sudah dibayar",
    },
    expectedMaturity: {
      label: "Jumlah yang dibayar polis di akhir",
      hint: "Nilai jatuh tempo dalam ilustrasi perusahaan asuransi, termasuk perkiraan bonus.",
    },
    surrenderValue: {
      label: "Yang dibayar perusahaan asuransi bila Anda berhenti hari ini (opsional)",
      hint: "Nilai tebus atau nilai bebas premi; tanyakan ke perusahaan asuransi. Tanpa angka ini, perbandingan tidak menghitung apa yang kembali bila Anda berhenti.",
    },
    incomplete: "Isi kelima angka untuk melihat perbandingannya.",
    keep: "Bila Anda melanjutkan polis",
    keepHint: "Dibayar di akhir masa polis.",
    alternative: "Asuransi berjangka plus menabung selisihnya",
    alternativeHint: "Sisa setiap premi masuk ke {instrument} selama {years} yang tersisa.",
    atLeast: "Setidaknya {amount}",
    surrenderPart: "Termasuk {amount} dari nilai tebus, yang dikembangkan sampai akhir.",
    termPremium: "Asuransi berjangka untuk jumlah yang sama, per tahun",
    remaining: "Tahun yang masih harus dibayar",
    irr: "Imbal hasil tahunan polis",
    irrHint: "Imbal hasil premi Anda per tahun bila polis membayar sesuai ilustrasinya.",
    verdict: {
      termPlusInvestAhead: "Dengan angka ini, asuransi berjangka plus menabung selisihnya bisa memberi Anda sekitar {amount} lebih banyak di akhir.",
      policyAhead: "Dengan angka ini, polis unggul sekitar {amount} dibanding asuransi berjangka plus menabung selisihnya.",
      similar: "Dengan angka ini, kedua pilihan berakhir kurang lebih sama.",
    },
    clear: "Hapus angka-angka ini",
    why: "Kenapa perbandingan ini?",
  },

  checklist: {
    title: "Periksa perusahaan asuransinya sebelum polisnya",
    intro: "Polis hanya sebaik klaim yang dibayar perusahaan asuransinya. Periksa daftar ini sebelum tanda tangan.",
    regulatorLink: "Regulator asuransi: {name}",
    complaintsLink: "Tempat mengadu: {name}",
  },

  note: {
    noDependents: "Tidak ada yang bergantung pada penghasilan Anda dan Anda tidak punya utang, jadi Anda belum butuh asuransi jiwa. Asuransi kesehatan tetap penting.",
    debtsOnly: "Tidak ada yang bergantung pada penghasilan Anda, jadi asuransi jiwa cukup sebesar utang Anda, agar utang itu tidak pernah beralih ke keluarga Anda.",
    publicCoverBroad: "Layanan kesehatan publik membayar sebagian besar biaya rumah sakit di negara Anda, jadi kami menetapkan asuransi kesehatan Anda sendiri sebesar porsi minimum dari biaya satu kali rawat inap.",
    premiumIndicative: "Premi adalah rentang kasar dari tabel harga umum, bukan penawaran harga. Harga Anda bergantung pada kesehatan Anda, perusahaan asuransi, dan polisnya.",
    noTermSold: "Kami tidak punya tabel harga asuransi jiwa berjangka murni di negara Anda, jadi premi jiwa ditampilkan nol. Mintalah penawaran asuransi berjangka ke perusahaan asuransi.",
    separateInvesting: "Pisahkan asuransi dan investasi: perlindungan adalah biaya, seperti sewa, dan menabung untuk masa depan dilakukan tersendiri.",
    policyNotAdvice: "Ini perbandingan kasar, bukan saran untuk menghentikan atau melanjutkan polis apa pun. Menghentikan polis lebih awal sering merugikan, jadi tanyakan ke perusahaan asuransi berapa yang akan kembali sebelum Anda mengubah apa pun.",
    policyNoSurrender: "Anda tidak memasukkan yang akan dibayar perusahaan asuransi bila Anda berhenti hari ini, jadi kami menghitungnya nol. Berhenti tampak lebih buruk di sini daripada kenyataannya: mintalah nilai tebusnya ke perusahaan asuransi lalu tambahkan.",
    policyMatured: "Semua premi polis ini sudah dibayar, jadi tidak ada lagi yang bisa dibandingkan. Ambil nilai jatuh temponya saat tiba waktunya.",
    multipleOutsideBand: "Patokan umum adalah perlindungan jiwa sepuluh sampai lima belas kali penghasilan bersih tahunan. Angka Anda di luar rentang itu karena keluarga, utang, dan tabungan Anda; angka di atas dihitung khusus untuk Anda.",
    noHealthPriceTable: "Kami tidak punya tabel harga asuransi kesehatan di negara Anda, jadi premi kesehatan ditampilkan nol. Mintalah penawaran untuk perlindungan di atas ke perusahaan asuransi.",
  },

  check: {
    regulator: "Pastikan perusahaan asuransi berizin dari regulator asuransi. Cek di situs web regulator sebelum Anda tanda tangan.",
    claimSettlement: "Tanyakan berapa porsi klaim yang dibayar perusahaan asuransi. Di antara perusahaan asuransi jiwa di sini angkanya sekitar {claimSettlement}; pilih yang jauh di atas itu.",
    complaints: "Ketahui tempat mengadu. Bila klaim ditolak atau ditunda tanpa alasan jelas, layanan pengaduan regulator bisa turun tangan.",
    waitingPeriods: "Baca masa tunggunya. Banyak polis kesehatan tidak membayar penyakit tertentu di tahun pertama atau kedua.",
    exclusions: "Baca daftar pengecualian sebelum tanda tangan, bukan setelah mengajukan klaim.",
    cashlessNetwork: "Cek rumah sakit mana yang menerima polis tanpa Anda membayar lebih dulu, termasuk yang dekat dengan tempat tinggal keluarga Anda.",
    honestProposal: "Jawab setiap pertanyaan di formulir pengajuan dengan jujur, termasuk soal merokok dan riwayat penyakit. Jawaban yang salah adalah alasan paling umum klaim ditolak.",
    buyYoung: "Beli lebih awal. Premi lebih murah selagi Anda muda dan sehat, dan penyakit di kemudian hari bisa membuat perlindungan sulit didapat.",
    medicalTests: "Bersiaplah untuk tes kesehatan bila perlindungannya besar. Jalani saja: tes itu melindungi klaim Anda nanti.",
  },
};
