import type { Dictionary } from "../../types";

/** Country and language steps on "/" (imported there directly; see en/onboarding.ts). */
export const onboardingEntry: Pick<Dictionary["onboarding"], "country" | "language" | "switchCountry"> = {
  country: {
    title: "Di mana Anda tinggal?",
    subtitle: "Kami memakai mata uang, suku bunga, dan produk tabungan negara Anda.",
    searchLabel: "Cari negara Anda",
    searchPlaceholder: "Nama negara, dalam bahasa Inggris atau bahasa Anda",
    suggested: "Disarankan",
    all: "Semua negara",
    results: "Negara yang cocok",
    noMatch: "Tidak ada negara yang cocok dengan “{query}”.",
    currency: "Mata uang: {code}",
    current: "Pilihan saat ini",
    changeLater: "Anda bisa mengganti negara dan bahasa kapan saja.",
    intro: "Lima pertanyaan singkat, lalu rencana tabungan bulanan Anda. Tanpa perlu akun.",
    disclaimer: "Perkiraan untuk edukasi saja; bukan nasihat keuangan, pajak, atau hukum.",
    region: {
      south_asia: "Asia Selatan",
      east_asia_pacific: "Asia Timur dan Pasifik",
      europe_central_asia: "Eropa dan Asia Tengah",
      latin_america_caribbean: "Amerika Latin dan Karibia",
      middle_east_north_africa: "Timur Tengah dan Afrika Utara",
      north_america: "Amerika Utara",
      sub_saharan_africa: "Afrika Sub-Sahara",
    },
  },
  language: {
    title: "Bahasa apa yang Anda inginkan?",
    subtitle: "Anda bisa menggantinya kapan saja dari menu di atas.",
    country: "Negara: {country}",
    notAvailable: "Bahasa Anda belum tersedia; bahasa Inggris dipakai.",
    changeCountry: "Ganti negara",
  },
  /** "/" when the user picks another country while answers exist: the amounts are in the old currency. */
  switchCountry: {
    title: "Mulai baru untuk {country}?",
    body: "Jawaban Anda dalam {currency}. Mulai baru untuk {country} akan menyimpan jawaban Anda saat ini sebagai draf, jadi Anda bisa membukanya lagi kapan saja.",
    capWarning: "Anda sudah punya {max} draf, jadi draf tertua tanpa nama akan dihapus.",
    confirm: "Mulai baru",
    cancel: "Simpan jawaban saya",
    saved: "Disimpan sebagai draf",
  },
};

