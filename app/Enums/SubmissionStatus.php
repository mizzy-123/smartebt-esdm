<?php

namespace App\Enums;

enum SubmissionStatus: string
{
    case BelumIntervensi = 'belum_intervensi';
    case SudahIntervensi = 'sudah_intervensi';

    public function label(): string
    {
        return match($this) {
            self::BelumIntervensi => 'Belum Diverifikasi',
            self::SudahIntervensi => 'Terverifikasi',
        };
    }

    public function badgeClass(): string
    {
        return match($this) {
            self::BelumIntervensi => 'badge-warning',
            self::SudahIntervensi => 'badge-success',
        };
    }
}
