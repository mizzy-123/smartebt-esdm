<?php

use App\Models\Provinsi;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

test('authenticated user can fetch cascading wilayah options for jawa tengah', function () {
    $wilayah = Wilayah::query()->create(['nama' => 'Test Wilayah']);

    DB::table('provinsi')->insert([
        'provinsi_id' => Provinsi::JAWA_TENGAH,
        'nama' => 'JAWA TENGAH',
    ]);

    DB::table('kabupaten')->insert([
        'kabupaten_id' => 3301,
        'provinsi_id' => Provinsi::JAWA_TENGAH,
        'nama' => 'KAB. CILACAP',
        'wilayah_id' => $wilayah->wilayah_id,
    ]);

    DB::table('kecamatan')->insert([
        'kecamatan_id' => 330101,
        'kabupaten_id' => 3301,
        'nama' => 'Kedungreja',
    ]);

    DB::table('kelurahan')->insert([
        'kelurahan_id' => 3301012001,
        'kecamatan_id' => 330101,
        'nama' => 'Tambakreja',
        'wilayah_id' => $wilayah->wilayah_id,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('wilayah.kabupaten'))
        ->assertOk()
        ->assertJsonFragment(['id' => 3301, 'nama' => 'KAB. CILACAP']);

    $this->actingAs($user)
        ->getJson(route('wilayah.kecamatan', ['kabupaten_id' => 3301]))
        ->assertOk()
        ->assertJsonFragment(['id' => 330101, 'nama' => 'Kedungreja']);

    $this->actingAs($user)
        ->getJson(route('wilayah.kelurahan', ['kecamatan_id' => 330101]))
        ->assertOk()
        ->assertJsonFragment(['id' => 3301012001, 'nama' => 'Tambakreja']);
});

test('wilayah endpoints require authentication', function () {
    $this->getJson(route('wilayah.kabupaten'))->assertUnauthorized();
});

test('authenticated user can search locations via geocode proxy', function () {
    Http::fake([
        'nominatim.openstreetmap.org/*' => Http::response([
            [
                'display_name' => 'Simpang Lima, Semarang, Jawa Tengah',
                'lat' => '-6.9932',
                'lon' => '110.4203',
            ],
        ], 200),
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('wilayah.search', ['q' => 'Simpang Lima Semarang']))
        ->assertOk()
        ->assertJsonFragment([
            'label' => 'Simpang Lima, Semarang, Jawa Tengah',
            'latitude' => -6.9932,
            'longitude' => 110.4203,
        ]);
});
