import type { AdminStats, ChartCategory } from '@/types/submission';
import StatChart from '@/components/admin/stat-chart';
import { CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
    stats: AdminStats;
    perKategori: ChartCategory[];
    perKategoriBelum: ChartCategory[];
}

export default function AdminDashboard({ stats, perKategori, perKategoriBelum }: AdminDashboardProps) {
    return (
        <div className="p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
                <p className="mt-1 text-sm text-muted-foreground">Ringkasan pengajuan bantuan EBT</p>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.belum}</p>
                            <p className="text-xs text-muted-foreground">Belum Diverifikasi</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.sudah}</p>
                            <p className="text-xs text-muted-foreground">Terverifikasi</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                            <TrendingUp className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {stats.total > 0 ? Math.round((stats.sudah / stats.total) * 100) : 0}%
                            </p>
                            <p className="text-xs text-muted-foreground">Tingkat Verifikasi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <StatChart stats={stats} perKategori={perKategori} perKategoriBelum={perKategoriBelum} />
        </div>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Admin Dashboard', href: '/admin/dashboard' }],
};
