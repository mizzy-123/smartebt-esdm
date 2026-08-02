<?php

namespace App\Http\Controllers;

use App\Models\Kabupaten;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\Provinsi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WilayahController extends Controller
{
    public function kabupaten(): JsonResponse
    {
        $items = Kabupaten::query()
            ->where('provinsi_id', Provinsi::JAWA_TENGAH)
            ->orderBy('nama')
            ->get(['kabupaten_id', 'nama'])
            ->map(fn (Kabupaten $kabupaten) => [
                'id' => $kabupaten->kabupaten_id,
                'nama' => $kabupaten->nama,
            ]);

        return response()->json(['data' => $items]);
    }

    public function kecamatan(Request $request): JsonResponse
    {
        $request->validate([
            'kabupaten_id' => ['required', 'integer', 'exists:kabupaten,kabupaten_id'],
        ]);

        $items = Kecamatan::query()
            ->where('kabupaten_id', $request->integer('kabupaten_id'))
            ->orderBy('nama')
            ->get(['kecamatan_id', 'nama'])
            ->map(fn (Kecamatan $kecamatan) => [
                'id' => $kecamatan->kecamatan_id,
                'nama' => $kecamatan->nama,
            ]);

        return response()->json(['data' => $items]);
    }

    public function kelurahan(Request $request): JsonResponse
    {
        $request->validate([
            'kecamatan_id' => ['required', 'integer', 'exists:kecamatan,kecamatan_id'],
        ]);

        $items = Kelurahan::query()
            ->where('kecamatan_id', $request->integer('kecamatan_id'))
            ->orderBy('nama')
            ->get(['kelurahan_id', 'nama'])
            ->map(fn (Kelurahan $kelurahan) => [
                'id' => $kelurahan->kelurahan_id,
                'nama' => $kelurahan->nama,
            ]);

        return response()->json(['data' => $items]);
    }
}
