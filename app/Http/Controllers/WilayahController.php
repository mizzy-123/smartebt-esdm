<?php

namespace App\Http\Controllers;

use App\Models\Kabupaten;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\Provinsi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WilayahController extends Controller
{
    /** Approximate Jawa Tengah viewbox: left, top, right, bottom */
    private const JAWA_TENGAH_VIEWBOX = '108.5,-6.0,111.8,-8.2';

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

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:3', 'max:200'],
        ]);

        $response = Http::timeout(8)
            ->withHeaders([
                'User-Agent' => 'SMART-EBT-ESDM/1.0 (https://github.com/smart-ebt-esdm)',
                'Accept' => 'application/json',
            ])
            ->get('https://nominatim.openstreetmap.org/search', [
                'q' => $validated['q'],
                'format' => 'json',
                'limit' => 6,
                'countrycodes' => 'id',
                'accept-language' => 'id',
                'viewbox' => self::JAWA_TENGAH_VIEWBOX,
                'addressdetails' => 0,
            ]);

        if (! $response->successful()) {
            return response()->json([
                'message' => 'Pencarian lokasi sedang tidak tersedia. Silakan coba lagi.',
                'data' => [],
            ], 502);
        }

        $items = collect($response->json() ?? [])
            ->filter(fn ($item) => isset($item['lat'], $item['lon'], $item['display_name']))
            ->map(fn ($item) => [
                'label' => (string) $item['display_name'],
                'latitude' => (float) $item['lat'],
                'longitude' => (float) $item['lon'],
            ])
            ->values()
            ->all();

        return response()->json(['data' => $items]);
    }
}
