import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, MapPin, Zap } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { landing } from '@/routes';
import type { EntryTypeValue, SubmissionCategoryValue, SumberPendanaanValue } from '@/types/submission';

const PublicMap = lazy(() => import('@/components/map/public-map'));

interface PublicMapPointDetail {
    id: number;
    entry_type: EntryTypeValue;
    entryTypeLabel: string;
    berbadan_hukum?: boolean;
    category: SubmissionCategoryValue | null;
    categoryLabel: string;
    kapasitasUnit?: string | null;
    lokasi?: string | null;
    desa?: string | null;
    kecamatan?: string | null;
    kabupaten?: string | null;
    deskripsi_titik?: string | null;
    kapasitas?: number | null;
    bauran_energi?: number | null;
    sumber_pendanaan?: SumberPendanaanValue | null;
    tahun_pembangunan?: number | null;
    latitude: number;
    longitude: number;
    foto_kondisi_path?: string | null;
}

const SUMBER_PENDANAAN_LABELS: Record<string, string> = {
    pemerintah: 'Pemerintah (APBD/APBN)',
    mandiri: 'Mandiri',
    kerjasama: 'Kerjasama',
};

export default function MapPointShow({ point }: { point: PublicMapPointDetail }) {
    const wilayah = [point.desa, point.kecamatan, point.kabupaten]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join(', ');

    const rows: Array<[string, string | number | null | undefined]> = [
        ['Jenis Data', point.entryTypeLabel],
        ['Kategori / Teknologi', point.categoryLabel],
        ['Lokasi', point.lokasi],
        ['Wilayah', wilayah || null],
        ['Deskripsi Titik', point.deskripsi_titik],
        [
            'Kapasitas',
            point.kapasitas != null
                ? `${point.kapasitas} ${point.kapasitasUnit ?? ''}`.trim()
                : null,
        ],
        [
            'Bauran Energi',
            point.bauran_energi != null
                ? point.bauran_energi.toLocaleString('id-ID', { maximumFractionDigits: 6 })
                : null,
        ],
        [
            'Sumber Pendanaan',
            point.sumber_pendanaan
                ? (SUMBER_PENDANAAN_LABELS[point.sumber_pendanaan] ?? point.sumber_pendanaan)
                : null,
        ],
        ['Tahun Pembangunan', point.tahun_pembangunan],
        ['Koordinat', `${point.latitude}, ${point.longitude}`],
    ];

    const mapPoint = {
        id: point.id,
        entry_type: point.entry_type,
        entryTypeLabel: point.entryTypeLabel,
        berbadan_hukum: point.berbadan_hukum,
        category: point.category,
        categoryLabel: point.categoryLabel,
        deskripsi: point.deskripsi_titik ?? point.lokasi ?? point.categoryLabel,
        desa: point.desa,
        kecamatan: point.kecamatan,
        kabupaten: point.kabupaten,
        latitude: point.latitude,
        longitude: point.longitude,
        kapasitas: point.kapasitas,
        bauran_energi: point.bauran_energi,
    };

    return (
        <div className="min-h-screen bg-[#F4F7F9] font-sans">
            <Head title={`${point.categoryLabel} — Detail Peta`} />

            <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A2463]/95 shadow-lg backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <Link href={landing()} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDB813]">
                            <Zap className="h-5 w-5 text-[#0A2463]" />
                        </div>
                        <div>
                            <span className="text-lg font-bold tracking-tight text-white">SMART-EBT</span>
                            <span className="ml-2 hidden text-xs text-blue-300 sm:inline">ESDM</span>
                        </div>
                    </Link>
                    <Link
                        href={`${landing.url()}#peta`}
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-blue-200 transition hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Peta
                    </Link>
                </div>
            </nav>

            <main className="mx-auto max-w-5xl px-6 py-10">
                <div className="mb-6">
                    <div className="mb-2 flex items-center gap-2 text-[#1B8B41]">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-semibold tracking-wide uppercase">Detail Titik EBT</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#0A2463]">{point.categoryLabel}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{point.entryTypeLabel}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-5">
                    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm lg:col-span-3">
                        <div className="border-b border-border px-6 py-4">
                            <h2 className="font-semibold text-[#0A2463]">Informasi Umum</h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Data publik lokasi. Informasi pribadi dan kontak tidak ditampilkan.
                            </p>
                        </div>
                        <dl className="divide-y divide-border text-sm">
                            {rows
                                .filter(([, value]) => value != null && value !== '')
                                .map(([label, value]) => (
                                    <div key={label} className="grid gap-1 px-6 py-3 sm:grid-cols-3">
                                        <dt className="text-muted-foreground">{label}</dt>
                                        <dd className="font-medium text-foreground sm:col-span-2">{value}</dd>
                                    </div>
                                ))}
                        </dl>
                        {point.foto_kondisi_path && (
                            <div className="border-t border-border px-6 py-4">
                                <a
                                    href={point.foto_kondisi_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-[#0A2463] hover:underline"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Lihat foto kondisi
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 lg:col-span-2">
                        <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-muted" />}>
                            <PublicMap points={[mapPoint]} height="280px" showDetailLink={false} />
                        </Suspense>
                        <a
                            href={`https://maps.google.com/?q=${point.latitude},${point.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-[#0A2463] shadow-sm transition hover:bg-muted/40"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Buka di Google Maps
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
