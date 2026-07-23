<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'submission_id', 'jenis_teknologi', 'kapasitas_kandang_m2',
    'jenis_ternak', 'jenis_usaha', 'jumlah_ternak',
    'ketersediaan_lahan', 'komitmen_pengelolaan',
])]
class SubmissionPeternakan extends Model
{
    protected $table = 'submission_peternakan';

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }
}
