<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'submission_id', 'kapasitas_kwh_eksisting', 'kondisi_lokasi',
    'panjang_instalasi', 'jenis_bangunan', 'jenis_gedung', 'umur_bangunan',
    'luas_bangunan', 'tinggi_bangunan', 'jenis_atap', 'jenis_atap_lainnya',
    'kerangka_atap', 'kerangka_atap_lainnya', 'tahun_pemasangan_atap',
    'luas_atap', 'potensi_bayangan', 'nomor_pelanggan',
    'jenis_layanan_listrik', 'data_pelanggan', 'daya_peralatan_perikanan',
    'jumlah_pengguna', 'kesediaan_ganti_meteran',
])]
class SubmissionPltsPerikanan extends Model
{
    protected $table = 'submission_plts_perikanan';

    protected function casts(): array
    {
        return [
            'kesediaan_ganti_meteran' => 'boolean',
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }
}
