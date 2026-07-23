<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ketersediaan_pompa'         => ['required', 'in:sudah_ada,belum'],
            'jenis_pompa'                => ['required', 'in:permukaan,submersible'],
            'kapasitas_pompa_watt'       => ['required', 'numeric', 'min:0'],
            'sumber_air'                 => ['required', 'in:air_tanah,sungai,mata_air,lainnya'],
            'sumber_air_lainnya'         => ['required_if:sumber_air,lainnya', 'nullable', 'string', 'max:255'],
            'izin_pemanfaatan_air'       => ['required', 'in:ada,belum_ada'],
            'ketersediaan_lahan_kontrol' => ['required', 'in:ada,tidak'],
            'status_kepemilikan_lahan'   => ['required', 'string', 'max:255'],
        ];
    }
}
