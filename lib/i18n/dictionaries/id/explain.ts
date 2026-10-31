// Input names per step are documented in ../en/explain.ts; the placeholders here must match.
import type { Dictionary } from "../../types";
import { explainM2 } from "./explain-m2";
import { explainM6 } from "./explain-m6";
import { explainM7 } from "./explain-m7";

export const explain: Dictionary["explain"] = {
  m2: explainM2,
  m6: explainM6,
  m7: explainM7,
  m1: {
    months: {
      title: "Jumlah bulan yang ditanggung",
      body: "Kami mulai dari {base} bulan. Penghasilan tidak tetap menambah {bumpIrregular}, menjadi satu-satunya pencari nafkah dengan tanggungan menambah {bumpSoleEarner}, dan tidak punya asuransi kesehatan menambah {bumpNoHealth}. Sarannya tetap antara {min} dan {max} bulan: {result}. Penggesernya bebas Anda atur.",
    },
    target: {
      title: "Target dana darurat",
      body: "Kebutuhan pokok bulanan Anda dikali jumlah bulan yang ditanggung: {essentials} × {months} = {result}. Hanya kebutuhan pokok yang dihitung, karena dalam keadaan darurat semua yang lain berhenti.",
    },
    gap: {
      title: "Masih perlu ditabung",
      body: "Target dikurangi yang sudah bisa Anda ambil hari ini: {target} − {saved} = {result}. Tidak pernah di bawah nol; dana yang lebih besar dari rencana tidak masalah.",
    },
    monthly: {
      title: "Tabungan bulanan",
      body: "Kekurangannya dibagi rata ke jumlah bulan yang Anda pilih untuk mengumpulkannya: {gap} ÷ {buildMonths} = {result} sebulan.",
    },
    covered: {
      title: "Bulan yang terpenuhi",
      body: "Berapa bulan kebutuhan pokok yang bisa ditanggung tabungan Anda saat ini: {saved} ÷ {essentials} = {result}.",
    },
    tier1: {
      title: "Lapisan 1: rekening tabungan (tarik hari itu juga)",
      body: "Kebutuhan pokok satu bulan tetap di rekening tabungan yang bisa Anda tarik hari ini: {essentials} = {result}. Inilah uang untuk minggu pertama keadaan darurat apa pun.",
    },
    tier2: {
      title: "Lapisan 2: tangga FDR 3 bulan",
      body: "Semua di atas lapisan 1 masuk ke FDR: {target} − {tier1} = {result}, dibagi ke tiga FDR yang dibuka berselang satu bulan agar satu jatuh tempo setiap bulan.",
    },
    banks: {
      title: "Jumlah bank yang dibutuhkan",
      body: "Penjaminan simpanan menanggung {limit} per bank, dan seluruh dana disimpan di simpanan bank, jadi targetnya dibagi: {target} ÷ {limit}, dibulatkan ke atas, = {result} bank.",
    },
  },

  m3: {
    totalEmi: {
      title: "Total cicilan bulanan",
      body: "Semua cicilan pinjaman ditambah pembayaran minimum saldo kartu yang tidak Anda lunasi: {emis} + {cardMinimums} = {result}.",
    },
    emiRatio: {
      title: "Porsi cicilan dari penghasilan bersih",
      body: "Total cicilan dibagi penghasilan bersih: {totalEmi} ÷ {takeHome} = {result}. Pemberi pinjaman punya batasnya sendiri; kami menandai porsi yang tinggi karena hanya sedikit yang tersisa untuk menabung.",
    },
    capacity: {
      title: "Kemampuan cicilan",
      body: "Sisa untuk membayar pinjaman setelah Anda menabung dulu, membayar kebutuhan pokok, dan menyimpan cadangan tunai: {takeHome} − {savings} − {essentials} − {buffer} = {result}.",
    },
    maxLoan: {
      title: "Pinjaman maksimal yang terjangkau",
      body: "Rumus cicilan standar yang dihitung terbalik. Dengan bunga bulanan {monthlyRate} selama {months} bulan: {capacity} × (1 − (1 + {monthlyRate})^−{months}) ÷ {monthlyRate} = {result}. Tambahkan batas aman Anda sendiri sebelum meminjam.",
    },
    scenarioEmi: {
      title: "Cicilan bulanan untuk pinjaman ini",
      body: "Rumus cicilan standar. Untuk {principal} dengan bunga bulanan {monthlyRate} selama {months} bulan: {principal} × {monthlyRate} ÷ (1 − (1 + {monthlyRate})^−{months}) = {result}.",
    },
    interestSaved: {
      title: "Bunga yang dihemat",
      body: "Melunasi utang berbunga tertinggi dulu memakan total bunga {avalancheInterest}; saldo terkecil dulu memakan {snowballInterest}. Selisihnya, {result}, adalah yang Anda hemat dengan mendahulukan bunga tertinggi.",
    },
  },

  m4: {
    average: {
      title: "Rata-rata penghasilan bulanan",
      body: "Penghasilan dirata-ratakan selama {months} bulan terakhir: {total} ÷ {months} = {result}. Untuk gaji tetap ini sama dengan penghasilan bersih Anda; pekerja lepas dan pemilik usaha sebaiknya memasukkan enam bulan terakhir agar naik-turunnya merata.",
    },
    feasible: {
      title: "Paling banyak yang bisa ditabung",
      body: "Sisa setelah kebutuhan pokok, sebagai porsi dari penghasilan: ({average} − {essentials}) ÷ {average} = {result}. Porsi yang disarankan tidak pernah melebihi ini.",
    },
    amount: {
      title: "Tabungan bulanan",
      body: "Penghasilan dikali porsi tabungan Anda: {average} × {rate} = {result}. Jumlah ini pindah ke tabungan saat gajian, sebelum apa pun dibelanjakan.",
    },
    expenses: {
      title: "Sisa untuk dibelanjakan",
      body: "Penghasilan dikurangi tabungan adalah biaya hidup Anda: {average} − {savings} = {result}. Itulah intinya: menabung dulu, belanjakan sisanya.",
    },
  },

  m5: {
    fv: {
      title: "Biaya tujuan di masa depan",
      body: "Biaya hari ini dinaikkan dengan inflasi setiap tahun sampai tujuan tercapai: {cost} × (1 + {inflation})^{years} = {result}. Inilah angka yang benar-benar harus Anda capai.",
    },
    rate: {
      title: "Imbal hasil setelah pajak",
      body: "{instrument} memberi {nominal} per tahun sebelum pajak. Setelah pajak {tax} yang dipotong langsung, Anda menerima {result} per tahun.",
    },
    monthly: {
      title: "Tabungan bulanan yang dibutuhkan",
      body: "Jumlah yang tumbuh menjadi biaya masa depan dengan bunga bulanan {monthlyRate} selama {months} bulan: {fv} × {monthlyRate} ÷ ((1 + {monthlyRate})^{months} − 1) = {result}.",
    },
    real: {
      title: "Imbal hasil riil",
      body: "Pertambahan daya beli uang Anda setiap tahun: (1 + {afterTax}) ÷ (1 + {inflation}) − 1 = {result}. Di bawah nol berarti instrumen ini kalah dari inflasi meski memberi bunga.",
    },
  },

  plan: {
    total: {
      title: "Jumlah bulanan Anda",
      body: "Jumlah menabung dulu dari anggaran Anda: {savings} = {result}. Setiap pos di bawah diambil dari satu angka ini.",
    },
    emergencyShare: {
      title: "Porsi untuk dana darurat",
      body: "Sampai dana penuh, dana darurat mengambil yang diminta kalkulatornya, {m1Monthly} sebulan, tetapi dijaga antara {minShare} dan {maxShare} dari jumlah bulanan Anda ({total}) agar pos lain tetap mendapat bagian. Tidak pernah lebih dari {gap} yang masih perlu ditabung: {result}.",
    },
    debtShare: {
      title: "Porsi untuk utang berbunga tinggi",
      body: "Sisa setelah dana darurat masuk ke utang di atas batas bunga tinggi, sampai kebutuhan pelunasannya (semua saldo berbunga tinggi ÷ target jumlah bulan): min({remaining}, {headroom}) = {result}.",
    },
    goalsShare: {
      title: "Porsi untuk tujuan",
      body: "Apa pun yang tersisa membiayai tujuan Anda: min({remaining}, {goalsNeed}) = {result}. Bila kurang dari kebutuhan tujuan, rencana menampilkan kekurangannya.",
    },
    goalAllocation: {
      title: "Porsi untuk tujuan ini",
      body: "Tujuan ini butuh {need} sebulan dan semua tujuan Anda bersama butuh {goalsNeed}. Sisa {remaining} setelah pos-pos di atas dibagi menurut perbandingan itu: {remaining} × {need} ÷ {goalsNeed} = {result}.",
    },
  },
};
