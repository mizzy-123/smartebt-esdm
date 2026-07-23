<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'submission_id', 'field_key', 'file_path', 'original_name', 'periode',
])]
class SubmissionFile extends Model
{
    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }
}
