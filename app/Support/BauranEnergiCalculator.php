<?php

namespace App\Support;

use App\Enums\SubmissionCategory;

class BauranEnergiCalculator
{
    public static function calculate(SubmissionCategory|string $category, float|int|string|null $kapasitas): ?float
    {
        if ($kapasitas === null || $kapasitas === '') {
            return null;
        }

        $kapasitas = (float) $kapasitas;
        $cat = $category instanceof SubmissionCategory
            ? $category
            : SubmissionCategory::from($category);

        $result = match ($cat) {
            SubmissionCategory::Biogas => 0.9 * (($kapasitas * 0.7 * 35) * 0.0063),
            SubmissionCategory::Plts => (($kapasitas * 0.2 * (8760 / 1000)) / (0.13 * 0.613 * 1000)) * 0.9,
            SubmissionCategory::Pats => ((($kapasitas * 760) * 0.2 * (8760 / 1000)) / (0.13 * 0.613 * 1000)) * 0.9,
            default => null,
        };

        return $result !== null ? round($result, 6) : null;
    }
}
