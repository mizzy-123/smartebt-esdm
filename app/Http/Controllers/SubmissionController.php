<?php

namespace App\Http\Controllers;

use App\Enums\FieldReviewStatus;
use App\Enums\SubmissionCategory;
use App\Http\Requests\StorePatsRequest;
use App\Http\Requests\StorePeternakanRequest;
use App\Http\Requests\StorePltsPerikananRequest;
use App\Http\Requests\StorePltsRooftopRequest;
use App\Http\Requests\StoreSubmissionBaseRequest;
use App\Models\Submission;
use App\Models\SubmissionFile;
use App\Support\SubmissionFieldRegistry;
use App\Support\SubmissionPresenter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    private const BASE_FILE_FIELDS = [
        'surat_permohonan_proposal_path',
        'dokumen_kepengurusan_path',
        'dokumen_sk_kemenkumham_path',
        'surat_keterangan_desa_path',
    ];

    public function create(): Response
    {
        return Inertia::render('user/submissions/create', [
            'categories' => collect(SubmissionCategory::cases())->map(fn ($category) => [
                'value' => $category->value,
                'label' => $category->label(),
                'description' => $category->description(),
                'icon' => $category->icon(),
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $category = SubmissionCategory::from($request->input('category'));

        $baseData = app(StoreSubmissionBaseRequest::class)->validated();

        $detailData = match ($category) {
            SubmissionCategory::PeternakanEbt => app(StorePeternakanRequest::class)->validated(),
            SubmissionCategory::PltsRooftop => app(StorePltsRooftopRequest::class)->validated(),
            SubmissionCategory::PltsPerikanan => app(StorePltsPerikananRequest::class)->validated(),
            SubmissionCategory::Pats => app(StorePatsRequest::class)->validated(),
        };

        $submission = DB::transaction(function () use ($request, $category, $baseData, $detailData) {
            $submission = Submission::create([
                ...collect($baseData)->except(self::BASE_FILE_FIELDS)->all(),
                'user_id' => $request->user()->id,
                'field_reviews' => SubmissionFieldRegistry::initializeReviews($category),
            ]);

            foreach (self::BASE_FILE_FIELDS as $field) {
                if ($request->hasFile($field)) {
                    $path = $request->file($field)->store(
                        "submissions/{$submission->id}",
                        'public'
                    );
                    $submission->update([$field => $path]);
                }
            }

            $this->createDetailRecord($submission, $category, $detailData, $request);

            return $submission;
        });

        return redirect()
            ->route('submissions.show', $submission)
            ->with('success', 'Pengajuan berhasil dikirim. Tim kami akan meninjau dokumen Anda.');
    }

    public function show(Submission $submission): Response
    {
        $this->authorize('view', $submission);

        $submission->load(['files', 'peternakan', 'pltsRooftop', 'pltsPerikanan', 'pats']);

        return Inertia::render('user/submissions/show', [
            'submission' => SubmissionPresenter::toArray($submission),
            'fields' => SubmissionFieldRegistry::fieldsFor($submission->category),
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
            'fields' => SubmissionFieldRegistry::fieldsFor($submission->category),
            'rejectedFields' => $submission->rejectedFieldKeys(),
        ]);
    }

    public function update(Request $request, Submission $submission): RedirectResponse
    {
        $this->authorize('update', $submission);

        $rejectedKeys = $submission->rejectedFieldKeys();

        if ($rejectedKeys === []) {
            return redirect()->route('submissions.show', $submission);
        }

        $reviews = $submission->field_reviews ?? [];
        $detail = $submission->detail;

        DB::transaction(function () use ($request, $submission, $rejectedKeys, &$reviews, $detail) {
            foreach ($rejectedKeys as $key) {
                $updated = false;

                if ($key === 'tagihan_listrik' && $request->hasFile('tagihan_listrik')) {
                    $submission->files()->where('field_key', 'tagihan_listrik')->delete();

                    foreach ($request->file('tagihan_listrik') as $index => $file) {
                        $path = $file->store("submissions/{$submission->id}/tagihan", 'public');
                        SubmissionFile::create([
                            'submission_id' => $submission->id,
                            'field_key' => 'tagihan_listrik',
                            'file_path' => $path,
                            'original_name' => $file->getClientOriginalName(),
                            'periode' => $request->input("periode.{$index}"),
                        ]);
                    }

                    $updated = true;
                } elseif ($request->hasFile($key) && in_array($key, self::BASE_FILE_FIELDS, true)) {
                    $path = $request->file($key)->store("submissions/{$submission->id}", 'public');
                    $submission->update([$key => $path]);
                    $updated = true;
                } elseif ($request->filled($key) || $request->has($key)) {
                    $value = $request->input($key);

                    if ($this->isBaseField($submission, $key)) {
                        $submission->update([$key => $value]);
                        $updated = true;
                    } elseif ($detail instanceof Model && $this->isFillable($detail, $key)) {
                        $detail->update([$key => $value]);
                        $updated = true;
                    }
                }

                if ($updated) {
                    $reviews[$key] = [
                        'status' => FieldReviewStatus::Pending->value,
                        'reason' => null,
                    ];
                }
            }

            $submission->update(['field_reviews' => $reviews]);
        });

        return redirect()
            ->route('submissions.show', $submission)
            ->with('success', 'Revisi berhasil dikirim. Silakan tunggu verifikasi admin.');
    }

    private function createDetailRecord(Submission $submission, SubmissionCategory $category, array $data, Request $request): void
    {
        match ($category) {
            SubmissionCategory::PeternakanEbt => $submission->peternakan()->create($data),
            SubmissionCategory::PltsRooftop => $this->createPltsRecord($submission, $submission->pltsRooftop(), $data, $request),
            SubmissionCategory::PltsPerikanan => $this->createPltsRecord($submission, $submission->pltsPerikanan(), $data, $request),
            SubmissionCategory::Pats => $submission->pats()->create($data),
        };
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Relations\HasOne<*, *, *>  $relation
     */
    private function createPltsRecord(Submission $submission, $relation, array $data, Request $request): void
    {
        unset($data['tagihan_listrik']);
        $relation->create($data);

        if ($request->hasFile('tagihan_listrik')) {
            foreach ($request->file('tagihan_listrik') as $index => $file) {
                $path = $file->store("submissions/{$submission->id}/tagihan", 'public');
                SubmissionFile::create([
                    'submission_id' => $submission->id,
                    'field_key' => 'tagihan_listrik',
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'periode' => $request->input("periode.{$index}"),
                ]);
            }
        }
    }

    private function isBaseField(Submission $submission, string $key): bool
    {
        return array_key_exists($key, $submission->getAttributes())
            || in_array($key, $submission->getFillable(), true);
    }

    private function isFillable(Model $model, string $key): bool
    {
        return in_array($key, $model->getFillable(), true);
    }
}
