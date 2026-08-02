<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kelurahan extends Model
{
    protected $table = 'kelurahan';

    protected $primaryKey = 'kelurahan_id';

    public $timestamps = false;

    protected $fillable = [
        'kecamatan_id',
        'nama',
        'wilayah_id',
    ];

    public function kecamatan(): BelongsTo
    {
        return $this->belongsTo(Kecamatan::class, 'kecamatan_id', 'kecamatan_id');
    }
}
