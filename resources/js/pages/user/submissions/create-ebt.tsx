import type { CategoryOption, EntryTypeValue } from '@/types/submission';
import type { Auth } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import WilayahSelectFields, { type WilayahOption } from '@/components/wilayah-select-fields';
import { calculateBauranEnergi } from '@/lib/bauran-energi';
import { create as createPotensi } from '@/routes/submissions/potensi';
import { create as createTerbangun } from '@/routes/submissions/terbangun';
import { router, setLayoutProps, useForm, usePage } from '@inertiajs/react';
import { Loader2, MapPin, Upload } from 'lucide-react';
import { lazy, Suspense } from 'react';

const CoordinatePicker = lazy(() => import('@/components/map/coordinate-picker'));

interface CreateProps {
    entryType: EntryTypeValue;
    entryTypeLabel: string;
    categories: CategoryOption[];
    kabupatenOptions: WilayahOption[];
}

export default function SubmissionsCreateEbt({
    entryType,
    entryTypeLabel,
    categories,
    kabupatenOptions,
}: CreateProps) {
    const { auth } = usePage().props as { auth: Auth };
    const isAdmin = auth.user?.role === 'admin';
    const isTerbangun = entryType === 'terbangun';
    const createUrl = isTerbangun ? createTerbangun.url() : createPotensi.url();

    setLayoutProps({
        breadcrumbs: [
            { title: isAdmin ? 'Dashboard Admin' : 'Dashboard', href: isAdmin ? '/admin/dashboard' : '/dashboard' },
            { title: entryTypeLabel, href: createUrl },
        ],
    });

    const { data, setData, post, processing, errors } = useForm({
        entry_type: entryType,
        category: categories[0]?.value ?? (isTerbangun ? 'plts' : 'biogas'),
        lokasi: '',
        desa: '',
        kecamatan: '',
        kabupaten: '',
        nama_pengelola: '',
        kontak_person: '',
        no_wa: '',
        foto_kondisi: null as File | null,
        nama_pemilik: '',
        penanggung_jawab: '',
        kapasitas: '',
        sumber_pendanaan: '',
        sumber_pendanaan_detail: '',
        tahun_pembangunan: '',
        latitude: '',
        longitude: '',
        deskripsi_titik: '',
    });

    const selectedCategory = categories.find((c) => c.value === data.category);
    const bauranPreview = isTerbangun ? calculateBauranEnergi(data.category, data.kapasitas) : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/submissions', {
            forceFormData: true,
            onSuccess: () => router.visit('/dashboard'),
        });
    };

    return (
        <div className="mx-auto max-w-3xl p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">{entryTypeLabel}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {isTerbangun
                        ? 'Input infrastruktur EBT yang sudah terbangun. Bauran energi dihitung otomatis dari kapasitas.'
                        : 'Input info potensi lokal EBT. Field boleh dikosongkan sebagian untuk latihan.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="space-y-1.5">
                    <Label>{isTerbangun ? 'Jenis Infrastruktur' : 'Jenis Teknologi'} <span className="text-destructive">*</span></Label>
                    <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.icon} {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>

                {isTerbangun ? (
                    <>
                        <div className="space-y-1.5">
                            <Label>Nama (Pemrakarsa / Pemilik / Penerima Manfaat)</Label>
                            <Input
                                value={data.nama_pemilik}
                                onChange={(e) => setData('nama_pemilik', e.target.value)}
                                placeholder="Coret yang tidak perlu di catatan Anda"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label>Penanggung Jawab</Label>
                                <Input value={data.penanggung_jawab} onChange={(e) => setData('penanggung_jawab', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Kontak Person</Label>
                                <Input value={data.kontak_person} onChange={(e) => setData('kontak_person', e.target.value)} />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Nama Pengelola</Label>
                            <Input value={data.nama_pengelola} onChange={(e) => setData('nama_pengelola', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Kontak Person</Label>
                            <Input value={data.kontak_person} onChange={(e) => setData('kontak_person', e.target.value)} />
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label>Nomor WhatsApp</Label>
                    <Input value={data.no_wa} onChange={(e) => setData('no_wa', e.target.value)} placeholder="08xxxxxxxxxx" />
                </div>

                <div className="space-y-1.5">
                    <Label>Lokasi</Label>
                    <Input
                        value={data.lokasi}
                        onChange={(e) => setData('lokasi', e.target.value)}
                        placeholder="Alamat / keterangan lokasi"
                    />
                    {errors.lokasi && <p className="text-xs text-destructive">{errors.lokasi}</p>}
                </div>

                <WilayahSelectFields
                    kabupatenOptions={kabupatenOptions}
                    value={{
                        kabupaten: data.kabupaten,
                        kecamatan: data.kecamatan,
                        desa: data.desa,
                    }}
                    onChange={(wilayah) => {
                        setData({
                            ...data,
                            kabupaten: wilayah.kabupaten,
                            kecamatan: wilayah.kecamatan,
                            desa: wilayah.desa,
                        });
                    }}
                    errors={{
                        kabupaten: errors.kabupaten,
                        kecamatan: errors.kecamatan,
                        desa: errors.desa,
                    }}
                />

                {isTerbangun && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label>Kapasitas ({selectedCategory?.kapasitasUnit ?? 'unit'})</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={data.kapasitas}
                                    onChange={(e) => setData('kapasitas', e.target.value)}
                                    placeholder="Total kapasitas terpasang"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Bauran Energi (otomatis)</Label>
                                <div className="flex h-9 items-center rounded-md border border-border bg-muted/40 px-3 text-sm font-medium">
                                    {bauranPreview !== null
                                        ? bauranPreview.toLocaleString('id-ID', { maximumFractionDigits: 6 })
                                        : '—'}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label>Sumber Pendanaan</Label>
                                <Select value={data.sumber_pendanaan} onValueChange={(v) => setData('sumber_pendanaan', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih sumber" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pemerintah">Pemerintah (APBD/APBN)</SelectItem>
                                        <SelectItem value="mandiri">Mandiri (Perusahaan/Pihak ke-3)</SelectItem>
                                        <SelectItem value="kerjasama">Kerjasama</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Tahun Pembangunan</Label>
                                <Input
                                    type="number"
                                    value={data.tahun_pembangunan}
                                    onChange={(e) => setData('tahun_pembangunan', e.target.value)}
                                    placeholder="YYYY"
                                />
                            </div>
                        </div>

                        {data.sumber_pendanaan === 'kerjasama' && (
                            <div className="space-y-1.5">
                                <Label>Detail Kerjasama (nama perusahaan & kontak)</Label>
                                <Input
                                    value={data.sumber_pendanaan_detail}
                                    onChange={(e) => setData('sumber_pendanaan_detail', e.target.value)}
                                />
                            </div>
                        )}
                    </>
                )}

                <div className="space-y-1.5">
                    <Label>Foto Kondisi Saat Ini</Label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-3 text-sm transition hover:bg-muted">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {data.foto_kondisi?.name ?? 'Pilih foto (JPG/PNG, max 5MB)'}
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) => setData('foto_kondisi', e.target.files?.[0] ?? null)}
                        />
                    </label>
                </div>

                <div className="space-y-1.5">
                    <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Koordinat
                    </Label>
                    <div className="mb-2 grid gap-3 sm:grid-cols-2">
                        <Input
                            type="number"
                            step="any"
                            placeholder="Latitude"
                            value={data.latitude}
                            onChange={(e) => setData('latitude', e.target.value)}
                        />
                        <Input
                            type="number"
                            step="any"
                            placeholder="Longitude"
                            value={data.longitude}
                            onChange={(e) => setData('longitude', e.target.value)}
                        />
                    </div>
                    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
                        <CoordinatePicker
                            latitude={data.latitude ? Number(data.latitude) : null}
                            longitude={data.longitude ? Number(data.longitude) : null}
                            onChange={(lat, lng) => {
                                setData('latitude', String(lat));
                                setData('longitude', String(lng));
                            }}
                        />
                    </Suspense>
                </div>

                <div className="space-y-1.5">
                    <Label>Deskripsi Titik (opsional)</Label>
                    <Textarea
                        rows={2}
                        value={data.deskripsi_titik}
                        onChange={(e) => setData('deskripsi_titik', e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => router.visit('/dashboard')}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90">
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            'Kirim Data'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
