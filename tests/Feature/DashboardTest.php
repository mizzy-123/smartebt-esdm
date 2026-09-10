<?php

use App\Enums\EntryType;
use App\Enums\SubmissionStatus;
use App\Models\Submission;
use App\Models\User;
use App\Support\SubmissionFieldRegistry;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('user dashboard can filter list by info potensi and terbangun', function () {
    $user = User::factory()->create();

    $potensi = Submission::create([
        'user_id' => $user->id,
        'entry_type' => EntryType::Potensi,
        'berbadan_hukum' => false,
        'category' => 'plts',
        'status' => SubmissionStatus::BelumIntervensi,
        'lokasi' => 'Potensi Lokal',
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('plts', 'potensi'),
    ]);

    $terbangun = Submission::create([
        'user_id' => $user->id,
        'entry_type' => EntryType::Terbangun,
        'category' => 'plts',
        'status' => SubmissionStatus::BelumIntervensi,
        'lokasi' => 'Infrastruktur Terbangun',
        'kapasitas' => 10,
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('plts', 'terbangun'),
    ]);

    Submission::create([
        'user_id' => $user->id,
        'entry_type' => EntryType::Potensi,
        'berbadan_hukum' => true,
        'category' => 'plts',
        'status' => SubmissionStatus::BelumIntervensi,
        'lokasi' => 'Berbadan Hukum',
        'field_reviews' => SubmissionFieldRegistry::initializeReviews('plts', 'potensi', true),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['entry_type' => 'potensi']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('filters.entry_type', 'potensi')
            ->has('submissions', 1)
            ->where('submissions.0.id', $potensi->id));

    $this->actingAs($user)
        ->get(route('dashboard', ['entry_type' => 'terbangun']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('filters.entry_type', 'terbangun')
            ->has('submissions', 1)
            ->where('submissions.0.id', $terbangun->id));
});
