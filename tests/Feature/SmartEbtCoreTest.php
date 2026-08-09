<?php

use App\Enums\EntryType;
use App\Enums\SubmissionStatus;
use App\Models\Submission;
use App\Models\User;
use App\Support\BauranEnergiCalculator;
use App\Support\SubmissionFieldRegistry;
use Inertia\Testing\AssertableInertia as Assert;

test('landing page is public', function () {
    $this->get(route('landing'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('landing'));
});

test('map data endpoint returns json', function () {
    $this->getJson(route('map-data'))
        ->assertOk()
        ->assertExactJson([]);
});

test('admin is redirected to admin dashboard after login', function () {
    $admin = User::factory()->admin()->create([
        'email' => 'admin-login-'.uniqid().'@smart-ebt.go.id',
        'password' => 'password',
    ]);

    $this->post(route('login.store'), [
        'login' => $admin->email,
        'password' => 'password',
    ])->assertRedirect('/admin/dashboard');
});

test('user is redirected to user dashboard after login', function () {
    $user = User::factory()->create([
        'email' => 'user-login-'.uniqid().'@example.com',
        'password' => 'password',
    ]);

    $this->post(route('login.store'), [
        'login' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');
});

test('non admin cannot access admin dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admin can access admin dashboard', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/dashboard'));
});

test('admin bauran energi page aggregates terbangun totals per category', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    Submission::create([
        'user_id' => $user->id,
        'entry_type' => EntryType::Terbangun,
        'category' => 'plts',
        'status' => SubmissionStatus::SudahIntervensi,
        'lokasi' => 'PLTS A',
        'kapasitas' => 10,
        'bauran_energi' => 1.5,
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('plts', 'terbangun'),
    ]);

    Submission::create([
        'user_id' => $user->id,
        'entry_type' => EntryType::Terbangun,
        'category' => 'plts',
        'status' => SubmissionStatus::BelumIntervensi,
        'lokasi' => 'PLTS B',
        'kapasitas' => 5,
        'bauran_energi' => 0.5,
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('plts', 'terbangun'),
    ]);

    Submission::create([
        'user_id' => $user->id,
        'entry_type' => EntryType::Terbangun,
        'category' => 'biogas',
        'status' => SubmissionStatus::SudahIntervensi,
        'lokasi' => 'Biogas A',
        'kapasitas' => 20,
        'bauran_energi' => 2.25,
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('biogas', 'terbangun'),
    ]);

    // Potensi should not be included in bauran totals.
    Submission::create([
        'user_id' => $user->id,
        'entry_type' => EntryType::Potensi,
        'category' => 'plts',
        'status' => SubmissionStatus::SudahIntervensi,
        'lokasi' => 'Potensi PLTS',
        'bauran_energi' => 99,
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('plts', 'potensi'),
    ]);

    $this->actingAs($user)
        ->get(route('admin.bauran-energi.index'))
        ->assertForbidden();

    $this->actingAs($admin)
        ->get(route('admin.bauran-energi.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/bauran-energi')
            ->where('totalUnit', 3)
            ->where('totalBauran', 4.25)
            ->has('perItem', 3)
            ->where('perItem.0.category', 'biogas')
            ->where('perItem.0.total_bauran', 2.25)
            ->where('perItem.0.jumlah', 1)
            ->where('perItem.1.category', 'plts')
            ->where('perItem.1.total_bauran', 2)
            ->where('perItem.1.jumlah', 2)
            ->where('perItem.2.category', 'pats')
            ->where('perItem.2.total_bauran', 0)
            ->where('perItem.2.jumlah', 0));
});

test('create form keeps pengajuan and adds potensi terbangun types', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('submissions.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('user/submissions/create'));

    $this->actingAs($user)
        ->get(route('submissions.potensi.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/submissions/create-ebt')
            ->where('entryType', 'potensi')
            ->has('categories', 5)
            ->where('categories.0.value', 'biogas')
            ->where('categories.1.value', 'plts')
            ->where('categories.2.value', 'pats')
            ->where('categories.3.value', 'pltmh')
            ->where('categories.4.value', 'pltb'));

    $this->actingAs($user)
        ->get(route('submissions.terbangun.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/submissions/create-ebt')
            ->where('entryType', 'terbangun'));
});

test('user can store potensi with minimal fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('submissions.store'), [
            'entry_type' => 'potensi',
            'category' => 'pltmh',
            'lokasi' => 'Desa Contoh',
            'latitude' => -7.25,
            'longitude' => 110.43,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('submissions', [
        'user_id' => $user->id,
        'entry_type' => 'potensi',
        'category' => 'pltmh',
        'lokasi' => 'Desa Contoh',
    ]);
});

