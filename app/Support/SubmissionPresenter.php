<?php

namespace App\Support;

use App\Enums\EntryType;
use App\Models\Submission;
use Illuminate\Support\Facades\Storage;

class SubmissionPresenter
{
    /**
     * @return array<string, mixed>
     */
    public static function toArray(Submission $submission, bool $includeUser = false): array
    {
        $detail = $submission->legacyDetail();
        $entryType = $submission->entry_type ?? EntryType::Pengajuan;

        $data = [
            'id' => $submission->id,
            'entry_type' => $entryType->value,
            'entryTypeLabel' => $entryType->label(),
            'category' => $submission->category?->value,
            'categoryLabel' => $submission->category?->label()
                ?? ($entryType === EntryType::Potensi ? 'Potensi Lokal EBT' : '-'),
            'kapasitasUnit' => $submission->category?->kapasitasUnit(),
            'status' => $submission->status->value,
            'statusLabel' => $submission->status->label(),
            'lokasi' => $submission->lokasi,
            'desa' => $submission->desa,
            'kecamatan' => $submission->kecamatan,
            'kabupaten' => $submission->kabupaten,
            'nama_pengelola' => $submission->nama_pengelola,
            'kontak_person' => $submission->kontak_person,
            'no_wa' => $submission->no_wa,
            'foto_kondisi_path' => self::fileUrl($submission->foto_kondisi_path),
            'nama_pemilik' => $submission->nama_pemilik,
            'penanggung_jawab' => $submission->penanggung_jawab,
            'kapasitas' => $submission->kapasitas !== null ? (float) $submission->kapasitas : null,
            'sumber_pendanaan' => $submission->sumber_pendanaan,
            'sumber_pendanaan_detail' => $submission->sumber_pendanaan_detail,
            'tahun_pembangunan' => $submission->tahun_pembangunan,
            'bauran_energi' => $submission->bauran_energi !== null ? (float) $submission->bauran_energi : null,
            'display_name' => $submission->displayName(),
            'nama_pemohon' => $submission->nama_pemohon,
            'nomor_identitas' => $submission->nomor_identitas,
            'alamat_organisasi' => $submission->alamat_organisasi,
            'nama_ketua' => $submission->nama_ketua,
            'surat_permohonan_proposal_path' => self::fileUrl($submission->surat_permohonan_proposal_path),
            'dokumen_kepengurusan_path' => self::fileUrl($submission->dokumen_kepengurusan_path),
            'dokumen_sk_kemenkumham_path' => self::fileUrl($submission->dokumen_sk_kemenkumham_path),
            'surat_keterangan_desa_path' => self::fileUrl($submission->surat_keterangan_desa_path),
            'kesediaan_ganti_kwh_pascabayar' => $submission->kesediaan_ganti_kwh_pascabayar,
            'latitude' => $submission->latitude !== null ? (float) $submission->latitude : null,
            'longitude' => $submission->longitude !== null ? (float) $submission->longitude : null,
            'deskripsi_titik' => $submission->deskripsi_titik,
            'field_reviews' => $submission->field_reviews,
            'hasRejected' => $submission->hasRejectedFields(),
            'rejectedFields' => $submission->rejectedFieldKeys(),
            'created_at' => $submission->created_at?->format('d M Y H:i'),
            'detail' => $detail?->toArray(),
            'files' => $submission->files
                ->groupBy('field_key')
                ->map(fn ($group) => $group->map(fn ($file) => [
                    'id' => $file->id,
                    'url' => Storage::url($file->file_path),
                    'original_name' => $file->original_name,
                    'periode' => $file->periode,
                ])->values())
                ->toArray(),
        ];

        if ($includeUser) {
            $data['user'] = [
                'name' => $submission->user?->name,
                'email' => $submission->user?->email,
            ];
        }

        return $data;
    }

    private static function fileUrl(?string $path): ?string
    {
        return $path ? Storage::url($path) : null;
    }
}
