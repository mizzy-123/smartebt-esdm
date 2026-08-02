<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kecamatan extends Model
{
    protected $table = 'kecamatan';

    protected $primaryKey = 'kecamatan_id';

    public $timestamps = false;

    protected $fillable = [
        'kabupaten_id',
        'nama',
    ];

    public function kabupaten(): BelongsTo
    {
        return $this->belongsTo(Kabupaten::class, 'kabupaten_id', 'kabupaten_id');
    }

    public function kelurahan(): HasMany
    {
        return $this->hasMany(Kelurahan::class, 'kecamatan_id', 'kecamatan_id');
    }
}
