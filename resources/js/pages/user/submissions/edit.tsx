import { setLayoutProps, useForm } from '@inertiajs/react';
import { AlertCircle, Loader2, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SubmissionDetail } from '@/types/submission';

interface EditProps {
    submission: SubmissionDetail;
    fields: Record<string, string>;
    rejectedFields: string[];
}

const FILE_FIELDS = [
    'surat_permohonan_proposal_path',
    'dokumen_kepengurusan_path',
    'dokumen_sk_kemenkumham_path',
    'surat_keterangan_desa_path',
    'tagihan_listrik',
];

const TEXTAREA_FIELDS = [
    'deskripsi_titik',
    'alamat_organisasi',
    'kondisi_lokasi',
    'potensi_bayangan',
    'data_pelanggan',
    'ketersediaan_lahan',
    'komitmen_pengelolaan',
];

function initialValue(submission: SubmissionDetail, key: string): string {
    const record = submission as unknown as Record<string, unknown>;
    const value = record[key];

    if (value == null) {
        return '';
    }

    if (typeof value === 'boolean') {
        return value ? '1' : '0';
    }

    return String(value);
}

export default function SubmissionsEdit({
    submission,
    fields,
    rejectedFields,
}: EditProps) {
    const hasRejected = rejectedFields.length > 0;
    const editableFields = hasRejected
        ? rejectedFields
        : Object.keys(fields).filter((key) => key !== 'bauran_energi');

    const { data, setData, post, processing, errors } = useForm<
        Record<string, string | File | null>
    >({
        _method: 'PUT',
        ...Object.fromEntries(
            editableFields.map((key) => [
                key,
                FILE_FIELDS.includes(key) ? null : initialValue(submission, key),
            ]),
        ),
    });

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Detail', href: `/submissions/${submission.id}` },
            {
                title: hasRejected ? 'Revisi' : 'Edit',
                href: `/submissions/${submission.id}/edit`,
            },
        ],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/submissions/${submission.id}`, { forceFormData: true });
    };

    return (
        <div className="mx-auto max-w-2xl p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">
                    {hasRejected ? 'Revisi Pengajuan' : 'Edit Pengajuan'}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {hasRejected
                        ? 'Perbaiki field yang ditolak oleh admin, lalu kirim ulang.'
                        : 'Perbaiki data pengajuan yang salah, lalu simpan.'}
                </p>
            </div>

            {hasRejected && (
                <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                        <p className="font-semibold text-amber-800">
                            Field yang perlu direvisi:
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {rejectedFields.map((key) => (
                                <Badge
                                    key={key}
                                    className="bg-red-100 text-red-800 hover:bg-red-100"
                                >
                                    {fields[key] ?? key}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-sm"
            >
                {editableFields.map((key) => {
                    const review = submission.field_reviews?.[key];
                    const isFile = FILE_FIELDS.includes(key);
                    const label = fields[key] ?? key;

                    return (
                        <div key={key} className="space-y-2">
                            <div>
                                <Label>
                                    {label}{' '}
                                    {hasRejected && (
                                        <span className="text-destructive">*</span>
                                    )}
                                </Label>
                                {review?.reason && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        <AlertCircle className="mr-1 inline h-3 w-3" />
                                        Alasan penolakan: {review.reason}
                                    </p>
                                )}
                            </div>

                            {isFile ? (
                                <div className="space-y-2">
                                    <label
                                        htmlFor={key}
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-2.5 text-sm transition hover:bg-muted"
                                    >
                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {key === 'tagihan_listrik'
                                                ? (
                                                      data[key] as unknown as
                                                          | File[]
                                                          | undefined
                                                  )?.length
                                                    ? `${(data[key] as unknown as File[]).length} file dipilih`
                                                    : 'Upload file pengganti (bisa banyak)'
                                                : ((data[key] as File | null)
                                                      ?.name ??
                                                  'Upload file pengganti (PDF/JPG/PNG, max 5MB)')}
                                        </span>
                                    </label>
                                    <input
                                        id={key}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        multiple={key === 'tagihan_listrik'}
                                        onChange={(e) => {
                                            if (key === 'tagihan_listrik') {
                                                setData(
                                                    key,
                                                    Array.from(
                                                        e.target.files ?? [],
                                                    ) as unknown as string,
                                                );
                                            } else {
                                                setData(
                                                    key,
                                                    e.target.files?.[0] ?? null,
                                                );
                                            }
                                        }}
                                    />
                                </div>
                            ) : TEXTAREA_FIELDS.includes(key) ? (
                                <Textarea
                                    value={(data[key] as string) ?? ''}
                                    onChange={(e) =>
                                        setData(key, e.target.value)
                                    }
                                    rows={3}
                                />
                            ) : (
                                <Input
                                    value={(data[key] as string) ?? ''}
                                    onChange={(e) =>
                                        setData(key, e.target.value)
                                    }
                                />
                            )}
                            {errors[key] && (
                                <p className="text-xs text-destructive">
                                    {errors[key]}
                                </p>
                            )}
                        </div>
                    );
                })}

                <div className="flex gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="flex-1 gap-2 bg-primary"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />{' '}
                                Menyimpan...
                            </>
                        ) : hasRejected ? (
                            'Kirim Revisi'
                        ) : (
                            'Simpan Perubahan'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => history.back()}
                    >
                        Batal
                    </Button>
                </div>
            </form>
        </div>
    );
}
