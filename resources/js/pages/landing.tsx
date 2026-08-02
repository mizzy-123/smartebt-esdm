import type { Download, EntryTypeValue, MapPoint } from '@/types/submission';
import { Link } from '@inertiajs/react';
import { ArrowRight, Building2, Download as DownloadIcon, FileText, Leaf, MapPin, Zap } from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';

const PublicMap = lazy(() => import('@/components/map/public-map'));

interface LandingProps {
    downloads: Download[];
    stats: {
        total: number;
        sudah_intervensi: number;
        potensi?: number;
        terbangun?: number;
        per_kategori: Record<string, number>;
    };
}

const CATEGORY_LABELS: Record<string, string> = {
    biogas: 'Biogas',
    plts: 'PLTS',
    pats: 'Pompa Air (PATS)',
    pltmh: 'PLTMH',
    pltb: 'PLTB',
    peternakan_ebt: 'Peternakan EBT',
    plts_rooftop: 'PLTS Rooftop',
    plts_perikanan: 'PLTS Perikanan',
};

const CATEGORY_ICONS: Record<string, string> = {
    biogas: '🔥',
    plts: '☀️',
    pats: '💧',
    pltmh: '🌊',
    pltb: '💨',
    peternakan_ebt: '🐄',
    plts_rooftop: '🏠',
    plts_perikanan: '🐟',
};

const CATEGORY_COLORS: Record<string, string> = {
    biogas: '#1B8B41',
    plts: '#0A2463',
    pats: '#FDB813',
    pltmh: '#0EA5E9',
    pltb: '#64748B',
    peternakan_ebt: '#8B5E3C',
    plts_rooftop: '#3B82F6',
    plts_perikanan: '#0077b6',
};

const MAP_LEGEND_BY_FILTER: Record<'all' | 'potensi' | 'terbangun', readonly string[]> = {
    all: [
        'peternakan_ebt',
        'plts_rooftop',
        'plts_perikanan',
        'biogas',
        'plts',
        'pats',
        'pltmh',
        'pltb',
    ],
    potensi: ['biogas', 'plts', 'pats', 'pltmh', 'pltb'],
    terbangun: ['biogas', 'plts', 'pats', 'pltmh', 'pltb'],
};

type MapFilter = 'all' | 'potensi' | 'terbangun';

