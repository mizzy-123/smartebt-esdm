<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FieldReviewStatus;
use App\Enums\SubmissionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewFieldRequest;
use App\Models\Submission;
use App\Support\SubmissionFieldRegistry;
use App\Support\SubmissionPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('admin');

        $query = Submission::with('user')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('entry_type')) {
            if ($request->entry_type === 'potensi_berbadan_hukum') {
                $query->where('entry_type', 'potensi')->where('berbadan_hukum', true);
            } elseif ($request->entry_type === 'potensi') {
                $query->where('entry_type', 'potensi')->where(function ($q) {
                    $q->where('berbadan_hukum', false)->orWhereNull('berbadan_hukum');
                });
            } else {
                $query->where('entry_type', $request->entry_type);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_pengelola', 'like', "%{$search}%")
                    ->orWhere('nama_pemilik', 'like', "%{$search}%")
                    ->orWhere('nama_pemohon', 'like', "%{$search}%")
                    ->orWhere('lokasi', 'like', "%{$search}%");
            });
        }

        $submissions = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/submissions/index', [
            'submissions' => $submissions->through(fn ($s) => [
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
                'user' => ['name' => $s->user?->name, 'email' => $s->user?->email],
                'hasRejected' => $s->hasRejectedFields(),
                'created_at' => $s->created_at->format('d M Y'),
            ]),
            'filters' => $request->only(['status', 'category', 'entry_type', 'search']),
        ]);
    }

    public function show(Submission $submission): Response
    {
        Gate::authorize('admin');

        $submission->load(['user', 'files', 'peternakan', 'pltsRooftop', 'pltsPerikanan', 'pats']);

        return Inertia::render('admin/submissions/show', [
            'submission' => SubmissionPresenter::toArray($submission, includeUser: true),
            'fields' => SubmissionFieldRegistry::fieldsFor(
                $submission->category,
                $submission->entry_type,
                $submission->isBerbadanHukum()
            ),
        ]);
    }

    public function reviewField(ReviewFieldRequest $request, Submission $submission): RedirectResponse
    {
        Gate::authorize('admin');

        $data = $request->validated();
        $fieldKey = $data['field_key'];
        $status = $data['status'];
        $reason = $data['reason'] ?? null;

        if (! SubmissionFieldRegistry::isValidFieldKey(
            $submission->category,
            $fieldKey,
            $submission->entry_type,
            $submission->isBerbadanHukum()
        )) {
            return back()->withErrors(['field_key' => 'Field tidak valid untuk data ini.']);
        }

        $reviews = $submission->field_reviews ?? [];
        $reviews[$fieldKey] = [
            'status' => $status,
            'reason' => $status === FieldReviewStatus::Rejected->value ? $reason : null,
        ];

        $submission->update(['field_reviews' => $reviews]);

        if ($submission->fresh()->allFieldsApproved()) {
            $submission->update(['status' => SubmissionStatus::SudahIntervensi->value]);
        }

        return back()->with('success', 'Status field berhasil diperbarui.');
    }

    public function approveAll(Submission $submission): RedirectResponse
    {
        Gate::authorize('admin');

        $reviews = $submission->field_reviews ?? [];
        foreach (array_keys($reviews) as $key) {
            $reviews[$key] = ['status' => FieldReviewStatus::Approved->value, 'reason' => null];
        }

        $submission->update([
            'field_reviews' => $reviews,
            'status' => SubmissionStatus::SudahIntervensi->value,
        ]);

        return back()->with('success', 'Semua field disetujui. Status: Terverifikasi.');
    }
}
