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
            { title: 'Verifikasi Data', href: '/admin/submissions' },
            { title: `#${submission.id}`, href: `/admin/submissions/${submission.id}` },
        ],
    });

    const handleApproveAll = () => {
        if (confirm('Setujui semua field dan ubah status menjadi Terverifikasi?')) {
            router.patch(`/admin/submissions/${submission.id}/approve-all`);
        }
    };

    const resolveFieldValue = (key: string): unknown => {
        if (key === 'category') {
            return submission.categoryLabel;
        }
        if (key in submission && (submission as Record<string, unknown>)[key] !== undefined) {
            return (submission as Record<string, unknown>)[key];
        }

        return submission.detail?.[key] ?? null;
    };

    return (
        <div className="mx-auto max-w-5xl p-6 lg:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">{submission.entryTypeLabel}</h1>
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
                        #{submission.id} · {submission.categoryLabel} · {submission.created_at} · {submission.user?.name} ({submission.user?.email})
                    </p>
                </div>
                {submission.status !== 'sudah_intervensi' && (
                    <Button onClick={handleApproveAll} className="gap-2 bg-green-600 shadow-sm hover:bg-green-700">
                        <CheckSquare className="h-4 w-4" />
                        Setujui Semua
                    </Button>
                )}
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: 'Nama / Lokasi', value: submission.display_name },
                    { label: 'Kontak', value: submission.kontak_person || submission.no_wa || '-' },
                    { label: 'Kategori', value: submission.categoryLabel },
                    { label: 'Field Disetujui', value: `${Object.values(reviews).filter((r) => r.status === 'approved').length} / ${Object.keys(reviews).length}` },
                ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-semibold text-foreground">Verifikasi Data</h2>
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

                <div className="space-y-4 lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <FileText className="h-4 w-4" /> Foto & Dokumen
                        </h3>
                        <div className="space-y-2">
                            {submission.foto_kondisi_path ? (
                                <a
                                    href={submission.foto_kondisi_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs transition hover:bg-muted"
                                >
                                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />
                                    <span className="font-medium text-foreground">Foto Kondisi Saat Ini</span>
                                </a>
                            ) : (
                                <p className="text-xs text-muted-foreground">Belum ada foto</p>
                            )}
                        </div>
                    </div>

                    {(submission.latitude != null || submission.longitude != null) && (
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <MapPin className="h-4 w-4" /> Koordinat
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {submission.latitude}, {submission.longitude}
                            </p>
                            {submission.bauran_energi != null && (
                                <p className="mt-3 text-sm">
                                    <span className="text-muted-foreground">Bauran Energi: </span>
                                    <span className="font-semibold text-foreground">
                                        {submission.bauran_energi.toLocaleString('id-ID', { maximumFractionDigits: 6 })}
                                    </span>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
