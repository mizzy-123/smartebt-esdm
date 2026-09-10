<?php

namespace App\Http\Controllers;

use App\Enums\EntryType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $query = $request->user()
            ->submissions()
            ->latest();

        $entryType = $request->string('entry_type')->toString();

        if ($entryType === 'potensi_berbadan_hukum') {
            $query->where('entry_type', EntryType::Potensi)->where('berbadan_hukum', true);
        } elseif ($entryType === 'potensi') {
            $query->where('entry_type', EntryType::Potensi)
                ->where(function ($q) {
                    $q->where('berbadan_hukum', false)->orWhereNull('berbadan_hukum');
                });
        } elseif ($entryType === 'terbangun') {
            $query->where('entry_type', EntryType::Terbangun);
        }

        $submissions = $query->get([
            'id', 'entry_type', 'berbadan_hukum', 'category', 'status',
            'nama_pemohon', 'nama_pengelola', 'nama_pemilik', 'lokasi',
            'field_reviews', 'created_at',
        ]);

        $data = $submissions->map(fn ($s) => [
            'id' => $s->id,
            'entry_type' => $s->entry_type?->value,
            'entryTypeLabel' => $s->entryTypeLabel(),
            'berbadan_hukum' => $s->isBerbadanHukum(),
            'category' => $s->category?->value,
            'categoryLabel' => $s->category?->label() ?? 'Potensi Lokal EBT',
            'status' => $s->status->value,
            'statusLabel' => $s->status->label(),
            'nama_pemohon' => $s->displayName(),
            'display_name' => $s->displayName(),
            'hasRejected' => $s->hasRejectedFields(),
            'canEdit' => true,
            'created_at' => $s->created_at->format('d M Y'),
        ]);

        return Inertia::render('dashboard', [
            'submissions' => $data,
            'filters' => [
                'entry_type' => in_array($entryType, ['potensi', 'terbangun', 'potensi_berbadan_hukum'], true)
                    ? $entryType
                    : null,
            ],
        ]);
    }
}
