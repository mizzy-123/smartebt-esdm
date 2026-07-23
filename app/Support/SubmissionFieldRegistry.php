<?php

namespace App\Support;

use App\Enums\FieldReviewStatus;
use App\Enums\SubmissionCategory;

/**
 * Defines all reviewable field keys and their labels per category.
 * Used to initialize field_reviews JSON and validate admin review actions.
 */
class SubmissionFieldRegistry
{
    /**
     * Base fields shared by ALL categories (from submissions table).
     */
    private static array $baseFields = [
        'nama_pemohon'                  => 'Nama Pemohon',
        'nomor_identitas'               => 'Nomor Identitas (NIK/KTP)',
        'alamat_organisasi'             => 'Alamat Organisasi',
        'nama_ketua'                    => 'Nama Ketua',
        'surat_permohonan_proposal_path' => 'Surat Permohonan & Proposal',
        'dokumen_kepengurusan_path'     => 'Dokumen Kepengurusan',
        'dokumen_sk_kemenkumham_path'   => 'SK Kemenkumham / Surat Dinas',
        'surat_keterangan_desa_path'    => 'Surat Keterangan Desa',
        'latitude'                      => 'Koordinat Lokasi',
        'deskripsi_titik'               => 'Deskripsi Titik Lokasi',
    ];

    /**
     * Fields specific to plts_rooftop & plts_perikanan categories.
     */
    private static array $pltsFields = [
        'kesediaan_ganti_kwh_pascabayar' => 'Kesediaan Ganti KWH Pascabayar',
    ];

    /**
     * Extra detail fields per category (from their respective detail tables).
     */
    private static array $categoryFields = [
        'peternakan_ebt' => [
            'jenis_teknologi'      => 'Jenis Teknologi',
            'kapasitas_kandang_m2' => 'Kapasitas Kandang (m²)',
            'jenis_ternak'         => 'Jenis Ternak',
            'jenis_usaha'          => 'Jenis Usaha',
            'jumlah_ternak'        => 'Jumlah Ternak',
            'ketersediaan_lahan'   => 'Ketersediaan Lahan',
            'komitmen_pengelolaan' => 'Komitmen Pengelolaan',
        ],
        'plts_rooftop' => [
            'kapasitas_kwh_eksisting'  => 'Kapasitas KWH Eksisting',
            'kondisi_lokasi'           => 'Kondisi Lokasi',
            'panjang_instalasi'        => 'Panjang Instalasi (m)',
            'jenis_bangunan'           => 'Jenis Bangunan',
            'jenis_gedung'             => 'Jenis Gedung',
            'umur_bangunan'            => 'Umur Bangunan',
            'luas_bangunan'            => 'Luas Bangunan (m²)',
            'tinggi_bangunan'          => 'Tinggi Bangunan (m)',
            'jenis_atap'               => 'Jenis Atap',
            'tahun_pemasangan_atap'    => 'Tahun Pemasangan Atap',
            'luas_atap'                => 'Luas Atap (m²)',
            'potensi_bayangan'         => 'Potensi Bayangan',
            'nomor_pelanggan'          => 'Nomor Pelanggan PLN',
            'jenis_layanan_listrik'    => 'Jenis Layanan Listrik',
            'data_pelanggan'           => 'Data Pelanggan',
            'daya_terpasang_pln'       => 'Daya Terpasang PLN (VA)',
            'perkiraan_kapasitas_plts' => 'Perkiraan Kapasitas PLTS (Wp)',
            'jumlah_pengguna'          => 'Jumlah Pengguna',
            'kesediaan_ganti_meteran'  => 'Kesediaan Ganti Meteran',
            'tagihan_listrik'          => 'Tagihan Listrik 6 Bulan',
        ],
        'plts_perikanan' => [
            'kapasitas_kwh_eksisting'    => 'Kapasitas KWH Eksisting',
            'kondisi_lokasi'             => 'Kondisi Lokasi',
            'panjang_instalasi'          => 'Panjang Instalasi (m)',
            'jenis_bangunan'             => 'Jenis Bangunan',
            'jenis_gedung'               => 'Jenis Gedung',
            'umur_bangunan'              => 'Umur Bangunan',
            'luas_bangunan'              => 'Luas Bangunan (m²)',
            'tinggi_bangunan'            => 'Tinggi Bangunan (m)',
            'jenis_atap'                 => 'Jenis Atap',
            'kerangka_atap'              => 'Kerangka Atap',
            'tahun_pemasangan_atap'      => 'Tahun Pemasangan Atap',
            'luas_atap'                  => 'Luas Atap (m²)',
            'potensi_bayangan'           => 'Potensi Bayangan',
            'nomor_pelanggan'            => 'Nomor Pelanggan PLN',
            'jenis_layanan_listrik'      => 'Jenis Layanan Listrik',
            'data_pelanggan'             => 'Data Pelanggan',
            'daya_peralatan_perikanan'   => 'Daya Peralatan Perikanan (W)',
            'jumlah_pengguna'            => 'Jumlah Pengguna',
            'kesediaan_ganti_meteran'    => 'Kesediaan Ganti Meteran',
            'tagihan_listrik'            => 'Tagihan Listrik 6 Bulan',
        ],
        'pats' => [
            'ketersediaan_pompa'        => 'Ketersediaan Pompa',
            'jenis_pompa'               => 'Jenis Pompa',
            'kapasitas_pompa_watt'      => 'Kapasitas Pompa (Watt)',
            'sumber_air'                => 'Sumber Air',
            'izin_pemanfaatan_air'      => 'Izin Pemanfaatan Air',
            'ketersediaan_lahan_kontrol' => 'Ketersediaan Lahan Kontrol',
            'status_kepemilikan_lahan'  => 'Status Kepemilikan Lahan',
        ],
    ];

    /**
     * Get all field keys with their labels for a given category.
     *
     * @return array<string, string>
     */
    public static function fieldsFor(SubmissionCategory|string $category): array
    {
        $cat = $category instanceof SubmissionCategory ? $category->value : $category;
        $base = self::$baseFields;

        // Add PLTS-specific field for rooftop & perikanan
        if (in_array($cat, ['plts_rooftop', 'plts_perikanan'])) {
            $base = array_merge($base, self::$pltsFields);
        }

        return array_merge($base, self::$categoryFields[$cat] ?? []);
    }

    /**
     * Initialize a fresh field_reviews JSON structure for a new submission.
     *
     * @return array<string, array{status: string, reason: null}>
     */
    public static function initializeReviews(SubmissionCategory|string $category): array
    {
        $fields = self::fieldsFor($category);
        $reviews = [];

        foreach (array_keys($fields) as $key) {
            $reviews[$key] = [
                'status' => FieldReviewStatus::Pending->value,
                'reason' => null,
            ];
        }

        return $reviews;
    }

    /**
     * Check whether a field key is valid for a given category.
     */
    public static function isValidFieldKey(SubmissionCategory|string $category, string $fieldKey): bool
    {
        return array_key_exists($fieldKey, self::fieldsFor($category));
    }
}
