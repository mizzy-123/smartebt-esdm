<?php

namespace App\Models;

use App\Enums\SubmissionCategory;
use App\Enums\SubmissionStatus;
use App\Enums\FieldReviewStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property SubmissionCategory $category
 * @property SubmissionStatus $status
 * @property string $nama_pemohon
 * @property string $nomor_identitas
 * @property string $alamat_organisasi
 * @property string $nama_ketua
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
    'user_id', 'category', 'status',
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
            'category'                       => SubmissionCategory::class,
            'status'                         => SubmissionStatus::class,
            'kesediaan_ganti_kwh_pascabayar' => 'boolean',
            'latitude'                        => 'decimal:7',
            'longitude'                       => 'decimal:7',
            'field_reviews'                   => 'array',
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

    /** Get the detail relation for this submission's category. */
    public function detail(): HasOne
    {
        return match($this->category) {
            SubmissionCategory::PeternakanEbt  => $this->peternakan(),
            SubmissionCategory::PltsRooftop    => $this->pltsRooftop(),
            SubmissionCategory::PltsPerikanan  => $this->pltsPerikanan(),
            SubmissionCategory::Pats           => $this->pats(),
        };
    }

    /** Check if any field in field_reviews has status 'rejected'. */
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

    /** Get all rejected field keys. */
    public function rejectedFieldKeys(): array
    {
        $reviews = $this->field_reviews ?? [];
        return array_keys(array_filter($reviews, fn($r) => ($r['status'] ?? '') === FieldReviewStatus::Rejected->value));
    }

    /** Check if all fields are approved. */
    public function allFieldsApproved(): bool
    {
        $reviews = $this->field_reviews ?? [];
        if (empty($reviews)) {
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
