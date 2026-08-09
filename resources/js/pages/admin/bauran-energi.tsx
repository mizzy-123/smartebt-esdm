import {
    Bar,
    BarChart,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Building2, Flame, Layers } from 'lucide-react';
import type { BauranEnergiItem } from '@/types/submission';
import { index as bauranEnergiIndex } from '@/routes/admin/bauran-energi';

interface BauranEnergiPageProps {
    perItem: BauranEnergiItem[];
    totalBauran: number;
    totalUnit: number;
}

const COLORS = ['#1B8B41', '#0A2463', '#FDB813'];

function formatBauran(value: number): string {
    return value.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
    });
}

export default function AdminBauranEnergi({ perItem, totalBauran, totalUnit }: BauranEnergiPageProps) {
    const chartData = perItem.map((item) => ({
        ...item,
        name: item.label,
    }));

    return (
        <div className="p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Bauran Energi</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Total bauran energi dari infrastruktur EBT yang sudah terbangun, dihitung per kategori.
                </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Flame className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{formatBauran(totalBauran)}</p>
                            <p className="text-xs text-muted-foreground">Total Bauran Energi</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                            <Building2 className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{totalUnit}</p>
                            <p className="text-xs text-muted-foreground">Unit Terbangun</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <Layers className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{perItem.length}</p>
                            <p className="text-xs text-muted-foreground">Kategori Terbangun</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-1 text-sm font-semibold text-foreground">Total Bauran per Kategori</h3>
                    <p className="mb-4 text-xs text-muted-foreground">Jumlah bauran energi dari data infrastruktur terbangun</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                                formatter={(value: number) => [formatBauran(Number(value)), 'Bauran Energi']}
                            />
                            <Bar dataKey="total_bauran" radius={[6, 6, 0, 0]}>
                                {chartData.map((_, index) => (
                                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-1 text-sm font-semibold text-foreground">Proporsi Bauran</h3>
                    <p className="mb-4 text-xs text-muted-foreground">Persentase kontribusi tiap kategori</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={chartData.filter((item) => item.total_bauran > 0)}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                dataKey="total_bauran"
                                nameKey="label"
                                paddingAngle={3}
                            >
                                {chartData
                                    .filter((item) => item.total_bauran > 0)
                                    .map((item, index) => (
                                        <Cell key={item.category} fill={COLORS[index % COLORS.length]} />
                                    ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                                formatter={(value: number) => [formatBauran(Number(value)), 'Bauran Energi']}
                            />
                            <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    {totalBauran === 0 && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                            Belum ada data bauran dari infrastruktur terbangun.
                        </p>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-6 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Rincian per Item</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Kategori</th>
                                <th className="px-6 py-3 font-medium">Jumlah Unit</th>
                                <th className="px-6 py-3 font-medium">Total Bauran Energi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {perItem.map((item) => (
                                <tr key={item.category}>
                                    <td className="px-6 py-3 font-medium text-foreground">{item.label}</td>
                                    <td className="px-6 py-3 text-foreground">{item.jumlah}</td>
                                    <td className="px-6 py-3 text-foreground">{formatBauran(item.total_bauran)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t border-border bg-muted/20 font-semibold">
                            <tr>
                                <td className="px-6 py-3">Total</td>
                                <td className="px-6 py-3">{totalUnit}</td>
                                <td className="px-6 py-3">{formatBauran(totalBauran)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

AdminBauranEnergi.layout = {
    breadcrumbs: [{ title: 'Bauran Energi', href: bauranEnergiIndex.url() }],
};
