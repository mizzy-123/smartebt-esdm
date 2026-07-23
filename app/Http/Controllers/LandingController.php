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
            'total'            => Submission::count(),
            'sudah_intervensi' => Submission::where('status', 'sudah_intervensi')->count(),
            'per_kategori'     => Submission::where('status', 'sudah_intervensi')
                ->selectRaw('category, COUNT(*) as total')
                ->groupBy('category')
                ->pluck('total', 'category'),
        ];

        return Inertia::render('landing', [
            'downloads' => $downloads,
            'stats'     => $stats,
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
            ->select(['id', 'category', 'deskripsi_titik', 'latitude', 'longitude'])
            ->get()
            ->map(fn ($s) => [
                'id'             => $s->id,
                'category'       => $s->category->value,
                'categoryLabel'  => $s->category->label(),
                'deskripsi'      => $s->deskripsi_titik,
                'latitude'       => (float) $s->latitude,
                'longitude'      => (float) $s->longitude,
            ]);

        return response()->json($points);
    }
}
