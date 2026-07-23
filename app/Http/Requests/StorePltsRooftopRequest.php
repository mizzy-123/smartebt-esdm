<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePltsRooftopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kapasitas_kwh_eksisting'  => ['nullable', 'numeric', 'min:0'],
            'kondisi_lokasi'           => ['required', 'string'],
            'panjang_instalasi'        => ['nullable', 'numeric', 'min:0'],
            'jenis_bangunan'           => ['required', 'in:permanen,sementara'],
            'jenis_gedung'             => ['required', 'string', 'max:255'],
            'umur_bangunan'            => ['required', 'string', 'max:50'],
            'luas_bangunan'            => ['required', 'numeric', 'min:0'],
            'tinggi_bangunan'          => ['required', 'numeric', 'min:0'],
            'jenis_atap'               => ['required', 'in:baja_ringan,kayu,kanal_c,kanal_i,beton,lainnya'],
            'jenis_atap_lainnya'       => ['required_if:jenis_atap,lainnya', 'nullable', 'string', 'max:255'],
            'tahun_pemasangan_atap'    => ['required', 'integer', 'min:1900', 'max:' . date('Y')],
            'luas_atap'                => ['required', 'numeric', 'min:0'],
            'potensi_bayangan'         => ['required', 'string'],
            'nomor_pelanggan'          => ['required', 'string', 'max:50'],
            'jenis_layanan_listrik'    => ['required', 'in:pascabayar,prabayar'],
            'data_pelanggan'           => ['required', 'string'],
            'daya_terpasang_pln'       => ['required', 'numeric', 'min:0'],
            'perkiraan_kapasitas_plts' => ['required', 'numeric', 'min:0'],
            'jumlah_pengguna'          => ['required', 'integer', 'min:1'],
            'kesediaan_ganti_meteran'  => ['required', 'boolean'],
            'tagihan_listrik'          => ['required', 'array', 'min:1'],
            'tagihan_listrik.*'        => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }
}
