<?php

namespace App\Enums;

enum EntryType: string
{
    case Pengajuan = 'pengajuan';
    case Potensi = 'potensi';
    case Terbangun = 'terbangun';

    public function label(): string
    {
        return match ($this) {
            self::Pengajuan => 'Pengajuan',
            self::Potensi => 'Info Potensi Lokal EBT',
            self::Terbangun => 'Infrastruktur Terbangun',
        };
    }
}
