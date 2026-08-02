<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wilayah extends Model
{
    protected $table = 'wilayah';

    protected $primaryKey = 'wilayah_id';

    public $timestamps = false;

    protected $fillable = [
        'nama',
    ];
}
