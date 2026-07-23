<?php

namespace App\Enums;

enum SubmissionCategory: string
{
    case PeternakanEbt = 'peternakan_ebt';
    case PltsRooftop = 'plts_rooftop';
    case PltsPerikanan = 'plts_perikanan';
    case Pats = 'pats';

    public function label(): string
    {
        return match($this) {
            self::PeternakanEbt => 'Peternakan EBT',
            self::PltsRooftop => 'PLTS Rooftop',
            self::PltsPerikanan => 'PLTS Perikanan',
            self::Pats => 'Pompa Air Tenaga Surya (PATS)',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::PeternakanEbt => 'Digester Biogas, PLTS, atau BSG untuk kebutuhan peternakan',
            self::PltsRooftop => 'Panel surya atap untuk bangunan permanen/sementara',
            self::PltsPerikanan => 'Panel surya atap untuk fasilitas perikanan',
            self::Pats => 'Pompa air berbasis tenaga surya untuk irigasi',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::PeternakanEbt => '🐄',
            self::PltsRooftop => '🏠',
            self::PltsPerikanan => '🐟',
            self::Pats => '💧',
        };
    }
}
