<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\UserDashboardController;
use App\Http\Controllers\WilayahController;
use Illuminate\Support\Facades\Route;

// ─── Public Routes ───────────────────────────────────────────────────────────
Route::get('/', [LandingController::class, 'index'])->name('landing');
Route::get('/map-data', [LandingController::class, 'mapData'])->name('map-data');
Route::get('/peta/{submission}', [LandingController::class, 'showMapPoint'])->name('map.show');
Route::get('/downloads/{download}', [DownloadController::class, 'download'])->name('downloads.download');

// ─── User Auth Routes ─────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [UserDashboardController::class, 'index'])->name('dashboard');

    Route::prefix('wilayah')->name('wilayah.')->group(function () {
        Route::get('/kabupaten', [WilayahController::class, 'kabupaten'])->name('kabupaten');
        Route::get('/kecamatan', [WilayahController::class, 'kecamatan'])->name('kecamatan');
        Route::get('/kelurahan', [WilayahController::class, 'kelurahan'])->name('kelurahan');
        Route::get('/search', [WilayahController::class, 'search'])->name('search');
    });

    Route::get('/submissions/potensi/create', [SubmissionController::class, 'createPotensi'])
        ->name('submissions.potensi.create');
    Route::get('/submissions/terbangun/create', [SubmissionController::class, 'createTerbangun'])
        ->name('submissions.terbangun.create');

    Route::resource('submissions', SubmissionController::class)
        ->except(['index', 'destroy']);
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────
Route::middleware(['auth', 'can:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [Admin\DashboardController::class, 'index'])->name('dashboard');

        // Submissions
        Route::get('/submissions', [Admin\SubmissionController::class, 'index'])->name('submissions.index');
        Route::get('/submissions/{submission}', [Admin\SubmissionController::class, 'show'])->name('submissions.show');
        Route::patch('/submissions/{submission}/field-review', [Admin\SubmissionController::class, 'reviewField'])->name('submissions.review-field');
        Route::patch('/submissions/{submission}/approve-all', [Admin\SubmissionController::class, 'approveAll'])->name('submissions.approve-all');

        // Downloads CRUD (admin manages)
        Route::resource('downloads', Admin\DownloadResourceController::class)
            ->except(['show']);
    });

require __DIR__.'/settings.php';
