<?php

namespace App\Enums;

enum SubmissionCategory: string
{
    // New simplified categories
    case Biogas = 'biogas';
    case Plts = 'plts';
    case Pats = 'pats';

    // Legacy categories (read-only compatibility)
    case PeternakanEbt = 'peternakan_ebt';
    case PltsRooftop = 'plts_rooftop';
    case PltsPerikanan = 'plts_perikanan';

    public function label(): string
    {
        return match ($this) {
            self::Biogas => 'Biogas',
            self::Plts => 'PLTS',
            self::Pats => 'Pompa Air Tenaga Surya (PATS)',
            self::PeternakanEbt => 'Peternakan EBT',
            self::PltsRooftop => 'PLTS Rooftop',
            self::PltsPerikanan => 'PLTS Perikanan',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Biogas => 'Infrastruktur biogas / digester yang sudah terbangun',
            self::Plts => 'Pembangkit Listrik Tenaga Surya yang sudah terbangun',
            self::Pats => 'Pompa air berbasis tenaga surya yang sudah terbangun',
            self::PeternakanEbt => 'Digester Biogas, PLTS, atau BSG untuk kebutuhan peternakan',
            self::PltsRooftop => 'Panel surya atap untuk bangunan permanen/sementara',
            self::PltsPerikanan => 'Panel surya atap untuk fasilitas perikanan',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Biogas, self::PeternakanEbt => '🔥',
            self::Plts, self::PltsRooftop, self::PltsPerikanan => '☀️',
            self::Pats => '💧',
        };
    }

    public function kapasitasUnit(): string
    {
        return match ($this) {
            self::Biogas, self::PeternakanEbt => 'm³',
            self::Plts, self::PltsRooftop, self::PltsPerikanan => 'kWp',
            self::Pats => 'PK',
        };
    }

    /** Categories available for new infrastruktur terbangun inputs. */
    public static function terbangunCases(): array
    {
        return [self::Biogas, self::Plts, self::Pats];
    }

    public function supportsBauranEnergi(): bool
    {
        return in_array($this, [self::Biogas, self::Plts, self::Pats], true);
    }
}
