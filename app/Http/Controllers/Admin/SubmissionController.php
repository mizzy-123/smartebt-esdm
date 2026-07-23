<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SubmissionStatus;
use App\Enums\FieldReviewStatus;
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

        $query = Submission::with('user')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $query->where('nama_pemohon', 'like', '%' . $request->search . '%');
        }

        $submissions = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/submissions/index', [
            'submissions' => $submissions->through(fn ($s) => [
                'id'            => $s->id,
                'category'      => $s->category->value,
                'categoryLabel' => $s->category->label(),
                'status'        => $s->status->value,
                'statusLabel'   => $s->status->label(),
                'nama_pemohon'  => $s->nama_pemohon,
                'user'          => ['name' => $s->user?->name, 'email' => $s->user?->email],
                'hasRejected'   => $s->hasRejectedFields(),
                'created_at'    => $s->created_at->format('d M Y'),
            ]),
            'filters' => $request->only(['status', 'category', 'search']),
        ]);
    }

    public function show(Submission $submission): Response
    {
        Gate::authorize('admin');

        $submission->load(['user', 'files', 'peternakan', 'pltsRooftop', 'pltsPerikanan', 'pats']);
        $fields = SubmissionFieldRegistry::fieldsFor($submission->category);

        return Inertia::render('admin/submissions/show', [
            'submission' => SubmissionPresenter::toArray($submission, includeUser: true),
            'fields'     => $fields,
        ]);
    }

    public function reviewField(ReviewFieldRequest $request, Submission $submission): RedirectResponse
    {
        Gate::authorize('admin');

        $data      = $request->validated();
        $fieldKey  = $data['field_key'];
        $status    = $data['status'];
        $reason    = $data['reason'] ?? null;

        // Validate field key for this category
        if (! SubmissionFieldRegistry::isValidFieldKey($submission->category, $fieldKey)) {
            return back()->withErrors(['field_key' => 'Field tidak valid untuk kategori ini.']);
        }

        $reviews = $submission->field_reviews ?? [];
        $reviews[$fieldKey] = [
            'status' => $status,
            'reason' => $status === FieldReviewStatus::Rejected->value ? $reason : null,
        ];

        $submission->update(['field_reviews' => $reviews]);

        // Auto-approve submission if all fields are now approved
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
            'status'        => SubmissionStatus::SudahIntervensi->value,
        ]);

        return back()->with('success', 'Semua field disetujui. Status pengajuan: Terverifikasi.');
    }
}