/** Five quick questions, one per screen. */
export const onboarding: Dictionary["onboarding"] = {
  country: onboardingEntry.country,
  language: onboardingEntry.language,
  switchCountry: onboardingEntry.switchCountry,

  languagePick: {
    title: "Bahasa apa yang Anda inginkan?",
    subtitle: "Anda bisa menggantinya kapan saja.",
  },

  progress: "Pertanyaan {n} dari 5",
  intro: "Lima pertanyaan singkat, lalu rencana Anda. Tanpa perlu akun.",

  step: {
    1: {
      title: "Berapa usia Anda?",
      hint: "Usia Anda menentukan berapa lama tujuan dan dana pensiun Anda bisa bertumbuh.",
      placeholder: "Usia Anda dalam tahun",
      label: "Usia Anda",
      decadeLabel: "Ketuk pintasan, lalu sesuaikan usia tepatnya di bawah",
      decade: {
        under20: "Di bawah 20",
        twenties: "20-an",
        thirties: "30-an",
        forties: "40-an",
        fifties: "50-an",
        sixtyPlus: "60 ke atas",
      },
      unit: "tahun",
    },
    2: {
      title: "Berapa penghasilan bersih bulanan Anda?",
      hint: "Jumlah yang benar-benar masuk ke rekening Anda setelah pajak dan iuran dana hari tua.",
      hintFreelance: "Penghasilan tidak tetap? Jumlahkan enam bulan terakhir lalu bagi enam.",
      placeholder: "Penghasilan bersih dalam mata uang Anda",
      label: "Penghasilan bersih bulanan",
      incomeTypeLabel: "Bagaimana Anda mendapat penghasilan?",
      incomeTypeHint: {
        salaried: "Gaji tetap setiap bulan",
        freelance: "Bayaran proyek atau klien yang berubah-ubah",
        business: "Keuntungan yang Anda ambil dari usaha sendiri",
      },
      average: {
        toggle: "Hitung dari enam bulan terakhir",
        title: "Penghasilan enam bulan terakhir",
        hint: "Ketik yang Anda terima tiap bulan. Kosongkan bulan yang tanpa penghasilan.",
        month: "Bulan {n}",
        result: "Rata-rata enam bulan: {amount}",
        use: "Pakai {amount} sebagai penghasilan bersih",
        close: "Sembunyikan",
      },
    },
    3: {
      title: "Berapa pengeluaran pokok Anda setiap bulan?",
      hint: "Sewa, makan, listrik dan air, transportasi, biaya sekolah, kiriman untuk orang tua, dan cicilan yang sudah Anda bayar. Jangan masukkan makan di luar, belanja, dan liburan.",
      placeholder: "Pengeluaran pokok dalam mata uang Anda",
      label: "Pengeluaran pokok bulanan",
      countsTitle: "Yang termasuk kebutuhan pokok",
      counts: {
        rent: "Sewa atau cicilan KPR",
        food: "Makanan dan belanja dapur",
        utilities: "Listrik, gas, air, telepon, dan internet",
        transport: "Transportasi",
        school: "Biaya sekolah dan les",
        parents: "Kiriman untuk orang tua",
        emi: "Cicilan pinjaman atau kartu yang sudah Anda bayar",
      },
      leaveOut: "Jangan masukkan makan di luar, belanja, gawai, dan liburan.",
      takeHomeReminder: "Penghasilan bersih Anda: {amount}",
      leftOver: "Sisa setelah kebutuhan pokok: {amount}",
    },
    4: {
      title: "Siapa yang bergantung pada penghasilan Anda?",
      hint: "Pilih semua yang sesuai. Tanggungan memengaruhi dana darurat dan kebutuhan asuransi Anda.",
      none: "Tidak ada yang bergantung pada saya",
      label: "Tanggungan",
      option: {
        partner: "Pasangan",
        children: "Anak",
        parents: "Orang tua",
      },
      optionHint: {
        partner: "Pasangan yang bergantung pada penghasilan Anda",
        children: "Anak yang Anda tanggung",
        parents: "Orang tua atau mertua yang Anda tanggung",
      },
    },
    5: {
      title: "Apakah Anda punya pinjaman atau tagihan kartu kredit yang tidak dilunasi?",
      hint: "Hitung pinjaman bank, kredit mobil atau KPR, dan tagihan kartu yang tidak Anda lunasi penuh tiap bulan.",
      yes: "Ya, saya punya utang",
      no: "Tidak ada utang",
      label: "Pinjaman atau saldo kartu",
      yesNote: "Baik untuk diketahui. Rencana Anda akan memuat cek utang agar utang termahal dilunasi lebih dulu.",
      noNote: "Bagus. Rencana Anda bisa langsung ke menabung.",
      readyTitle: "Itu saja",
      ready: "Rencana Anda disusun dari lima jawaban ini. Anda bisa mengubahnya nanti.",
    },
  },

  summary: {
    age: "Usia {age}",
    takeHome: "Penghasilan bersih {amount}",
    essentials: "Kebutuhan pokok {amount}",
    /** {list}: the people who depend on the user, already joined ("Partner, Children"). */
    dependents: "Tanggungan Anda: {list}",
    noDependents: "Tidak ada tanggungan",
    debt: "Punya pinjaman atau utang kartu",
    noDebt: "Tidak ada utang",
  },

  cta: {
    start: "Mulai",
    seePlan: "Lihat rencana saya",
    next: "Lanjut",
    back: "Kembali",
  },

  validation: {
    required: "Masukkan angka untuk melanjutkan.",
    number: "Masukkan angka saja, misalnya {example}.",
    ageRange: "Masukkan usia antara {min} dan {max}.",
    positiveAmount: "Masukkan jumlah di atas nol.",
    essentialsAboveIncome: "Kebutuhan pokok lebih besar dari penghasilan bersih Anda. Periksa lagi kedua angka — rencana tetap bisa dibuat, tetapi jumlah tabungannya akan sangat kecil.",
    pickOne: "Pilih setidaknya satu, atau “Tidak ada”.",
  },
};