test('user can edit own potensi submission', function () {
    $user = User::factory()->create();

    $submission = Submission::create([
        'user_id' => $user->id,
        'entry_type' => 'potensi',
        'category' => 'biogas',
        'status' => SubmissionStatus::BelumIntervensi,
        'lokasi' => 'Lokasi lama',
        'latitude' => -7.1,
        'longitude' => 110.1,
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('biogas', 'potensi'),
    ]);

    $this->actingAs($user)
        ->get(route('submissions.edit', $submission))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/submissions/edit-ebt'));

    $this->actingAs($user)
        ->put(route('submissions.update', $submission), [
            'entry_type' => 'potensi',
            'category' => 'plts',
            'lokasi' => 'Lokasi baru',
            'latitude' => -7.25,
            'longitude' => 110.43,
        ])
        ->assertRedirect(route('submissions.show', $submission));

    $submission->refresh();

    expect($submission->lokasi)->toBe('Lokasi baru')
        ->and($submission->category->value)->toBe('plts')
        ->and((float) $submission->latitude)->toBe(-7.25);
});

test('editing verified ebt entry resets status to pending', function () {
    $user = User::factory()->create();

    $submission = Submission::create([
        'user_id' => $user->id,
        'entry_type' => 'terbangun',
        'category' => 'plts',
        'status' => SubmissionStatus::SudahIntervensi,
        'lokasi' => 'Lokasi verified',
        'kapasitas' => 5,
        'latitude' => -7.1,
        'longitude' => 110.1,
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('plts', 'terbangun'),
    ]);

    $this->actingAs($user)
        ->put(route('submissions.update', $submission), [
            'entry_type' => 'terbangun',
            'category' => 'plts',
            'lokasi' => 'Lokasi diperbaiki',
            'kapasitas' => 8,
            'latitude' => -7.2,
            'longitude' => 110.2,
        ])
        ->assertRedirect();

    $submission->refresh();

    expect($submission->status)->toBe(SubmissionStatus::BelumIntervensi)
        ->and($submission->lokasi)->toBe('Lokasi diperbaiki');
});

test('ebt entry requires latitude and longitude', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('submissions.store'), [
            'entry_type' => 'potensi',
            'category' => 'biogas',
            'lokasi' => 'Tanpa koordinat',
        ])
        ->assertSessionHasErrors(['latitude', 'longitude']);
});

test('admin can store terbangun plts with auto bauran energi', function () {
    $admin = User::factory()->admin()->create();
    $kapasitas = 10;
    $expected = BauranEnergiCalculator::calculate('plts', $kapasitas);

    $this->actingAs($admin)
        ->post(route('submissions.store'), [
            'entry_type' => 'terbangun',
            'category' => 'plts',
            'nama_pemilik' => 'Pemilik PLTS',
            'lokasi' => 'Kabupaten Contoh',
            'kapasitas' => $kapasitas,
            'latitude' => -7.0,
            'longitude' => 110.4,
        ])
        ->assertRedirect();

    $submission = Submission::query()->where('user_id', $admin->id)->latest('id')->first();

    expect($submission)->not->toBeNull()
        ->and($submission->entry_type)->toBe(EntryType::Terbangun)
        ->and($submission->category->value)->toBe('plts')
        ->and((float) $submission->bauran_energi)->toBe($expected);
});

