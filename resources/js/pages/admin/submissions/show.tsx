import type { FieldReviews, SubmissionDetail } from '@/types/submission';
import FieldReviewItem from '@/components/admin/field-review-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router, setLayoutProps } from '@inertiajs/react';
import { CheckCircle, CheckSquare, Clock, ExternalLink, FileText, MapPin } from 'lucide-react';

interface AdminSubmissionsShowProps {
    submission: SubmissionDetail;
    fields: Record<string, string>;
}

export default function AdminSubmissionsShow({ submission, fields }: AdminSubmissionsShowProps) {
    const reviews: FieldReviews = submission.field_reviews ?? {};
    const reviewUrl = `/admin/submissions/${submission.id}/field-review`;

    setLayoutProps({
        breadcrumbs: [
            { title: 'Admin', href: '/admin/dashboard' },
            { title: 'Pengajuan', href: '/admin/submissions' },
            { title: `#${submission.id}`, href: `/admin/submissions/${submission.id}` },
        ],
    });

    const handleApproveAll = () => {
        if (confirm('Setujui semua field dan ubah status pengajuan menjadi Terverifikasi?')) {
            router.patch(`/admin/submissions/${submission.id}/approve-all`);
        }
    };

    const resolveFieldValue = (key: string): unknown => {
        if (key in submission && (submission as Record<string, unknown>)[key] !== undefined) {
            return (submission as Record<string, unknown>)[key];
        }

        return submission.detail?.[key] ?? null;
    };

    return (
            <div className="mx-auto max-w-5xl p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <div className="mb-1.5 flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-foreground">{submission.categoryLabel}</h1>
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
                            Pengajuan #{submission.id} · {submission.created_at} · {submission.user?.name} ({submission.user?.email})
                        </p>
                    </div>
                    {submission.status !== 'sudah_intervensi' && (
                        <Button onClick={handleApproveAll} className="gap-2 bg-green-600 hover:bg-green-700 shadow-sm">
                            <CheckSquare className="h-4 w-4" />
                            Setujui Semua
                        </Button>
                    )}
                </div>

                {/* Quick Info */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Nama Pemohon', value: submission.nama_pemohon },
                        { label: 'Nomor Identitas', value: submission.nomor_identitas },
                        { label: 'Nama Ketua', value: submission.nama_ketua },
                        { label: 'Field Disetujui', value: `${Object.values(reviews).filter(r => r.status === 'approved').length} / ${Object.keys(reviews).length}` },
                    ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className="mt-0.5 font-semibold text-sm text-foreground">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Field Reviews */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 font-semibold text-foreground">Verifikasi Dokumen & Data</h2>
                            <div className="space-y-3">
                                {Object.entries(fields).map(([key, label]) => (
                                    <FieldReviewItem
                                        key={key}
                                        fieldKey={key}
                                        label={label}
                                        review={reviews[key] ?? { status: 'pending', reason: null }}
                                        reviewUrl={reviewUrl}
                                        value={resolveFieldValue(key)}
                                        files={key === 'tagihan_listrik' ? submission.files?.tagihan_listrik : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Info Sidebar */}
                    <div className="space-y-4 lg:col-span-2">
                        {/* Documents */}
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                            <h3 className="mb-3 font-semibold text-sm text-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Dokumen Terunggah
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { key: 'surat_permohonan_proposal_path', label: 'Surat Permohonan' },
                                    { key: 'dokumen_kepengurusan_path', label: 'Dok. Kepengurusan' },
                                    { key: 'dokumen_sk_kemenkumham_path', label: 'SK Kemenkumham' },
                                    { key: 'surat_keterangan_desa_path', label: 'Surat Ket. Desa' },
                                ].map(({ key, label }) => {
                                    const url = (submission as Record<string, unknown>)[key] as string | null;
                                    return url ? (
                                        <a
                                            key={key}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs transition hover:bg-muted"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />
                                            <span className="font-medium text-foreground">{label}</span>
                                        </a>
                                    ) : null;
                                })}

                                {/* Multi-file tagihan */}
                                {submission.files?.tagihan_listrik?.map((f) => (
                                    <a
                                        key={f.id}
                                        href={f.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs transition hover:bg-muted"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />
                                        <div>
                                            <span className="font-medium text-foreground">Tagihan Listrik</span>
                                            {f.periode && <span className="ml-1 text-muted-foreground">({f.periode})</span>}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Coordinate */}
                        {submission.latitude && submission.longitude && (
                            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                                <h3 className="mb-3 font-semibold text-sm text-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Koordinat Lokasi
                                </h3>
                                <div className="text-xs text-muted-foreground">
                                    <p>Lat: <span className="font-medium text-foreground">{submission.latitude}</span></p>
                                    <p className="mt-1">Lng: <span className="font-medium text-foreground">{submission.longitude}</span></p>
                                </div>
                                <a
                                    href={`https://maps.google.com/?q=${submission.latitude},${submission.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" /> Buka di Google Maps
                                </a>
                                {submission.deskripsi_titik && (
                                    <p className="mt-3 text-xs text-muted-foreground">{submission.deskripsi_titik}</p>
                                )}
                            </div>
                        )}

                        {/* Alamat */}
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                            <h3 className="mb-2 font-semibold text-sm text-foreground">Alamat Organisasi</h3>
                            <p className="text-sm text-muted-foreground">{submission.alamat_organisasi}</p>
                        </div>
                    </div>
                </div>

                {/* Approve All CTA bottom */}
                {submission.status !== 'sudah_intervensi' && (
                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleApproveAll} className="gap-2 bg-green-600 hover:bg-green-700 shadow-md px-8">
                            <CheckSquare className="h-4 w-4" />
                            Setujui Semua Field & Verifikasi Pengajuan
                        </Button>
                    </div>
                )}
            </div>
    );
}
