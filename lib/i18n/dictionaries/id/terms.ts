import type { Dictionary } from "../../types";

/** Tap-to-explain glossary. Bangladesh-specific, no product or bank names. */
export const terms: Dictionary["terms"] = {
  fdr: {
    title: "FDR (deposito berjangka)",
    body: "Sejumlah uang yang Anda simpan di bank untuk jangka waktu tetap, dari beberapa bulan hingga beberapa tahun, dengan bunga tetap. Mencairkannya lebih awal biasanya membuat Anda kehilangan bunganya. Penjaminan simpanan hanya menanggung jumlah terbatas per bank.",
  },
  dps: {
    title: "DPS (tabungan berencana)",
    body: "Skema tabungan bulanan di bank: jumlah tetap didebit otomatis pada tanggal yang sama tiap bulan selama beberapa tahun, lalu dibayarkan kembali beserta bunganya di akhir. Ini cara termudah untuk menabung dulu, karena uangnya keluar sebelum sempat Anda belanjakan.",
  },
  sanchayapatra: {
    title: "Sanchayapatra (sertifikat tabungan nasional)",
    body: "Sertifikat tabungan pemerintah yang dijual lewat bank dan kantor pos, biasanya untuk tiga atau lima tahun, dengan bunga yang ditinjau pemerintah dua kali setahun. Bunganya lebih tinggi dari simpanan bank, tetapi lebih rendah bila dicairkan lebih awal, dan ada batas berapa banyak yang boleh dimiliki satu orang.",
  },
  bo_account: {
    title: "Rekening BO",
    body: "Rekening pemilik manfaat (beneficiary owner) di perusahaan sekuritas, yang diperlukan untuk membeli atau menyimpan saham, unit reksa dana, atau obligasi yang tercatat di bursa. Membukanya memerlukan NID, rekening bank, dan biaya kecil.",
  },
  sum_insured: {
    title: "Uang pertanggungan",
    body: "Jumlah maksimal yang dibayarkan polis asuransi. Untuk asuransi jiwa berjangka, inilah yang diterima keluarga Anda bila Anda meninggal; untuk asuransi kesehatan, inilah batas tahunan biaya rumah sakit yang ditanggung.",
  },
  emi: {
    title: "EMI (cicilan bulanan tetap)",
    body: "Jumlah tetap yang Anda bayar ke pemberi pinjaman setiap bulan. Di awal, sebagian besar adalah bunga; belakangan, sebagian besar adalah pokok pinjaman. Jumlahkan semua EMI untuk melihat berapa bagian penghasilan Anda yang sudah terpakai.",
  },
  cib: {
    title: "Laporan CIB",
    body: "Catatan kredit Bangladesh Bank untuk setiap peminjam, yang diperiksa pemberi pinjaman sebelum menyetujui pinjaman atau kartu. Pembayaran yang terlambat atau terlewat tetap tercatat di sana dan membuat pinjaman berikutnya lebih sulit atau lebih mahal.",
  },
  tbill: {
    title: "Surat perbendaharaan negara",
    body: "Surat utang pemerintah jangka pendek, dilelang untuk 91, 182, atau 364 hari. Anda membelinya di bawah nilai nominal dan menerima jumlah penuh saat jatuh tempo; selisihnya adalah imbal hasil Anda. Dijamin pemerintah, jadi sangat aman.",
  },
  tbond: {
    title: "Obligasi negara",
    body: "Surat utang pemerintah jangka panjang, dari dua hingga dua puluh tahun, yang membayar bunga dua kali setahun. Dibeli lewat lelang Bangladesh Bank melalui bank, atau di bursa melalui rekening BO.",
  },
  ladder: {
    title: "Tangga FDR",
    body: "Alih-alih satu FDR besar, Anda membuka beberapa FDR kecil dengan jarak satu bulan. Dengan begitu satu FDR jatuh tempo setiap bulan, jadi Anda selalu bisa segera mendapat uang tunai tanpa mencairkan deposito lebih awal.",
  },
  real_return: {
    title: "Imbal hasil riil",
    body: "Pertambahan daya beli uang Anda setelah pajak dan inflasi. FDR dengan bunga tertera tinggi tetap bisa punya imbal hasil riil negatif bila harga naik lebih cepat dari bunga yang Anda terima.",
  },
  take_home: {
    title: "Penghasilan bersih",
    body: "Uang yang benar-benar masuk ke rekening Anda setiap bulan setelah pajak, iuran dana hari tua, dan potongan lain. Untuk pekerja lepas dan pemilik usaha, pakai rata-rata enam bulan terakhir.",
  },
  grace_period: {
    title: "Masa bebas bunga",
    body: "Hari-hari antara tanggal tagihan kartu kredit dan tanggal jatuh temponya, saat tidak ada bunga yang dikenakan. Lunasi tagihan penuh dalam masa ini dan kartu tidak memakan biaya; bila ada sisa yang terbawa, bunga berjalan untuk setiap pembelian.",
  },
};