test('terbangun pemerintah funding requires APBD or APBN detail', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('submissions.store'), [
            'entry_type' => 'terbangun',
            'category' => 'plts',
            'nama_pemilik' => 'Pemilik PLTS',
            'lokasi' => 'Kabupaten Contoh',
            'kapasitas' => 10,
            'sumber_pendanaan' => 'pemerintah',
            'latitude' => -7.0,
            'longitude' => 110.4,
        ])
        ->assertSessionHasErrors('sumber_pendanaan_detail');

    $this->actingAs($user)
        ->post(route('submissions.store'), [
            'entry_type' => 'terbangun',
            'category' => 'plts',
            'nama_pemilik' => 'Pemilik PLTS',
            'lokasi' => 'Kabupaten Contoh',
            'kapasitas' => 10,
            'sumber_pendanaan' => 'pemerintah',
            'sumber_pendanaan_detail' => 'Dana Desa',
            'latitude' => -7.0,
            'longitude' => 110.4,
        ])
        ->assertSessionHasErrors('sumber_pendanaan_detail');

    $this->actingAs($user)
        ->post(route('submissions.store'), [
            'entry_type' => 'terbangun',
            'category' => 'plts',
            'nama_pemilik' => 'Pemilik PLTS',
            'lokasi' => 'Kabupaten Contoh',
            'kapasitas' => 10,
            'sumber_pendanaan' => 'pemerintah',
            'sumber_pendanaan_detail' => 'APBD',
            'latitude' => -7.0,
            'longitude' => 110.4,
        ])
        ->assertRedirect();

    $submission = Submission::query()->where('user_id', $user->id)->latest('id')->first();

    expect($submission)->not->toBeNull()
        ->and($submission->sumber_pendanaan)->toBe('pemerintah')
        ->and($submission->sumber_pendanaan_detail)->toBe('APBD');
});

test('public map detail is available for verified submissions with coordinates', function () {
    $user = User::factory()->create([
        'name' => 'Penginput Rahasia',
        'email' => 'penginput-rahasia@example.com',
    ]);

    $verified = Submission::create([
        'user_id' => $user->id,
        'entry_type' => 'terbangun',
        'category' => 'plts',
        'status' => SubmissionStatus::SudahIntervensi,
        'lokasi' => 'Lokasi publik',
        'kabupaten' => 'KAB. SEMARANG',
        'kecamatan' => 'Ungaran Barat',
        'desa' => 'Lerep',
        'deskripsi_titik' => 'PLTS desa',
        'latitude' => -7.2,
        'longitude' => 110.2,
        'kapasitas' => 10,
        'bauran_energi' => 1.23,
        'nama_pengelola' => 'Budi Rahasia',
        'kontak_person' => 'Siti Rahasia',
        'no_wa' => '081234567890',
        'nama_pemilik' => 'Pemilik Rahasia',
        'penanggung_jawab' => 'PJ Rahasia',
        'nama_pemohon' => 'Yayasan Rahasia',
        'nomor_identitas' => '1234567890123456',
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('plts', 'terbangun'),
    ]);

    $pending = Submission::create([
        'user_id' => $user->id,
        'entry_type' => 'potensi',
        'status' => SubmissionStatus::BelumIntervensi,
        'lokasi' => 'Belum verified',
        'latitude' => -7.1,
        'longitude' => 110.1,
        'field_reviews' => SubmissionFieldRegistry::initializeReviews(null, 'potensi'),
    ]);

    $this->get(route('map.show', $verified))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('map/show')
            ->where('point.id', $verified->id)
            ->where('point.category', 'plts')
            ->where('point.kabupaten', 'KAB. SEMARANG')
            ->where('point.nama_perusahaan_pemrakarsa', 'Yayasan Rahasia')
            ->where('point.nama_pengelola', 'Budi Rahasia')
            ->where('point.kontak_person', 'Siti Rahasia')
            ->missing('point.no_wa')
            ->missing('point.penanggung_jawab')
            ->missing('point.nomor_identitas')
            ->missing('point.user')
            ->missing('point.user_id'));

    $this->get(route('map.show', $pending))->assertNotFound();
});

test('map data only includes verified submissions with coordinates', function () {
    $user = User::factory()->create();

    $pending = Submission::create([
        'user_id' => $user->id,
        'entry_type' => 'potensi',
        'status' => SubmissionStatus::BelumIntervensi,
        'lokasi' => 'Belum verified',
        'latitude' => -7.1,
        'longitude' => 110.1,
        'field_reviews' => SubmissionFieldRegistry::initializeReviews(null, 'potensi'),
    ]);

    $verified = Submission::create([
        'user_id' => $user->id,
        'entry_type' => 'terbangun',
        'category' => 'plts',
        'status' => SubmissionStatus::SudahIntervensi,
        'lokasi' => 'Sudah verified',
        'kabupaten' => 'KAB. SEMARANG',
        'kecamatan' => 'Ungaran Barat',
        'desa' => 'Lerep',
        'latitude' => -7.2,
        'longitude' => 110.2,
        'bauran_energi' => 1.23,
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('plts', 'terbangun'),
    ]);

    $this->getJson(route('map-data'))
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonFragment([
            'id' => $verified->id,
            'entry_type' => 'terbangun',
            'category' => 'plts',
            'kabupaten' => 'KAB. SEMARANG',
        ])
        ->assertJsonMissing(['id' => $pending->id]);
});

