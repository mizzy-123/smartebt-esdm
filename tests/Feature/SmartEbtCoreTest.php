<?php

use App\Models\Submission;
use App\Models\User;
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

test('user can view own submission but not others', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    $submission = Submission::create([
        'user_id' => $owner->id,
        'category' => 'peternakan_ebt',
        'status' => 'belum_intervensi',
        'nama_pemohon' => 'Pemohon A',
        'nomor_identitas' => '1234567890123456',
        'alamat_organisasi' => 'Alamat',
        'nama_ketua' => 'Ketua',
        'latitude' => -6.2,
        'longitude' => 106.8,
        'deskripsi_titik' => 'Titik uji',
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('peternakan_ebt'),
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
