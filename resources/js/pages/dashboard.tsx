import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, Building2, CheckCircle, Clock, FileText, Leaf, List, Pencil, Plus, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import {
    create,
    edit as editSubmission,
    show as showSubmission,
} from '@/routes/submissions';
import type { SubmissionListItem } from '@/types/submission';

interface DashboardProps {
    submissions: SubmissionListItem[];
    filters?: { entry_type?: string | null };
}

const LIST_TITLES: Record<string, string> = {
    potensi: 'Daftar Info Potensi',
    terbangun: 'Daftar Infrastruktur Terbangun',
    potensi_berbadan_hukum: 'Daftar Potensi Berbadan Hukum',
};

export default function Dashboard({ submissions, filters = {} }: DashboardProps) {
    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const entryTypeFilter = filters.entry_type ?? null;
    const listTitle = entryTypeFilter
        ? (LIST_TITLES[entryTypeFilter] ?? 'Daftar Pengajuan')
        : 'Daftar Pengajuan';

    return (
        <>
            <Head title="Dashboard" />
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Selamat datang, {auth.user.name}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola pengajuan, potensi lokal, dan infrastruktur terbangun Anda
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={create.url()}>
                            <Button className="gap-2 bg-primary shadow-sm hover:bg-primary/90">
                                <Plus className="h-4 w-4" />
                                Potensi Berbadan Hukum
                            </Button>
                        </Link>
                        <Link href={dashboard.url({ query: { entry_type: 'potensi' } })}>
                            <Button
                                variant={entryTypeFilter === 'potensi' ? 'default' : 'outline'}
                                className="gap-2"
                            >
                                <Leaf className="h-4 w-4" />
                                Info Potensi
                            </Button>
                        </Link>
                        <Link href={dashboard.url({ query: { entry_type: 'terbangun' } })}>
                            <Button
                                variant={entryTypeFilter === 'terbangun' ? 'default' : 'outline'}
                                className="gap-2"
                            >
                                <Building2 className="h-4 w-4" />
                                Terbangun
                            </Button>
                        </Link>
                        {entryTypeFilter && (
                            <Link href={dashboard.url()}>
                                <Button variant="secondary" className="gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    Tampilkan Semua
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {entryTypeFilter && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                            <List className="h-4 w-4 text-primary" />
                            <span>
                                Sedang menampilkan: <strong>{listTitle.replace('Daftar ', '')}</strong>
                            </span>
                        </div>
                        <Link href={dashboard.url()}>
                            <Button size="sm" variant="outline" className="gap-2 bg-white">
                                <RotateCcw className="h-3.5 w-3.5" />
                                Kembali ke Default
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Stats row */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{submissions.length}</p>
                                <p className="text-xs text-muted-foreground">Total Pengajuan</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {submissions.filter((s) => s.status === 'sudah_intervensi').length}
                                </p>
                                <p className="text-xs text-muted-foreground">Terverifikasi</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-2 rounded-xl border border-border bg-white p-5 shadow-sm sm:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {submissions.filter((s) => s.status === 'belum_intervensi').length}
                                </p>
                                <p className="text-xs text-muted-foreground">Menunggu Verifikasi</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submissions Table */}
                {submissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-white py-16 text-center">
                        <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
                        <h3 className="mb-2 font-semibold text-foreground">
                            {entryTypeFilter ? `Belum ada data ${listTitle.replace('Daftar ', '').toLowerCase()}` : 'Belum ada pengajuan'}
                        </h3>
                        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                            {entryTypeFilter
                                ? 'Belum ada data untuk filter ini. Anda bisa kembali ke semua pengajuan atau input data baru dari menu samping.'
                                : 'Mulai ajukan bantuan program EBT untuk organisasi atau usaha Anda.'}
                        </p>
                        {entryTypeFilter ? (
                            <Link href={dashboard.url()}>
                                <Button variant="outline" className="gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    Kembali ke Default
                                </Button>
                            </Link>
                        ) : (
                            <Link href={create.url()}>
                                <Button className="gap-2 bg-primary">
                                    <Plus className="h-4 w-4" />
                                    Input Data Pertama
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                        <div className="border-b border-border px-6 py-4">
                            <h2 className="font-semibold text-foreground">{listTitle}</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Jenis</th>
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Kategori</th>
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Nama / Lokasi</th>
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                                        <th className="px-6 py-3 text-right font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {submissions.map((submission) => (
                                        <tr key={submission.id} className="transition hover:bg-muted/30">
                                            <td className="px-6 py-4 text-muted-foreground text-xs">
                                                {submission.entryTypeLabel ?? 'Pengajuan'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-foreground">{submission.categoryLabel}</span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {submission.display_name ?? submission.nama_pemohon}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {submission.status === 'sudah_intervensi' ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                            {submission.statusLabel}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-amber-400 text-amber-700">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            {submission.statusLabel}
                                                        </Badge>
                                                    )}
                                                    {submission.hasRejected && (
                                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100" title="Ada field yang ditolak">
                                                            <AlertCircle className="mr-1 h-3 w-3" />
                                                            Perlu Revisi
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{submission.created_at}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={showSubmission.url(submission.id)}>
                                                        <Button size="sm" variant="outline">Detail</Button>
                                                    </Link>
                                                    <Link href={editSubmission.url(submission.id)}>
                                                        <Button size="sm" className="gap-1 bg-primary text-white hover:bg-primary/90">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            {submission.hasRejected ? 'Revisi' : 'Edit'}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
