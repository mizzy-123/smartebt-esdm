<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubmissionBaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $category = $this->input('category');

        $rules = [
            'category'         => ['required', 'in:peternakan_ebt,plts_rooftop,plts_perikanan,pats'],
            'nama_pemohon'     => ['required', 'string', 'max:255'],
            'nomor_identitas'  => ['required', 'string', 'max:100'],
            'alamat_organisasi' => ['required', 'string'],
            'nama_ketua'       => ['required', 'string', 'max:255'],
            'surat_permohonan_proposal_path' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'dokumen_kepengurusan_path'      => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'dokumen_sk_kemenkumham_path'    => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'surat_keterangan_desa_path'     => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'latitude'         => ['required', 'numeric', 'between:-90,90'],
            'longitude'        => ['required', 'numeric', 'between:-180,180'],
            'deskripsi_titik'  => ['required', 'string'],
        ];

        // Only required for plts_rooftop and plts_perikanan
        if (in_array($category, ['plts_rooftop', 'plts_perikanan'])) {
            $rules['kesediaan_ganti_kwh_pascabayar'] = ['required', 'boolean'];
        }

        return $rules;
    }

    public function attributes(): array
    {
        return [
            'nama_pemohon'                   => 'Nama Pemohon',
            'nomor_identitas'                => 'Nomor Identitas',
            'alamat_organisasi'              => 'Alamat Organisasi',
            'nama_ketua'                     => 'Nama Ketua',
            'surat_permohonan_proposal_path' => 'Surat Permohonan & Proposal',
            'dokumen_kepengurusan_path'      => 'Dokumen Kepengurusan',
            'dokumen_sk_kemenkumham_path'    => 'SK Kemenkumham / Surat Dinas',
            'surat_keterangan_desa_path'     => 'Surat Keterangan Desa',
            'kesediaan_ganti_kwh_pascabayar' => 'Kesediaan Ganti KWH Pascabayar',
            'latitude'                        => 'Latitude',
            'longitude'                       => 'Longitude',
            'deskripsi_titik'                => 'Deskripsi Titik Lokasi',
        ];
    }
}
