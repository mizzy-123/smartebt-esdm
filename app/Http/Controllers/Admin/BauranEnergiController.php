<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EntryType;
use App\Enums\SubmissionCategory;
use App\Http\Controllers\Controller;
use App\Models\Submission;
use Inertia\Inertia;
use Inertia\Response;

class BauranEnergiController extends Controller
{
    public function index(): Response
    {
        $aggregates = Submission::query()
            ->where('entry_type', EntryType::Terbangun)
            ->whereNotNull('category')
            ->whereNotNull('bauran_energi')
            ->selectRaw('category, COUNT(*) as jumlah, COALESCE(SUM(bauran_energi), 0) as total_bauran')
            ->groupBy('category')
            ->get()
            ->keyBy(fn ($row) => $row->category instanceof SubmissionCategory
                ? $row->category->value
                : (string) $row->category);

        $perItem = collect(SubmissionCategory::terbangunCases())
            ->map(function (SubmissionCategory $category) use ($aggregates) {
                $row = $aggregates->get($category->value);

                return [
                    'category' => $category->value,
                    'label' => $category->label(),
                    'jumlah' => (int) ($row->jumlah ?? 0),
                    'total_bauran' => round((float) ($row->total_bauran ?? 0), 6),
                ];
            })
            ->values();

        return Inertia::render('admin/bauran-energi', [
            'perItem' => $perItem,
            'totalBauran' => round((float) $perItem->sum('total_bauran'), 6),
            'totalUnit' => (int) $perItem->sum('jumlah'),
        ]);
    }
}
