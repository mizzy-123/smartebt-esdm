import type { SubmissionListItem } from '@/types/submission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, Filter, Search } from 'lucide-react';
import { useState } from 'react';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    meta: { current_page: number; last_page: number; total: number; per_page: number };
}

interface AdminSubmissionsIndexProps {
    submissions: Paginated<SubmissionListItem>;
    filters: { status?: string; category?: string; search?: string };
}

export default function AdminSubmissionsIndex({ submissions, filters }: AdminSubmissionsIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (overrides: Record<string, string | undefined>) => {
        router.get('/admin/submissions', { ...filters, ...overrides }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Daftar Pengajuan</h1>
                        <p className="text-sm text-muted-foreground">{submissions.meta?.total ?? 0} total pengajuan</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
                            placeholder="Cari nama pemohon..."
                            className="pl-9"
                        />
                    </div>
                    <Select value={filters.status ?? ''} onValueChange={v => applyFilter({ status: v || undefined })}>
                        <SelectTrigger className="w-48">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Semua Status</SelectItem>
                            <SelectItem value="belum_intervensi">Belum Diverifikasi</SelectItem>
                            <SelectItem value="sudah_intervensi">Terverifikasi</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.category ?? ''} onValueChange={v => applyFilter({ category: v || undefined })}>
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Semua Kategori</SelectItem>
                            <SelectItem value="peternakan_ebt">Peternakan EBT</SelectItem>
                            <SelectItem value="plts_rooftop">PLTS Rooftop</SelectItem>
                            <SelectItem value="plts_perikanan">PLTS Perikanan</SelectItem>
                            <SelectItem value="pats">PATS</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">#</th>
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Pemohon</th>
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Kategori</th>
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                                    <th className="px-5 py-3 text-right font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {submissions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                                            Tidak ada pengajuan ditemukan
                                        </td>
                                    </tr>
                                )}
                                {submissions.data.map((sub) => (
                                    <tr key={sub.id} className="transition hover:bg-muted/30">
                                        <td className="px-5 py-4 text-muted-foreground text-xs">{sub.id}</td>
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-foreground">{sub.nama_pemohon}</p>
                                            <p className="text-xs text-muted-foreground">{sub.user?.email}</p>
                                        </td>
                                        <td className="px-5 py-4 text-foreground">{sub.categoryLabel}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {sub.status === 'sudah_intervensi' ? (
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        <CheckCircle className="mr-1 h-3 w-3" /> {sub.statusLabel}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-amber-400 text-amber-700">
                                                        <Clock className="mr-1 h-3 w-3" /> {sub.statusLabel}
                                                    </Badge>
                                                )}
                                                {sub.hasRejected && (
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                                        <AlertCircle className="h-3 w-3" />
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">{sub.created_at}</td>
                                        <td className="px-5 py-4 text-right">
                                            <Link href={`/admin/submissions/${sub.id}`}>
                                                <Button size="sm" variant="outline">Verifikasi</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {submissions.links && submissions.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-border px-5 py-3">
                            <p className="text-xs text-muted-foreground">
                                Halaman {submissions.meta?.current_page} dari {submissions.meta?.last_page}
                            </p>
                            <div className="flex gap-1">
                                {submissions.links.filter(l => l.label !== '&laquo; Previous' && l.label !== 'Next &raquo;').map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveState
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : link.url
                                                ? 'hover:bg-muted text-foreground'
                                                : 'text-muted-foreground cursor-not-allowed'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
    );
}

AdminSubmissionsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Daftar Pengajuan', href: '/admin/submissions' },
    ],
};
