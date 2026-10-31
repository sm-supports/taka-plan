import type { Dictionary } from "../../types";

/** Plan screen. `reason.*` and `next.*` cover PLAN_REASON_KEYS / PLAN_NEXT_KEYS (params: see en/plan.ts). */
export const plan: Dictionary["plan"] = {
  title: "Rencana Anda",
  headline: "Tabung {amount} sebulan",
  subhead: "Dibagi ke pos-pos Anda menurut prioritas. Ketuk kartu untuk mengubahnya; rencana langsung diperbarui.",
  emptyGoals: "Belum ada tujuan. Tambahkan satu — pensiun juga termasuk — dan rencana akan menyediakan tempat untuknya.",
  builtOn: "Disusun dengan suku bunga v{version}",
  demoBanner: "Contoh rencana dari angka demo, bukan angka Anda. Buka rencana tanpa mode demo untuk melihat milik Anda.",

  why: {
    headline: "Kenapa menabung {amount} sebulan?",
    bucket: "Kenapa {amount} untuk {bucket}?",
  },

  error: {
    title: "Rencana Anda belum siap",
    retry: "Coba lagi",
  },

  card: {
    amount: "Jumlah",
    instrument: "Ke mana",
    reason: "Kenapa",
    nextStep: "Langkah berikutnya",
    open: "Buka kalkulator",
    priority: "Prioritas {n}",
    perMonth: "{amount}/bulan",
    goalTitle: "Tujuan: {name}",
    bucket: {
      emergency: "Dana darurat",
      insurance: "Asuransi",
      debt: "Pelunasan utang",
      goal: "Tujuan",
      retirement: "Pensiun",
      future: "Masa depan",
    },
  },

  more: {
    title: "Lengkapi rencana Anda",
    start: "Mulai",
    edit: "Ubah",
    reserved: "Rencana menyisihkan {amount} sebulan untuk ini.",
    m2: { title: "Asuransi & kesehatan", body: "Berapa perlindungan jiwa dan kesehatan yang dibutuhkan keluarga Anda, dan kira-kira berapa biayanya." },
    m6: { title: "Komposisi aset", body: "Cara membagi uang jangka panjang ke pendapatan tetap, saham, dan emas sesuai usia Anda." },
    m7: { title: "Pensiun & keluarga", body: "Berapa yang Anda butuhkan untuk hidup dari uang sendiri sampai usia 100, dan sumber penghasilan mana yang menguranginya." },
  },

  summary: {
    title: "Ringkasan",
    emergencyShare: "{share} dari jumlah bulanan Anda masuk ke dana darurat sampai penuh.",
    monthsToFull: "Dana darurat penuh dalam {months}.",
    emergencyFull: "Dana darurat Anda sudah penuh.",
    goalsShortfall: "Tujuan Anda butuh {amount} lebih banyak per bulan daripada yang bisa dimuat rencana saat ini.",
    noShortfall: "Semua tujuan muat dalam jumlah bulan ini.",
    retirementShortfall: "Pensiun butuh {amount} lebih banyak per bulan daripada yang bisa dimuat rencana saat ini.",
  },

  reason: {
    emergency: "Dana darurat — {amount}/bulan ke {instrument} — {covered} dari {months} bulan sudah terpenuhi",
    emergencyFull: "Dana darurat — penuh untuk {months} bulan kebutuhan pokok — isi lagi setiap kali dipakai",
    debt: "Utang berbunga tinggi {rate} — {amount}/bulan di luar cicilan Anda — lunas dalam sekitar {months} dengan laju ini",
    debtNever: "Utang berbunga tinggi {rate} — {amount}/bulan di luar cicilan Anda — dengan laju ini tidak akan lunas, jadi bayar lebih banyak atau pindahkan ke pinjaman yang lebih murah",
    debtNone: "Utang berbunga tinggi {rate} — belum ada yang muat bulan ini — bayar setidaknya jumlah minimum untuk setiap utang",
    goal: "{name} — {amount}/bulan ke {instrument} — Anda akan butuh {fv} dalam {years}",
    addGoal: "Tambahkan tujuan — setiap rencana butuh setidaknya satu, dan pensiun juga termasuk",
    insurance: "Asuransi — {amount}/bulan disisihkan untuk asuransi jiwa berjangka dan kesehatan",
    insuranceNone: "Asuransi — belum ada yang muat bulan ini — perlindungan tetap penting, jadi buka cek asuransi",
    retirement: "Pensiun — {amount}/bulan agar uang Anda cukup sampai usia {planTo}",
    retirementShort: "Pensiun — {amount}/bulan dari {need} yang Anda butuhkan — cukup sampai usia {lastsTo}",
    retirementShortNoAge: "Pensiun — {amount}/bulan dari {need} yang Anda butuhkan",
    retirementNone: "Pensiun — belum ada yang muat bulan ini dari {need} per bulan yang Anda butuhkan",
    future: "Tabungan jangka panjang — {amount}/bulan ke {instrument} sampai Anda menambah tujuan",
  },

  next: {
    fdrLadder: "Datangi bank mana saja dengan kartu identitas dan nomor pajak Anda; minta {product} 3 bulan. Buka satu setiap bulan selama tiga bulan agar satu jatuh tempo setiap bulan.",
    openSavings: "Buka {product} di bank mana saja dengan kartu identitas Anda. Simpan kebutuhan pokok satu bulan di sana dan sisanya di deposito 3 bulan.",
    prepayDebt: "Hubungi pemberi pinjaman dan tanyakan cara membayar pokok tambahan tanpa denda. Dahulukan utang dengan bunga tertinggi.",
    dps: "Minta bank Anda membuka {product} dengan debit otomatis sehari setelah gaji masuk. Berapa pun jumlahnya tidak masalah; kebiasaannya lebih penting daripada besarnya.",
    sanchayapatra: "Bawa kartu identitas, nomor pajak, dan cek dari rekening bank Anda ke cabang bank atau kantor pos yang menjual sertifikat tabungan pemerintah, lalu minta {product}.",
    tbond: "Minta bank Anda mendaftarkan Anda untuk lelang obligasi negara dan ajukan penawaran {product} 5 atau 10 tahun; Anda juga bisa membeli yang sudah terbit lewat rekening efek.",
    fdr: "Datangi bank mana saja dengan kartu identitas dan nomor pajak Anda; minta {product} 1 tahun dan simpan bukti depositonya di tempat aman.",
    addGoal: "Ketuk “Tambah tujuan”, beri nama, biayanya dalam nilai uang hari ini, dan berapa tahun lagi.",
    keepFull: "Dana Anda sudah penuh: biarkan di tempatnya. Setelah ada penarikan, kembalikan jumlah yang sama sebelum menabung untuk hal lain, agar utuh lagi.",
    insurance: "Buka cek asuransi: kalkulator ini menghitung perlindungan jiwa dan kesehatan yang dibutuhkan keluarga Anda dan kira-kira biayanya.",
    retirement: "Buka rencana pensiun: lihat berapa yang Anda butuhkan untuk hidup dari uang sendiri sampai usia 100, dan sumber penghasilan mana yang menguranginya.",
    allocation: "Buka komposisi aset: kalkulator ini membagi uang jangka panjang ke pendapatan tetap, saham, dan emas sesuai usia Anda.",
  },

  note: {
    insuranceSkipped: "Jawaban asuransi Anda tidak bisa dihitung dengan profil Anda saat ini, jadi asuransi untuk sementara tidak dimasukkan dalam rencana. Buka cek asuransi untuk memperbaruinya.",
    allocationSkipped: "Jawaban komposisi aset Anda tidak bisa dihitung dengan profil Anda saat ini, jadi untuk sementara rencana memakai pendapatan tetap. Buka komposisi aset untuk memperbaruinya.",
    retirementSkipped: "Jawaban pensiun Anda tidak lagi cocok dengan profil Anda (misalnya usia Anda berubah), jadi pensiun untuk sementara tidak dimasukkan dalam rencana. Buka rencana pensiun untuk memperbaruinya.",
  },
};
