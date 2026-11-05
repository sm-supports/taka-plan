// Indonesian (Bahasa Indonesia). Register: "Anda", plain and warm. Western digits only.
//
// Glossary (English → Bahasa Indonesia), used consistently across every id file:
//   emergency fund            → dana darurat
//   take-home (pay)           → penghasilan bersih (bulanan)
//   essentials / essential spending → kebutuhan pokok / pengeluaran pokok
//   dependents                → tanggungan
//   savings account           → rekening tabungan
//   fixed deposit / term deposit (FDR) → deposito berjangka (FDR kept as a Bangladesh name)
//   recurring deposit (DPS)   → tabungan berencana (DPS kept as a Bangladesh name)
//   government savings certificate (Sanchayapatra) → sertifikat tabungan pemerintah (Sanchayapatra kept)
//   treasury bill             → surat perbendaharaan negara
//   treasury bond / government bond → obligasi negara
//   (open-end) equity fund    → reksa dana saham (terbuka)
//   shares / equity           → saham
//   fixed income              → pendapatan tetap
//   asset mix                 → komposisi aset
//   headline rate             → bunga tertera
//   real return               → imbal hasil riil
//   after tax / after inflation → setelah pajak / setelah inflasi
//   tax deducted at source    → pajak yang dipotong langsung
//   policy rate               → suku bunga acuan
//   central bank              → bank sentral (Bangladesh Bank kept)
//   EMI (instalment)          → cicilan (EMI kept in Bangladesh-only copy)
//   principal                 → pokok pinjaman
//   prepayment                → pelunasan dipercepat
//   credit card balance carried → saldo kartu kredit yang tidak dilunasi
//   grace period              → masa bebas bunga
//   term life insurance       → asuransi jiwa berjangka
//   health insurance / cover  → asuransi kesehatan / perlindungan
//   sum insured / sum assured → uang pertanggungan
//   premium                   → premi
//   endowment policy          → asuransi dwiguna
//   surrender value           → nilai tebus
//   maturity                  → jatuh tempo
//   deposit insurance         → penjaminan simpanan
//   brokerage account         → rekening efek (BO account kept)
//   FDR ladder                → tangga deposito
//   retirement                → pensiun
//   goal                      → tujuan
//   savings rate              → porsi tabungan
//   inflation                 → inflasi
import type { Dictionary } from "../../types";

