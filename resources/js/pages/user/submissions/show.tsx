import type { FieldReviews, SubmissionDetail } from '@/types/submission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, setLayoutProps } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, ExternalLink, FileText, MapPin, Pencil } from 'lucide-react';

interface ShowProps {
    submission: SubmissionDetail;
    fields: Record<string, string>;
}

function FieldStatusBadge({ status }: { status: string }) {
    if (status === 'approved') return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
            <CheckCircle className="h-3 w-3" /> Disetujui
        </Badge>
    );
    if (status === 'rejected') return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 gap-1">
            <AlertCircle className="h-3 w-3" /> Ditolak
        </Badge>
    );
    return (
        <Badge variant="outline" className="border-amber-400 text-amber-700 gap-1">
            <Clock className="h-3 w-3" /> Menunggu
        </Badge>
    );
}

export default function SubmissionsShow({ submission, fields }: ShowProps) {
    const reviews: FieldReviews = submission.field_reviews ?? {};
    const isEbtSimple =
        submission.entry_type === 'terbangun' ||
        (submission.entry_type === 'potensi' && !submission.berbadan_hukum);

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Detail', href: `/submissions/${submission.id}` },
        ],
    });

    return (
            <div className="mx-auto max-w-4xl p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                {submission.entryTypeLabel}
                            </h1>
                            {submission.status === 'sudah_intervensi' ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <CheckCircle className="mr-1 h-3 w-3" /> Terverifikasi
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-amber-400 text-amber-700">
                                    <Clock className="mr-1 h-3 w-3" /> Belum Diverifikasi
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            #{submission.id} · {submission.categoryLabel} · {submission.display_name ?? submission.nama_pemohon} · {submission.created_at}
                        </p>
                    </div>
                    <Link href={`/submissions/${submission.id}/edit`}>
                        <Button
                            className={
                                submission.hasRejected
                                    ? 'gap-2 bg-amber-500 hover:bg-amber-600'
                                    : 'gap-2 bg-primary hover:bg-primary/90'
                            }
                        >
                            <Pencil className="h-4 w-4" />
                            {submission.hasRejected ? 'Revisi' : 'Edit Data'}
                        </Button>
                    </Link>
                </div>

                {isEbtSimple && (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                        <div className="border-b border-border px-6 py-4">
                            <h2 className="font-semibold text-foreground">Data Utama</h2>
                        </div>
                        <dl className="divide-y divide-border text-sm">
                            {[
                                ['Lokasi', submission.lokasi],
                                ['Desa', submission.desa],
                                ['Kecamatan', submission.kecamatan],
                                ['Kabupaten', submission.kabupaten],
                                ['Nama Pengelola', submission.nama_pengelola],
                                ['Nama Pemilik/Pemrakarsa', submission.nama_pemilik],
                                ['Penanggung Jawab', submission.penanggung_jawab],
                                ['Kontak Person', submission.kontak_person],
                                ['No. WhatsApp', submission.no_wa],
                                ['Kapasitas', submission.kapasitas != null ? `${submission.kapasitas} ${submission.kapasitasUnit ?? ''}` : null],
                                ['Bauran Energi', submission.bauran_energi != null ? submission.bauran_energi.toLocaleString('id-ID', { maximumFractionDigits: 6 }) : null],
                                ['Sumber Pendanaan', submission.sumber_pendanaan],
                                ['Tahun Pembangunan', submission.tahun_pembangunan],
                            ].filter(([, v]) => v != null && v !== '').map(([label, value]) => (
                                <div key={String(label)} className="grid gap-1 px-6 py-3 sm:grid-cols-3">
                                    <dt className="text-muted-foreground">{label}</dt>
                                    <dd className="font-medium text-foreground sm:col-span-2">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        {submission.foto_kondisi_path && (
                            <div className="border-t border-border px-6 py-4">
                                <a href={submission.foto_kondisi_path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary">
                                    <ExternalLink className="h-4 w-4" /> Lihat foto kondisi
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* Rejection alert */}
                {submission.hasRejected && (
                    <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                        <div>
                            <p className="font-semibold text-red-800">Ada dokumen/data yang perlu direvisi</p>
                            <p className="mt-1 text-sm text-red-700">
                                Beberapa field ditolak oleh admin. Klik tombol "Revisi Pengajuan" untuk memperbaiki dan mengirim ulang.
                            </p>
                        </div>
                    </div>
                )}

                {/* Field Reviews Status */}
                <div className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 font-semibold text-foreground">Status Verifikasi Dokumen</h2>
                    <div className="space-y-3">
                        {Object.entries(fields).map(([key, label]) => {
                            const review = reviews[key];
                            return (
                                <div key={key} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-foreground">{label}</p>
                                        {review?.status === 'rejected' && review.reason && (
                                            <p className="mt-1 text-xs text-red-600">
                                                <AlertCircle className="mr-1 inline h-3 w-3" />
                                                Alasan: {review.reason}
                                            </p>
                                        )}
                                        {/* Show file link if it's a file field */}
                                        {(submission as Record<string, unknown>)[`${key}`] && typeof (submission as Record<string, unknown>)[`${key}`] === 'string' && ((submission as Record<string, unknown>)[`${key}`] as string).startsWith('/storage') && (
                                            <a
                                                href={(submission as Record<string, unknown>)[`${key}`] as string}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-3 w-3" /> Lihat File
                                            </a>
                                        )}
                                    </div>
                                    <FieldStatusBadge status={review?.status ?? 'pending'} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Basic Info */}
                <div className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Informasi Dasar
                    </h2>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[
                            ['Nama Pemohon', submission.nama_pemohon],
                            ['Nomor Identitas', submission.nomor_identitas],
                            ['Nama Ketua', submission.nama_ketua],
                            ['Alamat Organisasi', submission.alamat_organisasi],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs text-muted-foreground">{label}</dt>
                                <dd className="mt-0.5 font-medium text-sm text-foreground">{value ?? '-'}</dd>
                            </div>
                        ))}
                    </dl>

                    {submission.latitude && submission.longitude && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-sm">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">
                                Koordinat: <span className="font-medium text-foreground">{submission.latitude}, {submission.longitude}</span>
                            </span>
                        </div>
                    )}
                    {submission.deskripsi_titik && (
                        <div className="mt-3">
                            <dt className="text-xs text-muted-foreground">Deskripsi Titik</dt>
                            <dd className="mt-0.5 text-sm text-foreground">{submission.deskripsi_titik}</dd>
                        </div>
                    )}
                </div>

                {/* Category Detail */}
                {submission.detail && Object.keys(submission.detail).length > 0 && (
                    <div className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-semibold text-foreground">Detail Kategori</h2>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {Object.entries(submission.detail)
                                .filter(([key]) => !['id', 'submission_id', 'created_at', 'updated_at'].includes(key))
                                .map(([key, value]) => (
                                    <div key={key}>
                                        <dt className="text-xs text-muted-foreground">{fields[key] ?? key.replaceAll('_', ' ')}</dt>
                                        <dd className="mt-0.5 font-medium text-sm text-foreground">
                                            {value === null || value === '' ? '-' : String(value)}
                                        </dd>
                                    </div>
                                ))}
                        </dl>
                    </div>
                )}

                {/* Multi files */}
                {submission.files?.tagihan_listrik?.length > 0 && (
                    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-semibold text-foreground">Tagihan Listrik</h2>
                        <ul className="space-y-2">
                            {submission.files.tagihan_listrik.map((file) => (
                                <li key={file.id}>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        {file.original_name}
                                        {file.periode ? ` (${file.periode})` : ''}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
    );
}