export default function Landing({ downloads, stats }: LandingProps) {
    return (
        <div className="min-h-screen bg-[#F4F7F9] font-sans">
            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A2463]/95 shadow-lg backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDB813]">
                            <Zap className="h-5 w-5 text-[#0A2463]" />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-white tracking-tight">SMART-EBT</span>
                            <span className="ml-2 hidden text-xs text-blue-300 sm:inline">ESDM</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-blue-200 transition hover:text-white"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-lg bg-[#FDB813] px-5 py-2 text-sm font-semibold text-[#0A2463] transition hover:bg-[#fec937] hover:shadow-md"
                        >
                            Daftar
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2463] via-[#1a3a7a] to-[#1B8B41] px-6 py-28 text-white">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#FDB813]/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#1B8B41]/20 blur-3xl" />

                <div className="relative mx-auto max-w-5xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#FDB813]" />
                        Sistem Monitoring EBT — Dinas ESDM Provinsi Jawa Tengah
                    </div>
                    <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                        SMART EBT
                        <span className="text-[#FDB813]">
                            —Sistem Monitoring Aksi dan Rencana Transisi Energi Baru Terbarukan
                        </span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-blue-100">
                        SMART EBT menampilkan informasi Potensi Infrastruktur EBT yang belum terbangun maupun yang sudah
                        terbangun/existing — lengkap dengan pengajuan bantuan dan verifikasi berjenjang.
                    </p>
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Link
                            href="/register"
                            className="group flex items-center gap-2 rounded-xl bg-[#FDB813] px-8 py-3.5 font-bold text-[#0A2463] shadow-lg transition hover:bg-[#fec937] hover:shadow-xl"
                        >
                            Input Potensi EBT
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/login"
                            className="rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                        >
                            Sudah Punya Akun
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="bg-[#0A2463] py-12">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#FDB813]">{stats.total}</div>
                            <div className="mt-1 text-sm text-blue-200">Total Data</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#28A745]">{stats.sudah_intervensi}</div>
                            <div className="mt-1 text-sm text-blue-200">Terverifikasi</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{stats.potensi ?? 0}</div>
                            <div className="mt-1 text-sm text-blue-200">Info Potensi</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{stats.terbangun ?? 0}</div>
                            <div className="mt-1 text-sm text-blue-200">Terbangun</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Input Types ── */}
            <section className="mx-auto max-w-7xl px-6 py-20">
                <div className="mb-12 text-center">
                    <h2 className="mb-3 text-3xl font-bold text-[#0A2463]">
                        Tiga Jenis Input Data EBT
                    </h2>
                    <p className="text-muted-foreground">
                        Pengajuan bantuan, info potensi lokal, dan infrastruktur yang sudah terbangun
                    </p>
                </div>
                <div className="mb-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {[
                        {
                            title: 'Buat Pengajuan',
                            desc: 'Form lengkap bantuan program EBT untuk masyarakat dan organisasi, dengan dokumen pendukung.',
                        },
                        {
                            title: 'Info Potensi Lokal EBT',
                            desc: 'Input ringkas lokasi potensi yang belum terbangun: pengelola, kontak, koordinat, dan foto kondisi.',
                        },
                        {
                            title: 'Infrastruktur Terbangun',
                            desc: 'Data existing Biogas, PLTS, dan PATS — kapasitas terpasang dengan perhitungan bauran energi otomatis.',
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <h3 className="mb-2 font-bold text-[#0A2463]">{item.title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-8 text-center">
                    <h3 className="mb-2 text-xl font-bold text-[#0A2463]">Kategori Buat Pengajuan</h3>
                    <p className="text-sm text-muted-foreground">Program bantuan yang dapat diajukan melalui menu Buat Pengajuan</p>
                </div>
                <div className="mb-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { cat: 'peternakan_ebt', desc: 'Digester Biogas, PLTS, atau BSG untuk kebutuhan peternakan' },
                        { cat: 'plts_rooftop', desc: 'Panel surya atap untuk bangunan permanen & sementara' },
                        { cat: 'plts_perikanan', desc: 'Panel surya atap untuk fasilitas perikanan budidaya' },
                        { cat: 'pats', desc: 'Pompa air berbasis tenaga surya untuk irigasi & pertanian' },
                    ].map(({ cat, desc }) => (
                        <div
                            key={`pengajuan-${cat}`}
                            className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <span className="text-3xl">{CATEGORY_ICONS[cat]}</span>
                                <span
                                    className="h-2.5 w-2.5 rounded-full border border-white shadow-sm"
                                    style={{ background: CATEGORY_COLORS[cat] }}
                                    title="Warna marker di peta"
                                />
                            </div>
                            <h3 className="mb-2 font-bold text-[#0A2463]">{CATEGORY_LABELS[cat]}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-8 text-center">
                    <h3 className="mb-2 text-xl font-bold text-[#0A2463]">Kategori Infrastruktur Terbangun</h3>
                    <p className="text-sm text-muted-foreground">Jenis teknologi existing beserta rumus bauran energi</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {[
                        { cat: 'biogas', desc: 'Digester / biogas terbangun — bauran dihitung dari total kapasitas terpasang' },
                        { cat: 'plts', desc: 'PLTS terbangun — bauran dihitung otomatis dari kapasitas kWp' },
                        { cat: 'pats', desc: 'Pompa air tenaga surya — bauran dihitung dari kapasitas PK' },
                    ].map(({ cat, desc }) => (
                        <div
                            key={`terbangun-${cat}`}
                            className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <span className="text-3xl">{CATEGORY_ICONS[cat]}</span>
                                <span
                                    className="h-2.5 w-2.5 rounded-full border border-white shadow-sm"
                                    style={{ background: CATEGORY_COLORS[cat] }}
                                    title="Warna marker di peta"
                                />
                            </div>
                            <h3 className="mb-2 font-bold text-[#0A2463]">{CATEGORY_LABELS[cat]}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Map ── */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-10 text-center">
                        <div className="mb-3 flex items-center justify-center gap-2 text-[#1B8B41]">
                            <MapPin className="h-5 w-5" />
                            <span className="font-semibold text-sm uppercase tracking-wide">Peta Sebaran</span>
                        </div>
                        <h2 className="mb-3 text-3xl font-bold text-[#0A2463]">Sebaran EBT di Jawa Tengah</h2>
                        <p className="text-muted-foreground">
                            Tampilan potensi (belum terbangun) dan infrastruktur yang sudah terbangun
                        </p>
                    </div>

                    <Suspense fallback={<div className="h-[480px] animate-pulse rounded-2xl bg-gray-100" />}>
                        <MapDataLoader />
                    </Suspense>
                </div>
            </section>

            {/* ── Downloads ── */}
            {downloads.length > 0 && (
                <section className="mx-auto max-w-7xl px-6 py-20">
                    <div className="mb-10 text-center">
                        <div className="mb-3 flex items-center justify-center gap-2 text-[#1B8B41]">
                            <DownloadIcon className="h-5 w-5" />
                            <span className="font-semibold text-sm uppercase tracking-wide">Dokumen</span>
                        </div>
                        <h2 className="mb-3 text-3xl font-bold text-[#0A2463]">Pusat Unduhan</h2>
                        <p className="text-muted-foreground">Template dan dokumen pendukung input data EBT</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {downloads.map((doc) => (
                            <a
                                key={doc.id}
                                href={`/downloads/${doc.id}`}
                                className="group flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A2463]/10 text-[#0A2463] group-hover:bg-[#0A2463] group-hover:text-white transition">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-[#0A2463]">{doc.title}</p>
                                    {doc.description && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">{doc.description}</p>
                                    )}
                                    <p className="mt-1 text-xs text-[#1B8B41]">{doc.original_name}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* ── CTA Footer ── */}
            <section className="bg-gradient-to-r from-[#0A2463] to-[#1B8B41] py-20 text-white">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <h2 className="mb-4 text-3xl font-bold">Siap Input Data EBT?</h2>
                    <p className="mb-8 text-blue-100">
                        Daftar akun untuk mengisi pengajuan, info potensi lokal, atau infrastruktur terbangun secara online.
                    </p>
                    <Link
                        href="/register"
                        className="group inline-flex items-center gap-2 rounded-xl bg-[#FDB813] px-10 py-4 font-bold text-[#0A2463] shadow-lg transition hover:bg-[#fec937] hover:shadow-xl"
                    >
                        Mulai Input Data
                        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-[#0A2463]/10 bg-[#0A2463] py-8 text-center text-sm text-blue-300">
                <p>© {new Date().getFullYear()} SMART-EBT — Kementerian Energi dan Sumber Daya Mineral</p>
                <p className="mt-1 text-xs text-blue-400">Sistem Monitoring Aksi Rencana Transisi Energi Baru Terbarukan</p>
            </footer>
        </div>
    );
}

function MapDataLoader() {
    const [points, setPoints] = useState<MapPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [filter, setFilter] = useState<MapFilter>('all');

    useEffect(() => {
        const controller = new AbortController();

        fetch('/map-data', { signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to load map data');
                }

                return response.json();
            })
            .then((data: MapPoint[]) => {
                setPoints(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                setFailed(true);
                setLoading(false);
            });

        return () => controller.abort();
    }, []);

    const counts = useMemo(() => {
        const byType = (type: EntryTypeValue) =>
            points.filter((point) => point.entry_type === type).length;

        return {
            all: points.length,
            potensi: byType('potensi'),
            terbangun: byType('terbangun'),
        };
    }, [points]);

    const filteredPoints = useMemo(() => {
        if (filter === 'all') {
            return points;
        }

        return points.filter((point) => point.entry_type === filter);
    }, [filter, points]);

    const legendCategories = MAP_LEGEND_BY_FILTER[filter];

    const filters: Array<{
        value: MapFilter;
        label: string;
        description: string;
        icon: typeof Leaf;
        count: number;
    }> = [
        {
            value: 'all',
            label: 'Semua',
            description: 'Gabungan seluruh titik terverifikasi',
            icon: MapPin,
            count: counts.all,
        },
        {
            value: 'potensi',
            label: 'Potensi',
            description: 'Belum terbangun',
            icon: Leaf,
            count: counts.potensi,
        },
        {
            value: 'terbangun',
            label: 'Infrastruktur Terbangun',
            description: 'Sudah terbangun',
            icon: Building2,
            count: counts.terbangun,
        },
    ];

    if (loading) {
        return <div className="h-[480px] animate-pulse rounded-2xl bg-gray-100" />;
    }

    if (failed) {
        return (
            <div className="flex h-[480px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                Peta tidak dapat dimuat. Silakan coba lagi nanti.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                {filters.map((item) => {
                    const Icon = item.icon;
                    const active = filter === item.value;

                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setFilter(item.value)}
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                                active
                                    ? 'border-[#0A2463] bg-[#0A2463] text-white shadow-md'
                                    : 'border-border bg-white text-[#0A2463] hover:border-[#0A2463]/40 hover:bg-muted/40'
                            }`}
                        >
                            <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-[#FDB813]' : 'text-[#1B8B41]'}`} />
                            <span className="min-w-0">
                                <span className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">{item.label}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            active ? 'bg-white/15 text-white' : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {item.count}
                                    </span>
                                </span>
                                <span className={`mt-0.5 block text-xs ${active ? 'text-blue-100' : 'text-muted-foreground'}`}>
                                    {item.description}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {legendCategories.map((cat) => (
                    <div key={cat} className="flex items-center gap-1.5">
                        <div
                            className="h-3 w-3 rounded-full border-2 border-white shadow-sm"
                            style={{ background: CATEGORY_COLORS[cat] }}
                        />
                        <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
                    </div>
                ))}
            </div>

            {filteredPoints.length === 0 ? (
                <div className="flex h-[480px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium text-[#0A2463]">
                        {points.length === 0
                            ? 'Belum ada titik yang diverifikasi'
                            : `Belum ada titik untuk filter ${
                                  filter === 'potensi'
                                      ? 'Potensi'
                                      : filter === 'terbangun'
                                        ? 'Infrastruktur Terbangun'
                                        : 'Semua'
                              }`}
                    </p>
                    <p className="max-w-sm text-xs text-muted-foreground">
                        {points.length === 0
                            ? 'Lokasi yang sudah diverifikasi admin akan muncul di peta ini.'
                            : 'Coba pilih filter lain untuk melihat sebaran yang tersedia.'}
                    </p>
                </div>
            ) : (
                <PublicMap points={filteredPoints} height="480px" />
            )}
        </div>
    );
}
