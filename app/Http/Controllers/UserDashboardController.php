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
            ->get(['id', 'category', 'status', 'nama_pemohon', 'field_reviews', 'created_at']);

        $data = $submissions->map(fn ($s) => [
            'id'             => $s->id,
            'category'       => $s->category->value,
            'categoryLabel'  => $s->category->label(),
            'status'         => $s->status->value,
            'statusLabel'    => $s->status->label(),
            'nama_pemohon'   => $s->nama_pemohon,
            'hasRejected'    => $s->hasRejectedFields(),
            'created_at'     => $s->created_at->format('d M Y'),
        ]);

        return Inertia::render('dashboard', [
            'submissions' => $data,
        ]);
    }
}
