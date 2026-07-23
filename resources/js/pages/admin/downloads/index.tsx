import type { Download } from '@/types/submission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { FileText, Loader2, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

interface AdminDownloadsIndexProps {
    downloads: Download[];
}

export default function AdminDownloadsIndex({ downloads }: AdminDownloadsIndexProps) {
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm<{
        title: string;
        description: string;
        file: File | null;
        sort_order: string;
        is_active: string;
    }>({
        title: '',
        description: '',
        file: null,
        sort_order: '0',
        is_active: '1',
    });

    const handleAdd = () => {
        post('/admin/downloads', {
            forceFormData: true,
            onSuccess: () => { reset(); setShowForm(false); },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus file unduhan ini?')) {
            router.delete(`/admin/downloads/${id}`, { preserveScroll: true });
        }
    };

    return (
            <div className="mx-auto max-w-4xl p-6 lg:p-8">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Kelola Dokumen Unduhan</h1>
                        <p className="text-sm text-muted-foreground">File yang akan ditampilkan di halaman publik untuk diunduh pemohon</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-primary">
                        <Plus className="h-4 w-4" /> Tambah File
                    </Button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-semibold text-foreground">Upload File Baru</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Judul File <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder="Contoh: Template Surat Permohonan"
                                    />
                                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Deskripsi</Label>
                                    <Textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Deskripsi singkat tentang file ini"
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>File <span className="text-destructive">*</span></Label>
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-2.5 text-sm transition hover:bg-muted">
                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {data.file?.name ?? 'PDF/DOC/DOCX/XLS (max 10MB)'}
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                            onChange={e => setData('file', e.target.files?.[0] ?? null)}
                                        />
                                    </label>
                                    {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Urutan Tampil</Label>
                                    <Input
                                        type="number"
                                        value={data.sort_order}
                                        onChange={e => setData('sort_order', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={handleAdd} disabled={processing} className="gap-2 bg-primary">
                                    {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...</> : 'Simpan File'}
                                </Button>
                                <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Downloads List */}
                <div className="space-y-3">
                    {downloads.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
                            <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
                            <h3 className="font-semibold text-foreground">Belum ada file</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Tambahkan file untuk ditampilkan di halaman publik</p>
                        </div>
                    )}
                    {downloads.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm text-foreground">{doc.title}</p>
                                    {doc.is_active === false && (
                                        <Badge variant="outline" className="text-xs">Nonaktif</Badge>
                                    )}
                                </div>
                                {doc.description && (
                                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                                )}
                                <p className="text-xs text-primary">{doc.original_name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(doc.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
    );
}

AdminDownloadsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Kelola Unduhan', href: '/admin/downloads' },
    ],
};
