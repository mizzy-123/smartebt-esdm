<?php

namespace App\Http\Controllers;

use App\Models\Download;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function index(): Response
    {
        $downloads = Download::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get(['id', 'title', 'description', 'original_name', 'created_at']);

        $stats = [
            'total' => Submission::count(),
            'sudah_intervensi' => Submission::where('status', 'sudah_intervensi')->count(),
            'potensi' => Submission::where('entry_type', 'potensi')->count(),
            'terbangun' => Submission::where('entry_type', 'terbangun')->count(),
            'per_kategori' => Submission::where('status', 'sudah_intervensi')
                ->whereNotNull('category')
                ->selectRaw('category, COUNT(*) as total')
                ->groupBy('category')
                ->pluck('total', 'category'),
        ];

        return Inertia::render('landing', [
            'downloads' => $downloads,
            'stats' => $stats,
        ]);
    }

    /**
     * JSON endpoint: EBT points that are approved and have valid coordinates.
     * Only returns safe public fields (no personal data).
     */
    public function mapData(): JsonResponse
    {
        $points = Submission::where('status', 'sudah_intervensi')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get(['id', 'entry_type', 'category', 'lokasi', 'deskripsi_titik', 'latitude', 'longitude', 'bauran_energi', 'kapasitas'])
            ->map(fn ($s) => [
                'id' => $s->id,
                'entry_type' => $s->entry_type?->value,
                'entryTypeLabel' => $s->entry_type?->label(),
                'category' => $s->category?->value,
                'categoryLabel' => $s->category?->label()
                    ?? ($s->entry_type?->value === 'potensi' ? 'Potensi Lokal EBT' : '-'),
                'deskripsi' => $s->deskripsi_titik ?? $s->lokasi,
                'latitude' => (float) $s->latitude,
                'longitude' => (float) $s->longitude,
                'bauran_energi' => $s->bauran_energi !== null ? (float) $s->bauran_energi : null,
                'kapasitas' => $s->kapasitas !== null ? (float) $s->kapasitas : null,
            ]);

        return response()->json($points);
    }
}
