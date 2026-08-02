<?php

namespace App\Http\Controllers;

use App\Enums\EntryType;
use App\Enums\FieldReviewStatus;
use App\Enums\SubmissionCategory;
use App\Enums\SubmissionStatus;
use App\Http\Requests\StoreEbtEntryRequest;
use App\Http\Requests\StorePatsRequest;
use App\Http\Requests\StorePeternakanRequest;
use App\Http\Requests\StorePltsPerikananRequest;
use App\Http\Requests\StorePltsRooftopRequest;
use App\Http\Requests\StoreSubmissionBaseRequest;
use App\Http\Requests\UpdateEbtEntryRequest;
use App\Models\Kabupaten;
use App\Models\Provinsi;
use App\Models\Submission;
use App\Models\SubmissionFile;
use App\Support\BauranEnergiCalculator;
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
            'categories' => collect(SubmissionCategory::pengajuanCases())->map(fn (SubmissionCategory $category) => [
                'value' => $category->value,
                'label' => $category->label(),
                'description' => $category->description(),
                'icon' => $category->icon(),
            ]),
        ]);
    }

    public function createPotensi(): Response
    {
        return $this->createEbtForm(EntryType::Potensi);
    }

    public function createTerbangun(): Response
    {
        return $this->createEbtForm(EntryType::Terbangun);
    }

    private function createEbtForm(EntryType $type): Response
    {
        $categoryCases = $type === EntryType::Potensi
            ? SubmissionCategory::potensiCases()
            : SubmissionCategory::terbangunCases();

        return Inertia::render('user/submissions/create-ebt', [
            'entryType' => $type->value,
            'entryTypeLabel' => $type->label(),
            'categories' => collect($categoryCases)->map(fn (SubmissionCategory $category) => [
                'value' => $category->value,
                'label' => $category->label(),
                'description' => $category->description(),
                'icon' => $category->icon(),
                'kapasitasUnit' => $category->kapasitasUnit(),
            ]),
            'kabupatenOptions' => $this->kabupatenOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $entryType = EntryType::tryFrom((string) $request->input('entry_type', ''));

        if (in_array($entryType, [EntryType::Potensi, EntryType::Terbangun], true)) {
            return $this->storeEbtEntry(app(StoreEbtEntryRequest::class));
        }

        return $this->storePengajuan($request);
    }

    public function show(Submission $submission): Response
    {
        $this->authorize('view', $submission);

        $submission->load(['files', 'peternakan', 'pltsRooftop', 'pltsPerikanan', 'pats']);

        return Inertia::render('user/submissions/show', [
            'submission' => SubmissionPresenter::toArray($submission),
            'fields' => SubmissionFieldRegistry::fieldsFor(
                $submission->category,
                $submission->entry_type,
                $submission->isBerbadanHukum()
            ),
        ]);
    }

    public function edit(Submission $submission): Response
    {
        $this->authorize('update', $submission);

        $submission->load(['files', 'peternakan', 'pltsRooftop', 'pltsPerikanan', 'pats']);

        if ($submission->isEbtSimpleEntry()) {
            $categoryCases = $submission->entry_type === EntryType::Potensi
                ? SubmissionCategory::potensiCases()
                : SubmissionCategory::terbangunCases();

            return Inertia::render('user/submissions/edit-ebt', [
                'submission' => SubmissionPresenter::toArray($submission),
                'fields' => SubmissionFieldRegistry::fieldsFor(
                    $submission->category,
                    $submission->entry_type,
                    $submission->isBerbadanHukum()
                ),
                'rejectedFields' => $submission->rejectedFieldKeys(),
                'categories' => collect($categoryCases)->map(fn (SubmissionCategory $category) => [
                    'value' => $category->value,
                    'label' => $category->label(),
                    'description' => $category->description(),
                    'icon' => $category->icon(),
                    'kapasitasUnit' => $category->kapasitasUnit(),
                ]),
                'kabupatenOptions' => $this->kabupatenOptions(),
            ]);
        }

        return Inertia::render('user/submissions/edit', [
            'submission' => SubmissionPresenter::toArray($submission),
            'fields' => SubmissionFieldRegistry::fieldsFor(
                $submission->category,
                $submission->entry_type,
                $submission->isBerbadanHukum()
            ),
            'rejectedFields' => $submission->rejectedFieldKeys(),
        ]);
    }

    public function update(Request $request, Submission $submission): RedirectResponse
    {
        $this->authorize('update', $submission);

        if ($submission->isEbtSimpleEntry()) {
            return $this->updateEbtEntry(app(UpdateEbtEntryRequest::class), $submission);
        }

        return $this->updatePengajuan($request, $submission);
    }

    private function storeEbtEntry(StoreEbtEntryRequest $request): RedirectResponse
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
                'berbadan_hukum' => false,
                'field_reviews' => SubmissionFieldRegistry::initializeReviews(
                    $category,
                    $entryType,
                    berbadanHukum: false
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

    private function storePengajuan(Request $request): RedirectResponse
    {
        $category = SubmissionCategory::from($request->input('category'));

        $baseData = app(StoreSubmissionBaseRequest::class)->validated();

        $detailData = match ($category) {
            SubmissionCategory::PeternakanEbt => app(StorePeternakanRequest::class)->validated(),
            SubmissionCategory::PltsRooftop => app(StorePltsRooftopRequest::class)->validated(),
            SubmissionCategory::PltsPerikanan => app(StorePltsPerikananRequest::class)->validated(),
            SubmissionCategory::Pats => app(StorePatsRequest::class)->validated(),
            default => abort(422, 'Kategori pengajuan tidak valid.'),
        };

        $submission = DB::transaction(function () use ($request, $category, $baseData, $detailData) {
            $submission = Submission::create([
                ...collect($baseData)->except(self::BASE_FILE_FIELDS)->all(),
                'user_id' => $request->user()->id,
                'entry_type' => EntryType::Potensi,
                'berbadan_hukum' => true,
                'field_reviews' => SubmissionFieldRegistry::initializeReviews(
                    $category,
                    EntryType::Potensi,
                    berbadanHukum: true
                ),
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
            ->with('success', 'Potensi berbadan hukum berhasil dikirim. Tim kami akan meninjau dokumen Anda.');
    }

    private function updateEbtEntry(UpdateEbtEntryRequest $request, Submission $submission): RedirectResponse
    {
        $data = $request->validated();
        $wasVerified = $submission->status === SubmissionStatus::SudahIntervensi;

        DB::transaction(function () use ($request, $submission, $data, $wasVerified) {
            $updatable = [
                'lokasi', 'desa', 'kecamatan', 'kabupaten',
                'nama_pengelola', 'kontak_person', 'no_wa',
                'nama_pemilik', 'penanggung_jawab', 'kapasitas',
                'sumber_pendanaan', 'sumber_pendanaan_detail', 'tahun_pembangunan',
                'latitude', 'longitude', 'deskripsi_titik', 'category',
            ];

            $payload = [];
            foreach ($updatable as $key) {
                if (array_key_exists($key, $data)) {
                    $payload[$key] = $data[$key];
                }
            }

            if ($request->hasFile('foto_kondisi')) {
                $payload['foto_kondisi_path'] = $request->file('foto_kondisi')->store(
                    "submissions/{$submission->id}",
                    'public'
                );
            }

            $category = isset($payload['category'])
                ? SubmissionCategory::from($payload['category'])
                : $submission->category;
            $kapasitas = $payload['kapasitas'] ?? $submission->kapasitas;

            if ($submission->entry_type === EntryType::Terbangun && $category) {
                $payload['bauran_energi'] = BauranEnergiCalculator::calculate($category, $kapasitas);
            }

            $payload['field_reviews'] = SubmissionFieldRegistry::initializeReviews(
                $category,
                $submission->entry_type,
                $submission->isBerbadanHukum()
            );

            if ($wasVerified) {
                $payload['status'] = SubmissionStatus::BelumIntervensi;
            }

            $submission->update($payload);
        });

        return redirect()
            ->route('submissions.show', $submission)
            ->with(
                'success',
                $wasVerified
                    ? 'Data berhasil diperbarui. Status kembali menunggu verifikasi admin.'
                    : 'Data berhasil diperbarui.'
            );
    }

    private function updatePengajuan(Request $request, Submission $submission): RedirectResponse
    {
        $rejectedKeys = $submission->rejectedFieldKeys();
        $keysToUpdate = $rejectedKeys !== []
            ? $rejectedKeys
            : array_keys(SubmissionFieldRegistry::fieldsFor(
                $submission->category,
                $submission->entry_type,
                $submission->isBerbadanHukum()
            ));

        $reviews = $submission->field_reviews ?? [];
        $detail = $submission->legacyDetail();
        $wasVerified = $submission->status === SubmissionStatus::SudahIntervensi;
        $changed = false;

        DB::transaction(function () use ($request, $submission, $keysToUpdate, &$reviews, $detail, $wasVerified, &$changed) {
            foreach ($keysToUpdate as $key) {
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
                    $changed = true;
                    $reviews[$key] = [
                        'status' => FieldReviewStatus::Pending->value,
                        'reason' => null,
                    ];
                }
            }

            $payload = ['field_reviews' => $reviews];
            if ($changed && $wasVerified) {
                $payload['status'] = SubmissionStatus::BelumIntervensi;
            }

            $submission->update($payload);
        });

        return redirect()
            ->route('submissions.show', $submission)
            ->with('success', $wasVerified && $changed
                ? 'Data berhasil diperbarui. Status kembali menunggu verifikasi admin.'
                : 'Data berhasil diperbarui.');
    }

    private function createDetailRecord(Submission $submission, SubmissionCategory $category, array $data, Request $request): void
    {
        match ($category) {
            SubmissionCategory::PeternakanEbt => $submission->peternakan()->create($data),
            SubmissionCategory::PltsRooftop => $this->createPltsRecord($submission, $submission->pltsRooftop(), $data, $request),
            SubmissionCategory::PltsPerikanan => $this->createPltsRecord($submission, $submission->pltsPerikanan(), $data, $request),
            SubmissionCategory::Pats => $submission->pats()->create($data),
            default => null,
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

    /**
     * @return list<array{id: int, nama: string}>
     */
    private function kabupatenOptions(): array
    {
        return Kabupaten::query()
            ->where('provinsi_id', Provinsi::JAWA_TENGAH)
            ->orderBy('nama')
            ->get(['kabupaten_id', 'nama'])
            ->map(fn (Kabupaten $kabupaten) => [
                'id' => $kabupaten->kabupaten_id,
                'nama' => $kabupaten->nama,
            ])
            ->all();
    }
}
