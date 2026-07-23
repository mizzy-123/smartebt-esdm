<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePeternakanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis_teknologi'      => ['required', 'in:digester_biogas,plts,bsg,pats'],
            'kapasitas_kandang_m2' => ['required', 'numeric', 'min:0'],
            'jenis_ternak'         => ['required', 'string', 'max:255'],
            'jenis_usaha'          => ['required', 'string', 'max:255'],
            'jumlah_ternak'        => ['required', 'integer', 'min:1'],
            'ketersediaan_lahan'   => ['required', 'string'],
            'komitmen_pengelolaan' => ['required', 'string'],
        ];
    }
}
