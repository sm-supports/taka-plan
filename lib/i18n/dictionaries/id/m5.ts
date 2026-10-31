import type { Dictionary } from "../../types";

/** M5 Goal planner. `note.*` covers M5_NOTE_KEYS. */
export const m5: Dictionary["m5"] = {
  title: "Perencana tujuan",
  intro: "Tujuan yang nyata punya jumlah, tanggal, dan usia Anda. Semua orang punya setidaknya satu: pensiun.",

  input: {
    name: { label: "Nama tujuan", hint: "Kuliah anak, uang muka rumah, haji, mobil…", placeholder: "Anda menabung untuk apa?" },
    cost: { label: "Biaya dalam nilai uang hari ini", hint: "Biayanya bila dibayar hari ini. Kami menambahkan inflasinya untuk Anda." },
    years: { label: "Berapa tahun lagi", hint: "Tahun penuh dari sekarang, {min} sampai {max}." },
    type: { label: "Jenis tujuan", hint: "Biaya pendidikan dan kesehatan naik lebih cepat dari harga umum, jadi punya tingkat inflasi sendiri." },
    addGoal: "Tambah tujuan",
    removeGoal: "Hapus tujuan",
    incomplete: "Tujuan perlu nama, biaya, dan jumlah tahun sebelum disimpan.",
    newGoal: "Tujuan baru",
    saveGoal: "Simpan tujuan",
    saved: "Tujuan Anda",
  },

  result: {
    horizon: "Jangka waktu",
    inflation: "Inflasi yang dipakai",
    futureValue: "Anda akan butuh",
    futureValueIn: "{fv} dalam {years}",
    instrument: "Tabung di",
    candidates: "Pilihan lain untuk jangka waktu ini",
    nominal: "Bunga tertera",
    afterTax: "Setelah pajak",
    real: "Imbal hasil riil (setelah pajak dan inflasi)",
    belowInflation: "Di bawah inflasi: uang ini akan bisa membeli lebih sedikit di akhir daripada hari ini",
    monthly: "Tabung setiap bulan",
    monthlyRange: "Rendah {low} · Perkiraan {base} · Tinggi {high}",
    monthlyLow: "Bila imbal hasil rendah",
    monthlyBase: "Perkiraan",
    monthlyHigh: "Bila imbal hasil tinggi",
    months: "Selama {months}",
    totalMonthly: "Semua tujuan",
    invalid: "Tujuan ini masih kurang lengkap",
    empty: "Belum ada tujuan.",
    goalsCount: "{n} tujuan",
    realAbove: "Mengalahkan inflasi setelah pajak",
    perMonth: "sebulan",
  },

  demoBanner: "Contoh tujuan. Tambahkan tujuan Anda sendiri untuk melihat angka sebenarnya.",

  note: {
    noAllocationYet: "Untuk sementara, tujuan jangka panjang hanya memakai instrumen pendapatan tetap. Setelah langkah komposisi aset tersedia, tujuan yang lebih dari lima tahun lagi akan memakai campuran yang mencakup saham.",
    belowInflation: "Perkiraan imbal hasil instrumen ini di bawah inflasi setelah pajak. Anda tetap akan mencapai angkanya, tetapi daya belinya lebih kecil dari harapan. Jangka waktu yang lebih panjang atau instrumen dengan imbal hasil lebih tinggi bisa membantu.",
  },

  status: {
    red: "Perkiraan imbal hasil di bawah inflasi",
    amber: "Bisa tercapai, tetapi ketat",
    green: "Sesuai rencana",
  },
};
