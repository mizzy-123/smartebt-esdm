<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $submissions = $request->user()
            ->submissions()
            ->latest()
            ->get([
                'id', 'entry_type', 'category', 'status',
                'nama_pemohon', 'nama_pengelola', 'nama_pemilik', 'lokasi',
                'field_reviews', 'created_at',
            ]);

        $data = $submissions->map(fn ($s) => [
            'id' => $s->id,
            'entry_type' => $s->entry_type?->value,
            'entryTypeLabel' => $s->entry_type?->label() ?? 'Pengajuan',
            'category' => $s->category?->value,
            'categoryLabel' => $s->category?->label() ?? 'Potensi Lokal EBT',
            'status' => $s->status->value,
            'statusLabel' => $s->status->label(),
            'nama_pemohon' => $s->displayName(),
            'display_name' => $s->displayName(),
            'hasRejected' => $s->hasRejectedFields(),
            'created_at' => $s->created_at->format('d M Y'),
        ]);

        return Inertia::render('dashboard', [
            'submissions' => $data,
        ]);
    }
}
