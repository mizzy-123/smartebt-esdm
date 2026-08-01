import type { FieldReviews, SubmissionDetail } from '@/types/submission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, setLayoutProps } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, ExternalLink, MapPin, Pencil } from 'lucide-react';

interface ShowProps {
    submission: SubmissionDetail;
    fields: Record<string, string>;
}

function FieldStatusBadge({ status }: { status: string }) {
    if (status === 'approved') {
        return (
            <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="h-3 w-3" /> Disetujui
            </Badge>
        );
    }
    if (status === 'rejected') {
        return (
            <Badge className="gap-1 bg-red-100 text-red-800 hover:bg-red-100">
                <AlertCircle className="h-3 w-3" /> Ditolak
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="gap-1 border-amber-400 text-amber-700">
            <Clock className="h-3 w-3" /> Menunggu
        </Badge>
    );
}

const PENDANAAN_LABELS: Record<string, string> = {
    pemerintah: 'Pemerintah (APBD/APBN)',
    mandiri: 'Mandiri (Perusahaan/Pihak ke-3)',
    kerjasama: 'Kerjasama',
};

export default function SubmissionsShow({ submission, fields }: ShowProps) {
    const reviews: FieldReviews = submission.field_reviews ?? {};

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Detail', href: `/submissions/${submission.id}` },
        ],
    });

    const rows: { key: string; label: string; value: React.ReactNode }[] = [
        { key: 'entry_type', label: 'Jenis Data', value: submission.entryTypeLabel },
        { key: 'category', label: 'Kategori', value: submission.categoryLabel },
        { key: 'lokasi', label: 'Lokasi', value: submission.lokasi },
        { key: 'desa', label: 'Desa', value: submission.desa },
        { key: 'kecamatan', label: 'Kecamatan', value: submission.kecamatan },
        { key: 'kabupaten', label: 'Kabupaten', value: submission.kabupaten },
        { key: 'nama_pengelola', label: 'Nama Pengelola', value: submission.nama_pengelola },
        { key: 'nama_pemilik', label: 'Nama Pemilik/Pemrakarsa', value: submission.nama_pemilik },
        { key: 'penanggung_jawab', label: 'Penanggung Jawab', value: submission.penanggung_jawab },
        { key: 'kontak_person', label: 'Kontak Person', value: submission.kontak_person },
        { key: 'no_wa', label: 'No. WhatsApp', value: submission.no_wa },
        {
            key: 'kapasitas',
            label: `Kapasitas${submission.kapasitasUnit ? ` (${submission.kapasitasUnit})` : ''}`,
            value: submission.kapasitas,
        },
        {
            key: 'bauran_energi',
            label: 'Bauran Energi',
            value: submission.bauran_energi != null
                ? submission.bauran_energi.toLocaleString('id-ID', { maximumFractionDigits: 6 })
                : null,
        },
        {
            key: 'sumber_pendanaan',
            label: 'Sumber Pendanaan',
            value: submission.sumber_pendanaan
                ? PENDANAAN_LABELS[submission.sumber_pendanaan] ?? submission.sumber_pendanaan
                : null,
        },
        { key: 'sumber_pendanaan_detail', label: 'Detail Pendanaan', value: submission.sumber_pendanaan_detail },
        { key: 'tahun_pembangunan', label: 'Tahun Pembangunan', value: submission.tahun_pembangunan },
        { key: 'deskripsi_titik', label: 'Deskripsi Titik', value: submission.deskripsi_titik },
    ].filter((row) => row.value !== null && row.value !== undefined && row.value !== '');

    return (
        <div className="mx-auto max-w-4xl p-6 lg:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">{submission.entryTypeLabel}</h1>
                        {submission.status === 'sudah_intervensi' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <CheckCircle className="mr-1 h-3 w-3" /> Terverifikasi
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="border-amber-400 text-amber-700">
                                <Clock className="mr-1 h-3 w-3" /> Menunggu Verifikasi
                            </Badge>
                        )}
                        {submission.hasRejected && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                <AlertCircle className="mr-1 h-3 w-3" /> Perlu Revisi
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {submission.display_name} · {submission.categoryLabel} · {submission.created_at}
                    </p>
                </div>
                {submission.hasRejected && (
                    <Link href={`/submissions/${submission.id}/edit`}>
                        <Button className="gap-2 bg-primary hover:bg-primary/90">
                            <Pencil className="h-4 w-4" /> Revisi
                        </Button>
                    </Link>
                )}
            </div>

            <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                <div className="border-b border-border px-6 py-4">
                    <h2 className="font-semibold text-foreground">Data Utama</h2>
                </div>
                <dl className="divide-y divide-border">
                    {rows.map((row) => (
                        <div key={row.key} className="grid gap-1 px-6 py-3 sm:grid-cols-3">
                            <dt className="text-sm text-muted-foreground">{row.label}</dt>
                            <dd className="text-sm font-medium text-foreground sm:col-span-2">{row.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            {(submission.latitude != null || submission.longitude != null) && (
                <div className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <h2 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                        <MapPin className="h-4 w-4" /> Koordinat
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {submission.latitude}, {submission.longitude}
                    </p>
                </div>
            )}

            {submission.foto_kondisi_path && (
                <div className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <h2 className="mb-3 font-semibold text-foreground">Foto Kondisi</h2>
                    <a href={submission.foto_kondisi_path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary">
                        <ExternalLink className="h-4 w-4" /> Lihat foto
                    </a>
                    <img src={submission.foto_kondisi_path} alt="Foto kondisi" className="mt-3 max-h-72 rounded-xl border object-cover" />
                </div>
            )}

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-semibold text-foreground">Status Verifikasi Field</h2>
                <div className="space-y-2">
                    {Object.entries(fields).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                            <span className="text-sm text-foreground">{label}</span>
                            <FieldStatusBadge status={reviews[key]?.status ?? 'pending'} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
