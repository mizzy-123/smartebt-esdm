<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'submission_id', 'ketersediaan_pompa', 'jenis_pompa',
    'kapasitas_pompa_watt', 'sumber_air', 'sumber_air_lainnya',
    'izin_pemanfaatan_air', 'ketersediaan_lahan_kontrol',
    'status_kepemilikan_lahan',
])]
class SubmissionPats extends Model
{
    protected $table = 'submission_pats';

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }
}
