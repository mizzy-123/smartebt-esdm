import type { CategoryOption, SubmissionDetail } from '@/types/submission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { calculateBauranEnergi } from '@/lib/bauran-energi';
import { router, setLayoutProps, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

interface EditProps {
    submission: SubmissionDetail;
    fields: Record<string, string>;
    rejectedFields: string[];
    categories: CategoryOption[];
}

export default function SubmissionsEdit({ submission, fields, rejectedFields, categories }: EditProps) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Revisi', href: `/submissions/${submission.id}/edit` },
        ],
    });

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        entry_type: submission.entry_type,
        category: submission.category ?? '',
        lokasi: submission.lokasi ?? '',
        desa: submission.desa ?? '',
        kecamatan: submission.kecamatan ?? '',
        kabupaten: submission.kabupaten ?? '',
        nama_pengelola: submission.nama_pengelola ?? '',
        kontak_person: submission.kontak_person ?? '',
        no_wa: submission.no_wa ?? '',
        foto_kondisi: null as File | null,
        nama_pemilik: submission.nama_pemilik ?? '',
        penanggung_jawab: submission.penanggung_jawab ?? '',
        kapasitas: submission.kapasitas != null ? String(submission.kapasitas) : '',
        sumber_pendanaan: submission.sumber_pendanaan ?? '',
        sumber_pendanaan_detail: submission.sumber_pendanaan_detail ?? '',
        tahun_pembangunan: submission.tahun_pembangunan != null ? String(submission.tahun_pembangunan) : '',
        latitude: submission.latitude != null ? String(submission.latitude) : '',
        longitude: submission.longitude != null ? String(submission.longitude) : '',
        deskripsi_titik: submission.deskripsi_titik ?? '',
    });

    const isRejected = (key: string) => rejectedFields.includes(key);
    const bauranPreview = calculateBauranEnergi(data.category, data.kapasitas);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/submissions/${submission.id}`, { forceFormData: true });
    };

    return (
        <div className="mx-auto max-w-3xl p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Revisi Data</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Perbaiki field yang ditolak admin, lalu kirim ulang.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
                {Object.entries(fields)
                    .filter(([key]) => isRejected(key) || (key === 'bauran_energi' && isRejected('kapasitas')))
                    .map(([key, label]) => {
                        if (key === 'bauran_energi') {
                            return (
                                <div key={key} className="space-y-1.5">
                                    <Label>{label} (otomatis)</Label>
                                    <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                                        {bauranPreview ?? '—'}
                                    </div>
                                </div>
                            );
                        }

                        if (key === 'foto_kondisi_path') {
                            return (
                                <div key={key} className="space-y-1.5">
                                    <Label>{label}</Label>
                                    <Input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={(e) => setData('foto_kondisi', e.target.files?.[0] ?? null)}
                                    />
                                </div>
                            );
                        }

                        if (key === 'category') {
                            return (
                                <div key={key} className="space-y-1.5">
                                    <Label>{label}</Label>
                                    <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            );
                        }

                        if (key === 'sumber_pendanaan') {
                            return (
                                <div key={key} className="space-y-1.5">
                                    <Label>{label}</Label>
                                    <Select value={data.sumber_pendanaan} onValueChange={(v) => setData('sumber_pendanaan', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pemerintah">Pemerintah</SelectItem>
                                            <SelectItem value="mandiri">Mandiri</SelectItem>
                                            <SelectItem value="kerjasama">Kerjasama</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            );
                        }

                        if (key === 'deskripsi_titik') {
                            return (
                                <div key={key} className="space-y-1.5">
                                    <Label>{label}</Label>
                                    <Textarea
                                        value={data.deskripsi_titik}
                                        onChange={(e) => setData('deskripsi_titik', e.target.value)}
                                    />
                                </div>
                            );
                        }

                        if (key === 'latitude') {
                            return (
                                <div key={key} className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label>Latitude</Label>
                                        <Input value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Longitude</Label>
                                        <Input value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} />
                                    </div>
                                </div>
                            );
                        }

                        const formKey = key as keyof typeof data;
                        if (!(formKey in data) || typeof data[formKey] === 'object') {
                            return null;
                        }

                        return (
                            <div key={key} className="space-y-1.5">
                                <Label>{label}</Label>
                                <Input
                                    value={String(data[formKey] ?? '')}
                                    onChange={(e) => setData(formKey, e.target.value)}
                                />
                                {errors[formKey] && <p className="text-xs text-destructive">{errors[formKey]}</p>}
                            </div>
                        );
                    })}

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => router.visit(`/submissions/${submission.id}`)}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-primary">
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kirim Revisi'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