/** Shared strings: app chrome, buttons, status labels, instrument names, enum labels, disclaimer. */
export const common: Dictionary["common"] = {
  appName: "Taka Plan",
  tagline: "Berapa yang Anda butuhkan untuk tiap tujuan, dan ke mana menaruhnya setiap bulan.",
  loading: "Memuat…",
  yes: "Ya",
  no: "Tidak",
  optional: "Opsional",

  nav: {
    home: "Beranda",
    plan: "Rencana saya",
    calculators: "Kalkulator",
    admin: "Admin suku bunga",
    language: "Bahasa",
  },

  button: {
    next: "Lanjut",
    back: "Kembali",
    seePlan: "Lihat rencana saya",
    whyThisNumber: "Kenapa angka ini?",
    why: "Kenapa?",
    close: "Tutup",
    edit: "Ubah",
    save: "Simpan",
    cancel: "Batal",
    reset: "Mulai ulang",
    tryAgain: "Coba lagi",
    learnMore: "Selengkapnya",
    add: "Tambah",
    remove: "Hapus",
    done: "Selesai",
    skip: "Lewati",
    openCalculator: "Buka kalkulator",
  },

  status: {
    red: "Perlu perhatian sekarang",
    amber: "Perlu dipantau",
    green: "Sesuai rencana",
  },
  alsoNeedsAttention: "Juga perlu perhatian",

  module: {
    m1: "Dana darurat",
    m2: "Asuransi & kesehatan",
    m3: "Cek kesehatan utang",
    m4: "Anggaran menabung dulu",
    m5: "Perencana tujuan",
    m6: "Komposisi aset",
    m7: "Pensiun & keluarga",
    plan: "Rencana Anda",
  },

  instrument: {
    savings_account: "Rekening tabungan",
    fdr_3m: "Deposito berjangka 3 bulan",
    fdr_1y: "Deposito berjangka 1 tahun",
    dps: "Tabungan berencana",
    sanchayapatra_5y: "Sertifikat tabungan pemerintah",
    tbill_91d: "Surat perbendaharaan negara 91 hari",
    tbond_5y: "Obligasi negara 5 tahun",
    tbond_10y: "Obligasi negara 10 tahun",
    equity_fund: "Reksa dana saham terbuka",
    gold: "Emas (batangan atau koin 22K)",
    loan_prepayment: "Pembayaran ekstra pinjaman",
    term_insurance: "Asuransi jiwa berjangka",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "rekening tabungan",
    fdr_3m: "deposito berjangka",
    fdr_1y: "deposito berjangka",
    dps: "tabungan berencana",
    sanchayapatra_5y: "sertifikat tabungan pemerintah",
    tbill_91d: "surat perbendaharaan negara",
    tbond_5y: "obligasi negara",
    tbond_10y: "obligasi negara",
    equity_fund: "reksa dana saham",
    gold: "emas",
  },

  /** An instrument inside a sentence ("into {instrument}"); {product} is the country's product name. */
  instrumentInline: {
    savings_account: "{product}",
    fdr_3m: "{product} 3 bulan",
    fdr_1y: "{product} 1 tahun",
    dps: "{product}",
    sanchayapatra_5y: "{product}",
    tbill_91d: "{product} 91 hari",
    tbond_5y: "{product} 5 tahun",
    tbond_10y: "{product} 10 tahun",
    equity_fund: "reksa dana saham terbuka",
    gold: "emas batangan atau koin",
    loan_prepayment: "pembayaran ekstra pinjaman",
    term_insurance: "asuransi jiwa berjangka",
  },

  unit: {
    month: "bulan",
    months: "bulan",
    year: "tahun",
    years: "tahun",
    perMonth: "/bulan",
    perYear: "per tahun",
    taka: "৳",
    percent: "%",
  },

  offline: "Anda sedang offline — memakai suku bunga tersimpan",
  ratesVersion: "Suku bunga v{version}, {asOf}",
  mayBeOutdated: "Mungkin sudah usang",
  ourAssumption: "Asumsi kami",
  ourSource: "Taka Plan (asumsi kami)",
  source: "Sumber",
  asOf: "Per {date}",
  range: "Rentang {low}–{high}",
  afterTax: "Setelah pajak",
  afterInflation: "Setelah inflasi",
  headline: "Bunga tertera",

  disclaimer: {
    short:
      "Perkiraan untuk edukasi saja; bukan nasihat keuangan, pajak, atau hukum. Suku bunga berubah — tanyakan ke bank atau perusahaan asuransi Anda sebelum bertindak. Imbal hasil masa lalu tidak menjamin imbal hasil masa depan.",
    title: "Sebelum Anda mulai",
    body:
      "Taka Plan memberi perkiraan untuk edukasi saja. Ini bukan nasihat keuangan, pajak, atau hukum, dan tidak pernah menyebut nama bank, reksa dana, atau perusahaan asuransi. Suku bunga dan aturan pajak berubah beberapa kali setahun, jadi tanyakan ke bank atau perusahaan asuransi Anda sebelum bertindak berdasarkan angka di sini. Imbal hasil masa lalu tidak menjamin imbal hasil masa depan. Jawaban Anda tetap di ponsel Anda.",
    accept: "Saya mengerti",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "Pilih bahasa",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "Bahasa: {language}",
  changeCountry: "Ganti negara",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "Negara {country}. Ganti negara",

  incomeType: {
    salaried: "Karyawan bergaji",
    freelance: "Pekerja lepas",
    business: "Pemilik usaha",
  },

  dependent: {
    none: "Tidak ada",
    partner: "Pasangan",
    children: "Anak",
    parents: "Orang tua",
  },

  goalType: {
    general: "Umum",
    education: "Pendidikan",
    health: "Kesehatan",
    wedding: "Pernikahan",
    vehicle: "Kendaraan",
    home: "Rumah atau tanah",
    travel: "Perjalanan",
  },

  loanType: {
    personal: "Pinjaman pribadi",
    home: "KPR",
    car: "Kredit mobil",
    education: "Pinjaman pendidikan",
    other: "Pinjaman lain",
  },

  horizon: {
    short: "Kurang dari 3 tahun",
    medium: "3 sampai 5 tahun",
    long: "Lebih dari 5 tahun",
  },

  explain: {
    title: "Kenapa angka ini?",
    steps: "Cara kami menghitungnya",
    assumptions: "Suku bunga yang dipakai",
    notes: "Catatan",
    stale: "Suku bunga ini sudah lewat tanggal tinjauannya",
  },

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "Mulai dari awal",
    startOverHint: "Jawaban Anda saat ini disimpan sebagai draf.",
    confirmTitle: "Mulai dari awal?",
    confirmBody: "Jawaban Anda saat ini disimpan sebagai draf. Anda bisa membukanya lagi kapan saja dari Draf Anda.",
    confirm: "Ya, mulai lagi",
    cancel: "Batal",
    saved: "Disimpan sebagai draf",
    alreadySaved: "Sudah disimpan sebagai draf",
    deleted: "Draf dihapus",
    title: "Draf Anda",
    sectionTitle: "Draf Anda ({count})",
    intro: "Jawaban yang Anda simpan saat mulai lagi. Buka salah satu untuk melihat rencananya.",
    empty: "Belum ada draf. Saat Anda mulai dari awal, jawaban Anda saat ini disimpan di sini.",
    seeAll: "Lihat semua draf",
    backToPlan: "Kembali ke rencana saya",
    updated: "Diperbarui {date}",
    current: "Sedang dibuka",
    open: "Buka",
    rename: "Ganti nama",
    renameLabel: "Nama draf",
    renameHint: "Maksimal {max} huruf. Kosongkan untuk memakai nama otomatis.",
    delete: "Hapus",
    deleteTitle: "Hapus draf ini?",
    deleteBody: "Draf ini dihapus dari ponsel ini dan tidak bisa dikembalikan.",
    deleteConfirm: "Ya, hapus",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "Anda sudah punya {max} draf, jadi draf tertua tanpa nama, “{label}”, akan dihapus. Beri nama pada draf untuk menyimpannya.",
    openTitle: "Buka draf ini?",
    openConfirm: "Ya, buka",
    label: {
      age: "Usia {age}",
      takeHome: "{amount}/bulan",
      goalsOne: "{count} tujuan",
      goalsOther: "{count} tujuan",
      m2: "Asuransi",
      m6: "Investasi",
      m7: "Pensiun",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "Kami belum punya angka hasil riset untuk {country}, jadi jumlahnya memakai angka Bangladesh dan taka.",
    changeCountry: "Ganti negara",
    someFallback: "Sebagian angka untuk {country} adalah perkiraan regional, bukan angka negara itu sendiri.",
    about: "Dari mana angka-angkanya",
  },
};