test('buat pengajuan form stores as potensi berbadan hukum', function () {
    $user = User::factory()->create();
    $file = Illuminate\Http\UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf');

    $this->actingAs($user)
        ->post(route('submissions.store'), [
            'category' => 'peternakan_ebt',
            'nama_pemohon' => 'Yayasan Contoh',
            'nomor_identitas' => '1234567890123456',
            'alamat_organisasi' => 'Alamat organisasi',
            'nama_ketua' => 'Ketua',
            'surat_permohonan_proposal_path' => $file,
            'dokumen_kepengurusan_path' => $file,
            'dokumen_sk_kemenkumham_path' => $file,
            'surat_keterangan_desa_path' => $file,
            'latitude' => -7.25,
            'longitude' => 110.43,
            'deskripsi_titik' => 'Titik uji',
            'jenis_teknologi' => 'digester_biogas',
            'kapasitas_kandang_m2' => 100,
            'jenis_ternak' => 'Sapi',
            'jenis_usaha' => 'Penggemukan',
            'jumlah_ternak' => 10,
            'ketersediaan_lahan' => 'Ada',
            'komitmen_pengelolaan' => 'Bersedia',
        ])
        ->assertRedirect();

    $submission = Submission::query()->where('user_id', $user->id)->latest('id')->first();

    expect($submission)->not->toBeNull()
        ->and($submission->entry_type)->toBe(EntryType::Potensi)
        ->and($submission->berbadan_hukum)->toBeTrue()
        ->and($submission->entryTypeLabel())->toBe('Potensi Berbadan Hukum')
        ->and($submission->isEbtSimpleEntry())->toBeFalse();
});

test('user can view own submission but not others', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    $submission = Submission::create([
        'user_id' => $owner->id,
        'entry_type' => EntryType::Potensi,
        'berbadan_hukum' => true,
        'category' => 'peternakan_ebt',
        'status' => 'belum_intervensi',
        'nama_pemohon' => 'Pemohon A',
        'nomor_identitas' => '1234567890123456',
        'alamat_organisasi' => 'Alamat',
        'nama_ketua' => 'Ketua',
        'latitude' => -6.2,
        'longitude' => 106.8,
        'deskripsi_titik' => 'Titik uji',
        'field_reviews' => SubmissionFieldRegistry::initializeReviews(
            'peternakan_ebt',
            EntryType::Potensi,
            berbadanHukum: true
        ),
    ]);

    $this->actingAs($owner)
        ->get(route('submissions.show', $submission))
        ->assertOk();

    $this->actingAs($other)
        ->get(route('submissions.show', $submission))
        ->assertForbidden();
});

test('registration always creates user role', function () {
    $email = 'pemohon-'.uniqid().'@example.com';
    $username = 'pemohon'.uniqid();

    $this->post(route('register.store'), [
        'name' => 'Pemohon Baru',
        'username' => $username,
        'email' => $email,
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
    ])->assertRedirect();

    $this->assertDatabaseHas('users', [
        'email' => $email,
        'role' => 'user',
        'username' => $username,
    ]);
});

test('bauran energi formulas match specification', function () {
    expect(BauranEnergiCalculator::calculate('biogas', 100))
        ->toBe(round(0.9 * ((100 * 0.7 * 35) * 0.0063), 6));

    expect(BauranEnergiCalculator::calculate('plts', 10))
        ->toBe(round(((10 * 0.2 * (8760 / 1000)) / (0.13 * 0.613 * 1000)) * 0.9, 6));

    expect(BauranEnergiCalculator::calculate('pats', 5))
        ->toBe(round((((5 * 760) * 0.2 * (8760 / 1000)) / (0.13 * 0.613 * 1000)) * 0.9, 6));
});
