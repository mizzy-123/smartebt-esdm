<?php

namespace App\Http\Requests;

use App\Enums\EntryType;
use App\Enums\SubmissionCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreEbtEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('category') === '') {
            $this->merge(['category' => null]);
        }
    }

    public function rules(): array
    {
        $entryType = $this->input('entry_type', EntryType::Potensi->value);

        $rules = [
            'entry_type' => ['required', Rule::enum(EntryType::class)],
            'category' => [
                Rule::requiredIf($entryType === EntryType::Terbangun->value),
                'nullable',
                Rule::in(array_map(fn (SubmissionCategory $c) => $c->value, SubmissionCategory::terbangunCases())),
            ],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'desa' => ['nullable', 'string', 'max:255'],
            'kecamatan' => ['nullable', 'string', 'max:255'],
            'kabupaten' => ['nullable', 'string', 'max:255'],
            'nama_pengelola' => ['nullable', 'string', 'max:255'],
            'kontak_person' => ['nullable', 'string', 'max:255'],
            'no_wa' => ['nullable', 'string', 'max:30'],
            'foto_kondisi' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'deskripsi_titik' => ['nullable', 'string'],
            // Terbangun-only
            'nama_pemilik' => ['nullable', 'string', 'max:255'],
            'penanggung_jawab' => ['nullable', 'string', 'max:255'],
            'kapasitas' => ['nullable', 'numeric', 'min:0'],
            'sumber_pendanaan' => ['nullable', Rule::in(['pemerintah', 'mandiri', 'kerjasama'])],
            'sumber_pendanaan_detail' => ['nullable', 'string', 'max:255'],
            'tahun_pembangunan' => ['nullable', 'integer', 'min:1990', 'max:'.(date('Y') + 1)],
        ];

        return $rules;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $lokasi = $this->input('lokasi');
            $lat = $this->input('latitude');
            $lng = $this->input('longitude');

            $hasLokasi = filled($lokasi);
            $hasCoords = filled($lat) && filled($lng);

            if (! $hasLokasi && ! $hasCoords) {
                $validator->errors()->add(
                    'lokasi',
                    'Isi lokasi atau koordinat (latitude & longitude) agar data bisa disimpan.'
                );
            }
        });
    }

    public function attributes(): array
    {
        return [
            'entry_type' => 'Jenis Data',
            'category' => 'Jenis Infrastruktur',
            'lokasi' => 'Lokasi',
            'nama_pengelola' => 'Nama Pengelola',
            'kontak_person' => 'Kontak Person',
            'no_wa' => 'Nomor WhatsApp',
            'foto_kondisi' => 'Foto Kondisi Saat Ini',
            'nama_pemilik' => 'Nama Pemilik / Pemrakarsa',
            'penanggung_jawab' => 'Penanggung Jawab',
            'kapasitas' => 'Kapasitas',
            'sumber_pendanaan' => 'Sumber Pendanaan',
            'tahun_pembangunan' => 'Tahun Pembangunan',
            'latitude' => 'Latitude',
            'longitude' => 'Longitude',
        ];
    }
}
