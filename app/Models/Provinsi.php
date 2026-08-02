<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provinsi extends Model
{
    public const JAWA_TENGAH = 33;

    protected $table = 'provinsi';

    protected $primaryKey = 'provinsi_id';

    public $timestamps = false;

    protected $fillable = [
        'nama',
    ];

    public function kabupaten(): HasMany
    {
        return $this->hasMany(Kabupaten::class, 'provinsi_id', 'provinsi_id');
    }
}
