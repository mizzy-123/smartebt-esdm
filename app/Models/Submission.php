<?php

namespace App\Models;

use App\Enums\EntryType;
use App\Enums\FieldReviewStatus;
use App\Enums\SubmissionCategory;
use App\Enums\SubmissionStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property EntryType $entry_type
 * @property SubmissionCategory|null $category
 * @property SubmissionStatus $status
 * @property string|null $lokasi
 * @property string|null $desa
 * @property string|null $kecamatan
 * @property string|null $kabupaten
 * @property string|null $nama_pengelola
 * @property string|null $kontak_person
 * @property string|null $no_wa
 * @property string|null $foto_kondisi_path
 * @property string|null $nama_pemilik
 * @property string|null $penanggung_jawab
 * @property float|null $kapasitas
 * @property string|null $sumber_pendanaan
 * @property string|null $sumber_pendanaan_detail
 * @property int|null $tahun_pembangunan
 * @property float|null $bauran_energi
 * @property string|null $nama_pemohon
 * @property string|null $nomor_identitas
 * @property string|null $alamat_organisasi
 * @property string|null $nama_ketua
 * @property string|null $surat_permohonan_proposal_path
 * @property string|null $dokumen_kepengurusan_path
 * @property string|null $dokumen_sk_kemenkumham_path
 * @property string|null $surat_keterangan_desa_path
 * @property bool|null $kesediaan_ganti_kwh_pascabayar
 * @property float|null $latitude
 * @property float|null $longitude
 * @property string|null $deskripsi_titik
 * @property array|null $field_reviews
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id', 'entry_type', 'category', 'status',
    'lokasi', 'desa', 'kecamatan', 'kabupaten',
    'nama_pengelola', 'kontak_person', 'no_wa', 'foto_kondisi_path',
    'nama_pemilik', 'penanggung_jawab', 'kapasitas',
    'sumber_pendanaan', 'sumber_pendanaan_detail', 'tahun_pembangunan', 'bauran_energi',
    'nama_pemohon', 'nomor_identitas', 'alamat_organisasi', 'nama_ketua',
    'surat_permohonan_proposal_path', 'dokumen_kepengurusan_path',
    'dokumen_sk_kemenkumham_path', 'surat_keterangan_desa_path',
    'kesediaan_ganti_kwh_pascabayar', 'latitude', 'longitude',
    'deskripsi_titik', 'field_reviews',
])]
class Submission extends Model
{
    protected function casts(): array
    {
        return [
            'entry_type' => EntryType::class,
            'category' => SubmissionCategory::class,
            'status' => SubmissionStatus::class,
            'kesediaan_ganti_kwh_pascabayar' => 'boolean',
            'kapasitas' => 'decimal:2',
            'bauran_energi' => 'decimal:6',
            'tahun_pembangunan' => 'integer',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'field_reviews' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(SubmissionFile::class);
    }

    public function peternakan(): HasOne
    {
        return $this->hasOne(SubmissionPeternakan::class);
    }

    public function pltsRooftop(): HasOne
    {
        return $this->hasOne(SubmissionPltsRooftop::class);
    }

    public function pltsPerikanan(): HasOne
    {
        return $this->hasOne(SubmissionPltsPerikanan::class);
    }

    public function pats(): HasOne
    {
        return $this->hasOne(SubmissionPats::class);
    }

    /** Get the detail relation for legacy category submissions. */
    public function legacyDetail(): mixed
    {
        return match ($this->category) {
            SubmissionCategory::PeternakanEbt => $this->peternakan,
            SubmissionCategory::PltsRooftop => $this->pltsRooftop,
            SubmissionCategory::PltsPerikanan => $this->pltsPerikanan,
            SubmissionCategory::Pats => $this->pats,
            default => null,
        };
    }

    public function displayName(): string
    {
        return $this->nama_pengelola
            ?? $this->nama_pemilik
            ?? $this->nama_pemohon
            ?? $this->lokasi
            ?? ('Data #'.$this->id);
    }

    public function hasRejectedFields(): bool
    {
        $reviews = $this->field_reviews ?? [];
        foreach ($reviews as $review) {
            if (($review['status'] ?? '') === FieldReviewStatus::Rejected->value) {
                return true;
            }
        }

        return false;
    }

    public function rejectedFieldKeys(): array
    {
        $reviews = $this->field_reviews ?? [];

        return array_keys(array_filter($reviews, fn ($r) => ($r['status'] ?? '') === FieldReviewStatus::Rejected->value));
    }

    public function allFieldsApproved(): bool
    {
        $reviews = $this->field_reviews ?? [];
        if ($reviews === []) {
            return false;
        }
        foreach ($reviews as $review) {
            if (($review['status'] ?? '') !== FieldReviewStatus::Approved->value) {
                return false;
            }
        }

        return true;
    }
}
