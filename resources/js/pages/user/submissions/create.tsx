import type { CategoryOption } from '@/types/submission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Loader2, MapPin, Upload } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';

const CoordinatePicker = lazy(() => import('@/components/map/coordinate-picker'));

interface CreateProps {
    categories: CategoryOption[];
}

type Step = 'category' | 'base' | 'detail' | 'coords';

const CATEGORY_ICONS: Record<string, string> = {
    peternakan_ebt: '🐄',
    plts_rooftop: '🏠',
    plts_perikanan: '🐟',
    pats: '💧',
};

export default function SubmissionsCreate({ categories }: CreateProps) {
    const [step, setStep] = useState<Step>('category');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const { data, setData, post, processing, errors, reset } = useForm<{
        category: string;
        // Base fields
        nama_pemohon: string;
        nomor_identitas: string;
        alamat_organisasi: string;
        nama_ketua: string;
        surat_permohonan_proposal_path: File | null;
        dokumen_kepengurusan_path: File | null;
        dokumen_sk_kemenkumham_path: File | null;
        surat_keterangan_desa_path: File | null;
        kesediaan_ganti_kwh_pascabayar: string;
        // Coords
        latitude: string;
        longitude: string;
        deskripsi_titik: string;
        // Peternakan
        jenis_teknologi: string;
        kapasitas_kandang_m2: string;
        jenis_ternak: string;
        jenis_usaha: string;
        jumlah_ternak: string;
        ketersediaan_lahan: string;
        komitmen_pengelolaan: string;
        // PLTS
        kondisi_lokasi: string;
        panjang_instalasi: string;
        jenis_bangunan: string;
        jenis_gedung: string;
        umur_bangunan: string;
        luas_bangunan: string;
        tinggi_bangunan: string;
        jenis_atap: string;
        jenis_atap_lainnya: string;
        kerangka_atap: string;
        kerangka_atap_lainnya: string;
        tahun_pemasangan_atap: string;
        luas_atap: string;
        potensi_bayangan: string;
        nomor_pelanggan: string;
        jenis_layanan_listrik: string;
        data_pelanggan: string;
        daya_terpasang_pln: string;
        perkiraan_kapasitas_plts: string;
        daya_peralatan_perikanan: string;
        jumlah_pengguna: string;
        kesediaan_ganti_meteran: string;
        kapasitas_kwh_eksisting: string;
        tagihan_listrik: File[];
        // PATS
        ketersediaan_pompa: string;
        jenis_pompa: string;
        kapasitas_pompa_watt: string;
        sumber_air: string;
        sumber_air_lainnya: string;
        izin_pemanfaatan_air: string;
        ketersediaan_lahan_kontrol: string;
        status_kepemilikan_lahan: string;
    }>({
        category: '',
        nama_pemohon: '', nomor_identitas: '', alamat_organisasi: '', nama_ketua: '',
        surat_permohonan_proposal_path: null, dokumen_kepengurusan_path: null,
        dokumen_sk_kemenkumham_path: null, surat_keterangan_desa_path: null,
        kesediaan_ganti_kwh_pascabayar: '',
        latitude: '', longitude: '', deskripsi_titik: '',
        jenis_teknologi: '', kapasitas_kandang_m2: '', jenis_ternak: '', jenis_usaha: '',
        jumlah_ternak: '', ketersediaan_lahan: '', komitmen_pengelolaan: '',
        kondisi_lokasi: '', panjang_instalasi: '', jenis_bangunan: '', jenis_gedung: '',
        umur_bangunan: '', luas_bangunan: '', tinggi_bangunan: '', jenis_atap: '',
        jenis_atap_lainnya: '', kerangka_atap: '', kerangka_atap_lainnya: '',
        tahun_pemasangan_atap: '', luas_atap: '', potensi_bayangan: '', nomor_pelanggan: '',
        jenis_layanan_listrik: '', data_pelanggan: '', daya_terpasang_pln: '',
        perkiraan_kapasitas_plts: '', daya_peralatan_perikanan: '', jumlah_pengguna: '',
        kesediaan_ganti_meteran: '', kapasitas_kwh_eksisting: '',
        tagihan_listrik: [],
        ketersediaan_pompa: '', jenis_pompa: '', kapasitas_pompa_watt: '',
        sumber_air: '', sumber_air_lainnya: '', izin_pemanfaatan_air: '',
        ketersediaan_lahan_kontrol: '', status_kepemilikan_lahan: '',
    });

    const steps = ['category', 'base', 'detail', 'coords'] as Step[];
    const currentStep = steps.indexOf(step) + 1;

    const handleCategorySelect = (cat: string) => {
        setSelectedCategory(cat);
        setData('category', cat);
    };

    // Maps each field to the wizard step where it is displayed, so that on a
    // validation failure we can jump back to the step containing the error.
    const FIELD_STEP: Record<string, Step> = {
        category: 'category',
        nama_pemohon: 'base', nomor_identitas: 'base', alamat_organisasi: 'base', nama_ketua: 'base',
        surat_permohonan_proposal_path: 'base', dokumen_kepengurusan_path: 'base',
        dokumen_sk_kemenkumham_path: 'base', surat_keterangan_desa_path: 'base',
        kesediaan_ganti_kwh_pascabayar: 'base',
        latitude: 'coords', longitude: 'coords', deskripsi_titik: 'coords',
    };

    const handleSubmit = () => {
        post('/submissions', {
            forceFormData: true,
            onSuccess: () => router.visit('/dashboard'),
            onError: (errs) => {
                const fields = Object.keys(errs);
                if (fields.length === 0) {
                    return;
                }

                // Detail fields default to the 'detail' step.
                const errorSteps = fields.map((f) => FIELD_STEP[f.split('.')[0]] ?? 'detail');
                const firstStep = steps.find((s) => errorSteps.includes(s));
                if (firstStep) {
                    setStep(firstStep);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const errorCount = Object.keys(errors).length;

    const FileInput = ({ field, label }: { field: keyof typeof data; label: string }) => (
        <div className="space-y-1.5">
            <Label htmlFor={field as string}>{label} <span className="text-destructive">*</span></Label>
            <div className="flex items-center gap-2">
                <label
                    htmlFor={field as string}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-2.5 text-sm transition hover:bg-muted"
                >
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                        {(data[field] as File | null)?.name ?? 'Pilih file (PDF/JPG/PNG, max 5MB)'}
                    </span>
                </label>
                <input
                    id={field as string}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setData(field, e.target.files?.[0] ?? null)}
                />
            </div>
            {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
        </div>
    );

    return (
            <div className="mx-auto max-w-3xl p-6 lg:p-8">
                {/* Progress */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-foreground">Buat Pengajuan EBT</h1>
                        <span className="text-sm text-muted-foreground">Langkah {currentStep} dari 4</span>
                    </div>
                    <div className="flex gap-1">
                        {steps.map((s, i) => (
                            <div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-all ${i < currentStep ? 'bg-primary' : 'bg-muted'}`}
                            />
                        ))}
                    </div>
                </div>

                {errorCount > 0 && (
                    <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        <p className="font-semibold">Pengajuan belum bisa dikirim, ada {errorCount} isian yang perlu diperbaiki:</p>
                        <ul className="mt-2 list-inside list-disc space-y-0.5">
                            {Object.values(errors).slice(0, 8).map((message, i) => (
                                <li key={i}>{message as string}</li>
                            ))}
                            {errorCount > 8 && <li>dan {errorCount - 8} lainnya...</li>}
                        </ul>
                    </div>
                )}

                {/* Step 1: Category */}
                {step === 'category' && (
                    <div>
                        <h2 className="mb-6 text-lg font-semibold">Pilih Kategori Pengajuan</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat.value)}
                                    className={`group rounded-2xl border-2 p-6 text-left transition-all hover:border-primary hover:shadow-md ${
                                        selectedCategory === cat.value
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-border bg-white'
                                    }`}
                                >
                                    <div className="mb-3 text-4xl">{CATEGORY_ICONS[cat.value]}</div>
                                    <h3 className={`mb-1.5 font-bold ${selectedCategory === cat.value ? 'text-primary' : 'text-foreground'}`}>
                                        {cat.label}
                                    </h3>
                                    <p className="text-xs leading-relaxed text-muted-foreground">{cat.description}</p>
                                </button>
                            ))}
                        </div>
                        {errors.category && <p className="mt-2 text-xs text-destructive">{errors.category}</p>}
                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={() => setStep('base')}
                                disabled={!selectedCategory}
                                className="gap-2 bg-primary"
                            >
                                Lanjutkan <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Base Form */}
                {step === 'base' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold">Informasi Dasar Pengajuan</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label>Nama Pemohon <span className="text-destructive">*</span></Label>
                                <Input value={data.nama_pemohon} onChange={e => setData('nama_pemohon', e.target.value)} placeholder="Nama lengkap pemohon" />
                                {errors.nama_pemohon && <p className="text-xs text-destructive">{errors.nama_pemohon}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Nomor Identitas (NIK/KTP) <span className="text-destructive">*</span></Label>
                                <Input value={data.nomor_identitas} onChange={e => setData('nomor_identitas', e.target.value)} placeholder="16 digit NIK" />
                                {errors.nomor_identitas && <p className="text-xs text-destructive">{errors.nomor_identitas}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Nama Ketua Organisasi <span className="text-destructive">*</span></Label>
                                <Input value={data.nama_ketua} onChange={e => setData('nama_ketua', e.target.value)} placeholder="Nama ketua" />
                                {errors.nama_ketua && <p className="text-xs text-destructive">{errors.nama_ketua}</p>}
                            </div>
                            {(selectedCategory === 'plts_rooftop' || selectedCategory === 'plts_perikanan') && (
                                <div className="space-y-1.5">
                                    <Label>Kesediaan Ganti KWH Pascabayar <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('kesediaan_ganti_kwh_pascabayar', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Ya, Bersedia</SelectItem>
                                            <SelectItem value="0">Tidak Bersedia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Alamat Organisasi <span className="text-destructive">*</span></Label>
                            <Textarea value={data.alamat_organisasi} onChange={e => setData('alamat_organisasi', e.target.value)} placeholder="Alamat lengkap organisasi/ketua sesuai proposal" rows={3} />
                        </div>

                        <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
                            <h3 className="font-semibold text-sm text-foreground">Dokumen Wajib</h3>
                            <FileInput field="surat_permohonan_proposal_path" label="Surat Permohonan & Proposal" />
                            <FileInput field="dokumen_kepengurusan_path" label="Dokumen Kepengurusan" />
                            <FileInput field="dokumen_sk_kemenkumham_path" label="SK Kemenkumham / Surat Dinas" />
                            <FileInput field="surat_keterangan_desa_path" label="Surat Keterangan Desa" />
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep('category')} className="gap-2">
                                <ArrowLeft className="h-4 w-4" /> Kembali
                            </Button>
                            <Button onClick={() => setStep('detail')} className="gap-2 bg-primary">
                                Lanjutkan <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Detail Form */}
                {step === 'detail' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold">Detail {categories.find(c => c.value === selectedCategory)?.label}</h2>

                        {/* Peternakan EBT */}
                        {selectedCategory === 'peternakan_ebt' && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Jenis Teknologi <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('jenis_teknologi', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih teknologi..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="digester_biogas">Digester Biogas</SelectItem>
                                            <SelectItem value="plts">PLTS</SelectItem>
                                            <SelectItem value="bsg">BSG</SelectItem>
                                            <SelectItem value="pats">Pompa Air Tenaga Surya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Ternak</Label>
                                    <Input value={data.jenis_ternak} onChange={e => setData('jenis_ternak', e.target.value)} placeholder="Sapi, kambing, dll." />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Usaha</Label>
                                    <Input value={data.jenis_usaha} onChange={e => setData('jenis_usaha', e.target.value)} placeholder="Peternakan, penggemukan, dll." />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jumlah Ternak</Label>
                                    <Input type="number" value={data.jumlah_ternak} onChange={e => setData('jumlah_ternak', e.target.value)} placeholder="Jumlah" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Kapasitas Kandang (m²)</Label>
                                    <Input type="number" value={data.kapasitas_kandang_m2} onChange={e => setData('kapasitas_kandang_m2', e.target.value)} placeholder="Luas kandang" />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Ketersediaan Lahan</Label>
                                    <Textarea value={data.ketersediaan_lahan} onChange={e => setData('ketersediaan_lahan', e.target.value)} rows={2} />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Komitmen Pengelolaan</Label>
                                    <Textarea value={data.komitmen_pengelolaan} onChange={e => setData('komitmen_pengelolaan', e.target.value)} rows={2} />
                                </div>
                            </div>
                        )}

                        {/* PLTS Rooftop */}
                        {selectedCategory === 'plts_rooftop' && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Kapasitas KWH Eksisting</Label>
                                    <Input type="number" value={data.kapasitas_kwh_eksisting} onChange={e => setData('kapasitas_kwh_eksisting', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Panjang Instalasi (m)</Label>
                                    <Input type="number" value={data.panjang_instalasi} onChange={e => setData('panjang_instalasi', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Bangunan <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('jenis_bangunan', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="permanen">Permanen</SelectItem>
                                            <SelectItem value="sementara">Sementara</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Gedung <span className="text-destructive">*</span></Label>
                                    <Input value={data.jenis_gedung} onChange={e => setData('jenis_gedung', e.target.value)} placeholder="Kelas/aula/asrama/dll." />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Umur Bangunan <span className="text-destructive">*</span></Label>
                                    <Input value={data.umur_bangunan} onChange={e => setData('umur_bangunan', e.target.value)} placeholder="mis. 10 tahun" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Luas Bangunan (m²) <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.luas_bangunan} onChange={e => setData('luas_bangunan', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Tinggi Bangunan (m) <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.tinggi_bangunan} onChange={e => setData('tinggi_bangunan', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Atap <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('jenis_atap', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            {['baja_ringan', 'kayu', 'kanal_c', 'kanal_i', 'beton', 'lainnya'].map(v => (
                                                <SelectItem key={v} value={v}>{v.replaceAll('_', ' ')}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {data.jenis_atap === 'lainnya' && (
                                    <div className="space-y-1.5">
                                        <Label>Jenis Atap Lainnya <span className="text-destructive">*</span></Label>
                                        <Input value={data.jenis_atap_lainnya} onChange={e => setData('jenis_atap_lainnya', e.target.value)} />
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <Label>Tahun Pemasangan Atap <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.tahun_pemasangan_atap} onChange={e => setData('tahun_pemasangan_atap', e.target.value)} placeholder="2020" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Luas Atap (m²) <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.luas_atap} onChange={e => setData('luas_atap', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Nomor Pelanggan PLN <span className="text-destructive">*</span></Label>
                                    <Input value={data.nomor_pelanggan} onChange={e => setData('nomor_pelanggan', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Layanan Listrik <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('jenis_layanan_listrik', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pascabayar">Pascabayar</SelectItem>
                                            <SelectItem value="prabayar">Prabayar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Daya Terpasang PLN (VA) <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.daya_terpasang_pln} onChange={e => setData('daya_terpasang_pln', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Perkiraan Kapasitas PLTS (Wp) <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.perkiraan_kapasitas_plts} onChange={e => setData('perkiraan_kapasitas_plts', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jumlah Pengguna <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.jumlah_pengguna} onChange={e => setData('jumlah_pengguna', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Kesediaan Ganti Meteran <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('kesediaan_ganti_meteran', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Ya, Bersedia</SelectItem>
                                            <SelectItem value="0">Tidak Bersedia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Kondisi Lokasi <span className="text-destructive">*</span></Label>
                                    <Textarea value={data.kondisi_lokasi} onChange={e => setData('kondisi_lokasi', e.target.value)} rows={2} />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Potensi Bayangan <span className="text-destructive">*</span></Label>
                                    <Textarea value={data.potensi_bayangan} onChange={e => setData('potensi_bayangan', e.target.value)} rows={2} />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Data Pelanggan <span className="text-destructive">*</span></Label>
                                    <Textarea value={data.data_pelanggan} onChange={e => setData('data_pelanggan', e.target.value)} rows={2} />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Tagihan Listrik 6 Bulan <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setData('tagihan_listrik', Array.from(e.target.files ?? []))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Unggah satu atau lebih file (PDF/JPG/PNG, max 5MB per file).
                                        {data.tagihan_listrik.length > 0 ? ` ${data.tagihan_listrik.length} file dipilih.` : ''}
                                    </p>
                                    {errors.tagihan_listrik && <p className="text-xs text-destructive">{errors.tagihan_listrik}</p>}
                                </div>
                            </div>
                        )}

                        {/* PLTS Perikanan */}
                        {selectedCategory === 'plts_perikanan' && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Kapasitas KWH Eksisting</Label>
                                    <Input type="number" value={data.kapasitas_kwh_eksisting} onChange={e => setData('kapasitas_kwh_eksisting', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Panjang Instalasi (m)</Label>
                                    <Input type="number" value={data.panjang_instalasi} onChange={e => setData('panjang_instalasi', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Bangunan <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('jenis_bangunan', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="permanen">Permanen</SelectItem>
                                            <SelectItem value="sementara">Sementara</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Gedung <span className="text-destructive">*</span></Label>
                                    <Input value={data.jenis_gedung} onChange={e => setData('jenis_gedung', e.target.value)} placeholder="Fasilitas budidaya/dll." />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Umur Bangunan <span className="text-destructive">*</span></Label>
                                    <Input value={data.umur_bangunan} onChange={e => setData('umur_bangunan', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Luas Bangunan (m²) <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.luas_bangunan} onChange={e => setData('luas_bangunan', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Tinggi Bangunan (m) <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.tinggi_bangunan} onChange={e => setData('tinggi_bangunan', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Atap <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('jenis_atap', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            {['genteng', 'kayu', 'asbes', 'seng', 'lainnya'].map(v => (
                                                <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {data.jenis_atap === 'lainnya' && (
                                    <div className="space-y-1.5">
                                        <Label>Jenis Atap Lainnya <span className="text-destructive">*</span></Label>
                                        <Input value={data.jenis_atap_lainnya} onChange={e => setData('jenis_atap_lainnya', e.target.value)} />
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <Label>Kerangka Atap <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('kerangka_atap', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            {['baja_ringan', 'kayu', 'kanal_c', 'kanal_i', 'beton', 'lainnya'].map(v => (
                                                <SelectItem key={v} value={v}>{v.replaceAll('_', ' ')}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {data.kerangka_atap === 'lainnya' && (
                                    <div className="space-y-1.5">
                                        <Label>Kerangka Atap Lainnya <span className="text-destructive">*</span></Label>
                                        <Input value={data.kerangka_atap_lainnya} onChange={e => setData('kerangka_atap_lainnya', e.target.value)} />
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <Label>Tahun Pemasangan Atap <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.tahun_pemasangan_atap} onChange={e => setData('tahun_pemasangan_atap', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Luas Atap (m²) <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.luas_atap} onChange={e => setData('luas_atap', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Nomor Pelanggan PLN <span className="text-destructive">*</span></Label>
                                    <Input value={data.nomor_pelanggan} onChange={e => setData('nomor_pelanggan', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Layanan Listrik <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('jenis_layanan_listrik', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pascabayar">Pascabayar</SelectItem>
                                            <SelectItem value="prabayar">Prabayar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Daya Peralatan Perikanan (W) <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.daya_peralatan_perikanan} onChange={e => setData('daya_peralatan_perikanan', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jumlah Pengguna <span className="text-destructive">*</span></Label>
                                    <Input type="number" value={data.jumlah_pengguna} onChange={e => setData('jumlah_pengguna', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Kesediaan Ganti Meteran <span className="text-destructive">*</span></Label>
                                    <Select onValueChange={v => setData('kesediaan_ganti_meteran', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Ya, Bersedia</SelectItem>
                                            <SelectItem value="0">Tidak Bersedia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Kondisi Lokasi <span className="text-destructive">*</span></Label>
                                    <Textarea value={data.kondisi_lokasi} onChange={e => setData('kondisi_lokasi', e.target.value)} rows={2} />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Potensi Bayangan <span className="text-destructive">*</span></Label>
                                    <Textarea value={data.potensi_bayangan} onChange={e => setData('potensi_bayangan', e.target.value)} rows={2} />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Data Pelanggan <span className="text-destructive">*</span></Label>
                                    <Textarea value={data.data_pelanggan} onChange={e => setData('data_pelanggan', e.target.value)} rows={2} />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Tagihan Listrik 6 Bulan <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setData('tagihan_listrik', Array.from(e.target.files ?? []))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Unggah satu atau lebih file (PDF/JPG/PNG, max 5MB per file).
                                        {data.tagihan_listrik.length > 0 ? ` ${data.tagihan_listrik.length} file dipilih.` : ''}
                                    </p>
                                    {errors.tagihan_listrik && <p className="text-xs text-destructive">{errors.tagihan_listrik}</p>}
                                </div>
                            </div>
                        )}

                        {/* PATS */}
                        {selectedCategory === 'pats' && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Ketersediaan Pompa</Label>
                                    <Select onValueChange={v => setData('ketersediaan_pompa', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sudah_ada">Sudah Ada</SelectItem>
                                            <SelectItem value="belum">Belum Ada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Pompa</Label>
                                    <Select onValueChange={v => setData('jenis_pompa', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="permukaan">Permukaan</SelectItem>
                                            <SelectItem value="submersible">Submersible</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Kapasitas Pompa (Watt)</Label>
                                    <Input type="number" value={data.kapasitas_pompa_watt} onChange={e => setData('kapasitas_pompa_watt', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Sumber Air</Label>
                                    <Select onValueChange={v => setData('sumber_air', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="air_tanah">Air Tanah</SelectItem>
                                            <SelectItem value="sungai">Sungai</SelectItem>
                                            <SelectItem value="mata_air">Mata Air</SelectItem>
                                            <SelectItem value="lainnya">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {data.sumber_air === 'lainnya' && (
                                    <div className="space-y-1.5">
                                        <Label>Sumber Air Lainnya</Label>
                                        <Input value={data.sumber_air_lainnya} onChange={e => setData('sumber_air_lainnya', e.target.value)} />
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <Label>Izin Pemanfaatan Air</Label>
                                    <Select onValueChange={v => setData('izin_pemanfaatan_air', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ada">Ada</SelectItem>
                                            <SelectItem value="belum_ada">Belum Ada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Ketersediaan Lahan Kontrol</Label>
                                    <Select onValueChange={v => setData('ketersediaan_lahan_kontrol', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ada">Ada</SelectItem>
                                            <SelectItem value="tidak">Tidak Ada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Status Kepemilikan Lahan</Label>
                                    <Input value={data.status_kepemilikan_lahan} onChange={e => setData('status_kepemilikan_lahan', e.target.value)} placeholder="Pribadi / Tanah desa / dll." />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep('base')} className="gap-2">
                                <ArrowLeft className="h-4 w-4" /> Kembali
                            </Button>
                            <Button onClick={() => setStep('coords')} className="gap-2 bg-primary">
                                Lanjutkan <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Coordinates */}
                {step === 'coords' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Koordinat & Deskripsi Lokasi</h2>
                        </div>

                        <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-muted" />}>
                            <CoordinatePicker
                                latitude={data.latitude ? parseFloat(data.latitude) : null}
                                longitude={data.longitude ? parseFloat(data.longitude) : null}
                                onChange={(lat, lng) => {
                                    setData('latitude', lat.toFixed(7));
                                    setData('longitude', lng.toFixed(7));
                                }}
                            />
                        </Suspense>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Latitude <span className="text-destructive">*</span></Label>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    value={data.latitude}
                                    onChange={e => setData('latitude', e.target.value.replace(',', '.'))}
                                    placeholder="-7.250445"
                                />
                                {errors.latitude && <p className="text-xs text-destructive">{errors.latitude}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Longitude <span className="text-destructive">*</span></Label>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    value={data.longitude}
                                    onChange={e => setData('longitude', e.target.value.replace(',', '.'))}
                                    placeholder="112.768845"
                                />
                                {errors.longitude && <p className="text-xs text-destructive">{errors.longitude}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Deskripsi Titik Lokasi <span className="text-destructive">*</span></Label>
                            <Textarea
                                value={data.deskripsi_titik}
                                onChange={e => setData('deskripsi_titik', e.target.value)}
                                placeholder="Deskripsi singkat lokasi yang akan tampil di peta (setelah diverifikasi admin)"
                                rows={3}
                            />
                            {errors.deskripsi_titik && <p className="text-xs text-destructive">{errors.deskripsi_titik}</p>}
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep('detail')} className="gap-2">
                                <ArrowLeft className="h-4 w-4" /> Kembali
                            </Button>
                            <Button onClick={handleSubmit} disabled={processing} className="gap-2 bg-primary">
                                {processing ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim...</>
                                ) : (
                                    <>Kirim Pengajuan <ArrowRight className="h-4 w-4" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
    );
}

SubmissionsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Buat Pengajuan', href: '/submissions/create' },
    ],
};
