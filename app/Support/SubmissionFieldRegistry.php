<?php

namespace App\Support;

use App\Enums\EntryType;
use App\Enums\FieldReviewStatus;
use App\Enums\SubmissionCategory;

/**
 * Defines all reviewable field keys and their labels per entry type / category.
 */
class SubmissionFieldRegistry
{
    private static array $potensiFields = [
        'lokasi' => 'Lokasi',
        'desa' => 'Desa',
        'kecamatan' => 'Kecamatan',
        'kabupaten' => 'Kabupaten',
        'nama_pengelola' => 'Nama Pengelola',
        'kontak_person' => 'Kontak Person',
        'no_wa' => 'Nomor WhatsApp',
        'foto_kondisi_path' => 'Foto Kondisi Saat Ini',
        'latitude' => 'Koordinat Lokasi',
        'deskripsi_titik' => 'Deskripsi Titik Lokasi',
    ];

    private static array $terbangunFields = [
        'category' => 'Jenis Infrastruktur',
        'nama_pemilik' => 'Nama (Pemrakarsa/Pemilik/Penerima Manfaat)',
        'penanggung_jawab' => 'Penanggung Jawab',
        'kontak_person' => 'Kontak Person',
        'no_wa' => 'Nomor WhatsApp',
        'lokasi' => 'Lokasi',
        'desa' => 'Desa',
        'kecamatan' => 'Kecamatan',
        'kabupaten' => 'Kabupaten',
        'latitude' => 'Koordinat Lokasi',
        'kapasitas' => 'Kapasitas',
        'bauran_energi' => 'Bauran Energi',
        'sumber_pendanaan' => 'Sumber Pendanaan',
        'sumber_pendanaan_detail' => 'Detail Sumber Pendanaan',
        'tahun_pembangunan' => 'Tahun Pembangunan',
        'foto_kondisi_path' => 'Foto Kondisi Saat Ini',
        'deskripsi_titik' => 'Deskripsi Titik Lokasi',
    ];

    /** Legacy base fields for old submissions. */
    private static array $legacyBaseFields = [
        'nama_pemohon' => 'Nama Pemohon',
        'nomor_identitas' => 'Nomor Identitas (NIK/KTP)',
        'alamat_organisasi' => 'Alamat Organisasi',
        'nama_ketua' => 'Nama Ketua',
        'surat_permohonan_proposal_path' => 'Surat Permohonan & Proposal',
        'dokumen_kepengurusan_path' => 'Dokumen Kepengurusan',
        'dokumen_sk_kemenkumham_path' => 'SK Kemenkumham / Surat Dinas',
        'surat_keterangan_desa_path' => 'Surat Keterangan Desa',
        'latitude' => 'Koordinat Lokasi',
        'deskripsi_titik' => 'Deskripsi Titik Lokasi',
    ];

    private static array $legacyCategoryFields = [
        'peternakan_ebt' => [
            'jenis_teknologi' => 'Jenis Teknologi',
            'kapasitas_kandang_m2' => 'Kapasitas Kandang (m²)',
            'jenis_ternak' => 'Jenis Ternak',
            'jenis_usaha' => 'Jenis Usaha',
            'jumlah_ternak' => 'Jumlah Ternak',
            'ketersediaan_lahan' => 'Ketersediaan Lahan',
            'komitmen_pengelolaan' => 'Komitmen Pengelolaan',
        ],
        'plts_rooftop' => [
            'kesediaan_ganti_kwh_pascabayar' => 'Kesediaan Ganti KWH Pascabayar',
            'kapasitas_kwh_eksisting' => 'Kapasitas KWH Eksisting',
            'kondisi_lokasi' => 'Kondisi Lokasi',
            'perkiraan_kapasitas_plts' => 'Perkiraan Kapasitas PLTS (Wp)',
            'tagihan_listrik' => 'Tagihan Listrik 6 Bulan',
        ],
        'plts_perikanan' => [
            'kesediaan_ganti_kwh_pascabayar' => 'Kesediaan Ganti KWH Pascabayar',
            'kapasitas_kwh_eksisting' => 'Kapasitas KWH Eksisting',
            'kondisi_lokasi' => 'Kondisi Lokasi',
            'tagihan_listrik' => 'Tagihan Listrik 6 Bulan',
        ],
        'pats' => [
            'ketersediaan_pompa' => 'Ketersediaan Pompa',
            'jenis_pompa' => 'Jenis Pompa',
            'kapasitas_pompa_watt' => 'Kapasitas Pompa (Watt)',
            'sumber_air' => 'Sumber Air',
            'izin_pemanfaatan_air' => 'Izin Pemanfaatan Air',
            'ketersediaan_lahan_kontrol' => 'Ketersediaan Lahan Kontrol',
            'status_kepemilikan_lahan' => 'Status Kepemilikan Lahan',
        ],
    ];

    /**
     * @return array<string, string>
     */
    public static function fieldsFor(
        SubmissionCategory|string $category,
        EntryType|string|null $entryType = null
    ): array {
        $cat = $category instanceof SubmissionCategory ? $category->value : $category;
        $type = $entryType instanceof EntryType
            ? $entryType
            : ($entryType ? EntryType::tryFrom($entryType) : null);

        if ($type === EntryType::Potensi) {
            return self::$potensiFields;
        }

        if ($type === EntryType::Terbangun) {
            return self::$terbangunFields;
        }

        // Legacy submissions (entry_type null) keep the old field set.
        return array_merge(self::$legacyBaseFields, self::$legacyCategoryFields[$cat] ?? []);
    }

    /**
     * @return array<string, array{status: string, reason: null}>
     */
    public static function initializeReviews(
        SubmissionCategory|string $category,
        EntryType|string|null $entryType = null
    ): array {
        $fields = self::fieldsFor($category, $entryType);
        $reviews = [];

        foreach (array_keys($fields) as $key) {
            $reviews[$key] = [
                'status' => FieldReviewStatus::Pending->value,
                'reason' => null,
            ];
        }

        return $reviews;
    }

    public static function isValidFieldKey(
        SubmissionCategory|string $category,
        string $fieldKey,
        EntryType|string|null $entryType = null
    ): bool {
        return array_key_exists($fieldKey, self::fieldsFor($category, $entryType));
    }
}
