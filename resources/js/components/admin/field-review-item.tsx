import type { FieldReview } from '@/types/submission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { CheckCircle, Clock, ExternalLink, XCircle } from 'lucide-react';
import { useState } from 'react';

interface FieldReviewItemProps {
    fieldKey: string;
    label: string;
    review: FieldReview;
    reviewUrl: string;
    value?: unknown;
    files?: { id: number; url: string; original_name: string; periode: string | null }[];
}

export default function FieldReviewItem({ fieldKey, label, review, reviewUrl, value, files }: FieldReviewItemProps) {
    const { data, setData, patch, processing } = useForm({
        field_key: fieldKey,
        status: '' as 'approved' | 'rejected' | '',
        reason: review.reason ?? '',
    });
    const [showRejectForm, setShowRejectForm] = useState(review.status === 'rejected');

    const handleApprove = () => {
        patch(reviewUrl, {
            data: { field_key: fieldKey, status: 'approved', reason: null },
            preserveScroll: true,
        });
    };

    const handleReject = () => {
        if (!data.reason.trim()) {
            setShowRejectForm(true);
            return;
        }

        patch(reviewUrl, {
            data: { field_key: fieldKey, status: 'rejected', reason: data.reason },
            preserveScroll: true,
        });
    };

    const statusIcon = {
        pending: <Clock className="h-4 w-4 text-amber-500" />,
        approved: <CheckCircle className="h-4 w-4 text-green-600" />,
        rejected: <XCircle className="h-4 w-4 text-red-500" />,
    }[review.status];

    const statusBadge = {
        pending: <Badge variant="outline" className="border-amber-400 text-amber-700">Menunggu</Badge>,
        approved: <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disetujui</Badge>,
        rejected: <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ditolak</Badge>,
    }[review.status];

    const displayValue = (() => {
        if (files && files.length > 0) {
            return (
                <ul className="mt-1 space-y-1">
                    {files.map((file) => (
                        <li key={file.id}>
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                <ExternalLink className="h-3 w-3" />
                                {file.original_name}
                            </a>
                        </li>
                    ))}
                </ul>
            );
        }

        if (typeof value === 'string' && value.startsWith('/storage')) {
            return (
                <a href={value} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> Lihat File
                </a>
            );
        }

        if (value === null || value === undefined || value === '') {
            return <p className="mt-1 text-xs text-muted-foreground">Tidak ada nilai</p>;
        }

        return <p className="mt-1 text-sm text-foreground">{String(value)}</p>;
    })();

    return (
        <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        {statusIcon}
                        <span className="text-sm font-medium">{label}</span>
                        {statusBadge}
                    </div>
                    {displayValue}
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button
                        size="sm"
                        variant={review.status === 'approved' ? 'default' : 'outline'}
                        className={review.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-700 hover:bg-green-50'}
                        disabled={processing}
                        onClick={handleApprove}
                    >
                        <CheckCircle className="mr-1 h-3.5 w-3.5" />
                        ACC
                    </Button>
                    <Button
                        size="sm"
                        variant={review.status === 'rejected' ? 'destructive' : 'outline'}
                        className={review.status !== 'rejected' ? 'border-red-500 text-red-600 hover:bg-red-50' : ''}
                        disabled={processing}
                        onClick={() => setShowRejectForm(true)}
                    >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Tolak
                    </Button>
                </div>
            </div>

            {showRejectForm && (
                <div className="mt-3 space-y-1.5">
                    <Label htmlFor={`reason-${fieldKey}`} className="text-xs text-muted-foreground">
                        Alasan Penolakan <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id={`reason-${fieldKey}`}
                        value={data.reason}
                        onChange={(e) => setData('reason', e.target.value)}
                        placeholder="Tuliskan alasan penolakan untuk pemohon..."
                        rows={2}
                        className="text-sm"
                    />
                    <Button size="sm" variant="destructive" disabled={processing || !data.reason.trim()} onClick={handleReject}>
                        Simpan Penolakan
                    </Button>
                </div>
            )}
        </div>
    );
}
