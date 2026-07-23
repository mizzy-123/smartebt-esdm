import type { AdminStats, ChartCategory } from '@/types/submission';
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

interface StatChartProps {
    stats: AdminStats;
    perKategori: ChartCategory[];
    perKategoriBelum: ChartCategory[];
}

const COLORS = ['#1B8B41', '#0A2463', '#FDB813', '#0077b6'];

export default function StatChart({ stats, perKategori, perKategoriBelum }: StatChartProps) {
    const statusData = [
        { name: 'Belum Diverifikasi', value: stats.belum, color: '#FDB813' },
        { name: 'Terverifikasi', value: stats.sudah, color: '#1B8B41' },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Bar Chart: Per Kategori */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-sm text-foreground">Pengajuan per Kategori</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={perKategori} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v: string) => v.split(' ').slice(0, 2).join(' ')}
                        />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: 8, fontSize: 12 }}
                            formatter={(value: number) => [value, 'Pengajuan']}
                        />
                        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                            {perKategori.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Pie Chart: Status */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-sm text-foreground">Status Verifikasi</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            paddingAngle={3}
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: 8, fontSize: 12 }}
                            formatter={(value: number) => [value, 'Pengajuan']}
                        />
                        <Legend
                            iconType="circle"
                            iconSize={10}
                            wrapperStyle={{ fontSize: 12 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-xs text-muted-foreground mt-2">
                    Total: <span className="font-semibold text-foreground">{stats.total}</span> pengajuan
                </p>
            </div>
        </div>
    );
}
