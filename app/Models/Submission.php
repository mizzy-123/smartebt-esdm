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
 * @property EntryType|null $entry_type
 * @property SubmissionCategory|null $category
 * @property SubmissionStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id', 'entry_type', 'berbadan_hukum', 'category', 'status',
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
            'berbadan_hukum' => 'boolean',
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

    public function legacyDetail(): mixed
    {
        return match ($this->category) {
            SubmissionCategory::PeternakanEbt => $this->peternakan,
            SubmissionCategory::PltsRooftop => $this->pltsRooftop,
            SubmissionCategory::PltsPerikanan => $this->pltsPerikanan,
            SubmissionCategory::Pats => $this->entry_type === EntryType::Terbangun ? null : $this->pats,
            default => null,
        };
    }

    /** @deprecated Use legacyDetail() — kept for older call sites. */
    public function getDetailAttribute(): mixed
    {
        return $this->legacyDetail();
    }

    public function displayName(): string
    {
        return $this->nama_pengelola
            ?? $this->nama_pemilik
            ?? $this->nama_pemohon
            ?? $this->lokasi
            ?? ('Data #'.$this->id);
    }

    public function isBerbadanHukum(): bool
    {
        return (bool) $this->berbadan_hukum
            || $this->entry_type === EntryType::Pengajuan;
    }

    public function isEbtSimpleEntry(): bool
    {
        if ($this->entry_type === EntryType::Terbangun) {
            return true;
        }

        return $this->entry_type === EntryType::Potensi && ! $this->isBerbadanHukum();
    }

    public function entryTypeLabel(): string
    {
        if ($this->isBerbadanHukum()) {
            return 'Potensi Berbadan Hukum';
        }

        return $this->entry_type?->label() ?? 'Pengajuan';
    }

    public function hasRejectedFields(): bool
    {
        foreach ($this->field_reviews ?? [] as $review) {
            if (($review['status'] ?? '') === FieldReviewStatus::Rejected->value) {
                return true;
            }
        }

        return false;
    }

    public function rejectedFieldKeys(): array
    {
        return array_keys(array_filter(
            $this->field_reviews ?? [],
            fn ($r) => ($r['status'] ?? '') === FieldReviewStatus::Rejected->value
        ));
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
