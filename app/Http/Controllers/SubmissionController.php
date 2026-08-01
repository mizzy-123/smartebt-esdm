<?php

namespace App\Http\Controllers;

use App\Enums\EntryType;
use App\Enums\FieldReviewStatus;
use App\Enums\SubmissionCategory;
use App\Http\Requests\StoreEbtEntryRequest;
use App\Http\Requests\UpdateEbtEntryRequest;
use App\Models\Submission;
use App\Support\BauranEnergiCalculator;
use App\Support\SubmissionFieldRegistry;
use App\Support\SubmissionPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    public function create(Request $request): Response
    {
        $type = EntryType::tryFrom($request->query('type', EntryType::Potensi->value))
            ?? EntryType::Potensi;

        return Inertia::render('user/submissions/create', [
            'entryType' => $type->value,
            'entryTypeLabel' => $type->label(),
            'categories' => collect(SubmissionCategory::terbangunCases())->map(fn (SubmissionCategory $category) => [
                'value' => $category->value,
                'label' => $category->label(),
                'description' => $category->description(),
                'icon' => $category->icon(),
                'kapasitasUnit' => $category->kapasitasUnit(),
            ]),
        ]);
    }

    public function store(StoreEbtEntryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $entryType = EntryType::from($data['entry_type']);
        $category = isset($data['category'])
            ? SubmissionCategory::from($data['category'])
            : null;

        if ($entryType === EntryType::Terbangun && $category === null) {
            $category = SubmissionCategory::Plts;
        }

        $submission = DB::transaction(function () use ($request, $data, $entryType, $category) {
            $bauran = null;
            if ($entryType === EntryType::Terbangun && $category !== null) {
                $bauran = BauranEnergiCalculator::calculate($category, $data['kapasitas'] ?? null);
            }

            $submission = Submission::create([
                'user_id' => $request->user()->id,
                'entry_type' => $entryType,
                'category' => $category?->value,
                'lokasi' => $data['lokasi'] ?? null,
                'desa' => $data['desa'] ?? null,
                'kecamatan' => $data['kecamatan'] ?? null,
                'kabupaten' => $data['kabupaten'] ?? null,
                'nama_pengelola' => $data['nama_pengelola'] ?? null,
                'kontak_person' => $data['kontak_person'] ?? null,
                'no_wa' => $data['no_wa'] ?? null,
                'nama_pemilik' => $data['nama_pemilik'] ?? null,
                'penanggung_jawab' => $data['penanggung_jawab'] ?? null,
                'kapasitas' => $data['kapasitas'] ?? null,
                'sumber_pendanaan' => $data['sumber_pendanaan'] ?? null,
                'sumber_pendanaan_detail' => $data['sumber_pendanaan_detail'] ?? null,
                'tahun_pembangunan' => $data['tahun_pembangunan'] ?? null,
                'bauran_energi' => $bauran,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'deskripsi_titik' => $data['deskripsi_titik'] ?? null,
                'field_reviews' => SubmissionFieldRegistry::initializeReviews(
                    $category?->value ?? 'plts',
                    $entryType
                ),
            ]);

            if ($request->hasFile('foto_kondisi')) {
                $path = $request->file('foto_kondisi')->store(
                    "submissions/{$submission->id}",
                    'public'
                );
                $submission->update(['foto_kondisi_path' => $path]);
            }

            return $submission;
        });

        return redirect()
            ->route('submissions.show', $submission)
            ->with('success', $entryType->label().' berhasil dikirim. Menunggu verifikasi admin.');
    }

    public function show(Submission $submission): Response
    {
        $this->authorize('view', $submission);

        $submission->load(['files', 'peternakan', 'pltsRooftop', 'pltsPerikanan', 'pats']);

        return Inertia::render('user/submissions/show', [
            'submission' => SubmissionPresenter::toArray($submission),
            'fields' => SubmissionFieldRegistry::fieldsFor(
                $submission->category?->value ?? 'plts',
                $submission->entry_type
            ),
        ]);
    }

    public function edit(Submission $submission): Response
    {
        $this->authorize('update', $submission);

        if (! $submission->hasRejectedFields()) {
            return redirect()
                ->route('submissions.show', $submission)
                ->with('info', 'Tidak ada field yang perlu direvisi.');
        }

        $submission->load(['files', 'peternakan', 'pltsRooftop', 'pltsPerikanan', 'pats']);

        return Inertia::render('user/submissions/edit', [
            'submission' => SubmissionPresenter::toArray($submission),
            'fields' => SubmissionFieldRegistry::fieldsFor(
                $submission->category?->value ?? 'plts',
                $submission->entry_type
            ),
            'rejectedFields' => $submission->rejectedFieldKeys(),
            'categories' => collect(SubmissionCategory::terbangunCases())->map(fn (SubmissionCategory $category) => [
                'value' => $category->value,
                'label' => $category->label(),
                'kapasitasUnit' => $category->kapasitasUnit(),
            ]),
        ]);
    }

    public function update(UpdateEbtEntryRequest $request, Submission $submission): RedirectResponse
    {
        $this->authorize('update', $submission);

        $rejectedKeys = $submission->rejectedFieldKeys();

        if ($rejectedKeys === []) {
            return redirect()->route('submissions.show', $submission);
        }

        $data = $request->validated();
        $reviews = $submission->field_reviews ?? [];

        DB::transaction(function () use ($request, $submission, $rejectedKeys, $data, &$reviews) {
            $updatable = [
                'lokasi', 'desa', 'kecamatan', 'kabupaten',
                'nama_pengelola', 'kontak_person', 'no_wa',
                'nama_pemilik', 'penanggung_jawab', 'kapasitas',
                'sumber_pendanaan', 'sumber_pendanaan_detail', 'tahun_pembangunan',
                'latitude', 'longitude', 'deskripsi_titik', 'category',
            ];

            $payload = [];
            foreach ($updatable as $key) {
                if (in_array($key, $rejectedKeys, true) && array_key_exists($key, $data)) {
                    $payload[$key] = $data[$key];
                    $reviews[$key] = [
                        'status' => FieldReviewStatus::Pending->value,
                        'reason' => null,
                    ];
                }
            }

            if (in_array('foto_kondisi_path', $rejectedKeys, true) && $request->hasFile('foto_kondisi')) {
                $path = $request->file('foto_kondisi')->store(
                    "submissions/{$submission->id}",
                    'public'
                );
                $payload['foto_kondisi_path'] = $path;
                $reviews['foto_kondisi_path'] = [
                    'status' => FieldReviewStatus::Pending->value,
                    'reason' => null,
                ];
            }

            if (in_array('kapasitas', $rejectedKeys, true) || in_array('category', $rejectedKeys, true) || isset($payload['kapasitas']) || isset($payload['category'])) {
                $category = isset($payload['category'])
                    ? SubmissionCategory::from($payload['category'])
                    : $submission->category;
                $kapasitas = $payload['kapasitas'] ?? $submission->kapasitas;
                if ($submission->entry_type === EntryType::Terbangun && $category) {
                    $payload['bauran_energi'] = BauranEnergiCalculator::calculate($category, $kapasitas);
                    if (isset($reviews['bauran_energi'])) {
                        $reviews['bauran_energi'] = [
                            'status' => FieldReviewStatus::Pending->value,
                            'reason' => null,
                        ];
                    }
                }
            }

            $payload['field_reviews'] = $reviews;
            $submission->update($payload);
        });

        return redirect()
            ->route('submissions.show', $submission)
            ->with('success', 'Revisi berhasil dikirim. Silakan tunggu verifikasi admin.');
    }
}
