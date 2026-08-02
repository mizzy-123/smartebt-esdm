<?php

namespace App\Enums;

enum SubmissionCategory: string
{
    // Pengajuan (form lama)
    case PeternakanEbt = 'peternakan_ebt';
    case PltsRooftop = 'plts_rooftop';
    case PltsPerikanan = 'plts_perikanan';
    case Pats = 'pats';

    // Infrastruktur terbangun / potensi lokal
    case Biogas = 'biogas';
    case Plts = 'plts';
    case Pltmh = 'pltmh';
    case Pltb = 'pltb';

    public function label(): string
    {
        return match ($this) {
            self::PeternakanEbt => 'Peternakan EBT',
            self::PltsRooftop => 'PLTS Rooftop',
            self::PltsPerikanan => 'PLTS Perikanan',
            self::Pats => 'Pompa Air Tenaga Surya (PATS)',
            self::Biogas => 'Biogas',
            self::Plts => 'PLTS',
            self::Pltmh => 'PLTMH',
            self::Pltb => 'PLTB',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::PeternakanEbt => 'Digester Biogas, PLTS, atau BSG untuk kebutuhan peternakan',
            self::PltsRooftop => 'Panel surya atap untuk bangunan permanen/sementara',
            self::PltsPerikanan => 'Panel surya atap untuk fasilitas perikanan',
            self::Pats => 'Pompa air berbasis tenaga surya untuk irigasi',
            self::Biogas => 'Biogas / digester',
            self::Plts => 'Pembangkit Listrik Tenaga Surya',
            self::Pltmh => 'Pembangkit Listrik Tenaga Mikrohidro',
            self::Pltb => 'Pembangkit Listrik Tenaga Bayu',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::PeternakanEbt => '🐄',
            self::PltsRooftop => '🏠',
            self::PltsPerikanan => '🐟',
            self::Pats => '💧',
            self::Biogas => '🔥',
            self::Plts => '☀️',
            self::Pltmh => '🌊',
            self::Pltb => '💨',
        };
    }

    public function kapasitasUnit(): string
    {
        return match ($this) {
            self::Biogas, self::PeternakanEbt => 'm³',
            self::Plts, self::PltsRooftop, self::PltsPerikanan => 'kWp',
            self::Pats => 'PK',
            self::Pltmh, self::Pltb => 'kW',
        };
    }

    /** @return list<self> */
    public static function pengajuanCases(): array
    {
        return [self::PeternakanEbt, self::PltsRooftop, self::PltsPerikanan, self::Pats];
    }

    /** @return list<self> */
    public static function potensiCases(): array
    {
        return [self::Biogas, self::Plts, self::Pats, self::Pltmh, self::Pltb];
    }

    /** @return list<self> */
    public static function terbangunCases(): array
    {
        return [self::Biogas, self::Plts, self::Pats];
    }

    public function isPengajuanCategory(): bool
    {
        return in_array($this, self::pengajuanCases(), true);
    }

    public function supportsBauranEnergi(): bool
    {
        return in_array($this, [self::Biogas, self::Plts, self::Pats], true);
    }
}
