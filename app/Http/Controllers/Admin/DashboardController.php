<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $total = Submission::count();
        $belum = Submission::where('status', 'belum_intervensi')->count();
        $sudah = Submission::where('status', 'sudah_intervensi')->count();

        $perKategori = Submission::selectRaw('category, COUNT(*) as total')
            ->groupBy('category')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category?->value,
                'label' => $row->category?->label() ?? 'Potensi Lokal EBT',
                'total' => $row->total,
            ]);

        $perKategoriBelum = Submission::where('status', 'belum_intervensi')
            ->selectRaw('category, COUNT(*) as total')
            ->groupBy('category')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category?->value,
                'label' => $row->category?->label() ?? 'Potensi Lokal EBT',
                'total' => $row->total,
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total' => $total,
                'belum' => $belum,
                'sudah' => $sudah,
            ],
            'perKategori' => $perKategori,
            'perKategoriBelum' => $perKategoriBelum,
        ]);
    }
}
