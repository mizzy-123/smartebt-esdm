<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title', 'description', 'file_path', 'original_name',
    'mime_type', 'sort_order', 'is_active',
])]
class Download extends Model
{
    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
