// Submission TypeScript types for SMART-EBT

export type EntryTypeValue = 'pengajuan' | 'potensi' | 'terbangun';
export type SubmissionCategoryValue =
    | 'peternakan_ebt'
    | 'plts_rooftop'
    | 'plts_perikanan'
    | 'pats'
    | 'biogas'
    | 'plts'
    | 'pltmh'
    | 'pltb';
export type SubmissionStatusValue = 'belum_intervensi' | 'sudah_intervensi';
export type FieldReviewStatusValue = 'pending' | 'approved' | 'rejected';
export type SumberPendanaanValue = 'pemerintah' | 'mandiri' | 'kerjasama';

export interface FieldReview {
    status: FieldReviewStatusValue;
    reason: string | null;
}

export interface FieldReviews {
    [fieldKey: string]: FieldReview;
}

export interface SubmissionFile {
    id: number;
    url: string;
    original_name: string;
    periode: string | null;
}

export interface SubmissionListItem {
    id: number;
    entry_type?: EntryTypeValue | null;
    entryTypeLabel?: string;
    berbadan_hukum?: boolean;
    category: SubmissionCategoryValue | null;
    categoryLabel: string;
    status: SubmissionStatusValue;
    statusLabel: string;
    nama_pemohon: string;
    display_name?: string;
    hasRejected: boolean;
    canEdit?: boolean;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
}

export interface SubmissionDetail {
    id: number;
    entry_type: EntryTypeValue;
    entryTypeLabel: string;
    berbadan_hukum?: boolean;
    category: SubmissionCategoryValue | null;
    categoryLabel: string;
    kapasitasUnit?: string | null;
    status: SubmissionStatusValue;
    statusLabel: string;
    lokasi?: string | null;
    desa?: string | null;
    kecamatan?: string | null;
    kabupaten?: string | null;
    nama_pengelola?: string | null;
    kontak_person?: string | null;
    no_wa?: string | null;
    foto_kondisi_path?: string | null;
    nama_pemilik?: string | null;
    penanggung_jawab?: string | null;
    kapasitas?: number | null;
    sumber_pendanaan?: SumberPendanaanValue | null;
    sumber_pendanaan_detail?: string | null;
    tahun_pembangunan?: number | null;
    bauran_energi?: number | null;
    display_name?: string;
    nama_pemohon: string | null;
    nomor_identitas: string | null;
    alamat_organisasi: string | null;
    nama_ketua: string | null;
    surat_permohonan_proposal_path: string | null;
    dokumen_kepengurusan_path: string | null;
    dokumen_sk_kemenkumham_path: string | null;
    surat_keterangan_desa_path: string | null;
    kesediaan_ganti_kwh_pascabayar: boolean | null;
    latitude: number | null;
    longitude: number | null;
    deskripsi_titik: string | null;
    field_reviews: FieldReviews | null;
    hasRejected: boolean;
    rejectedFields: string[];
    created_at: string;
    detail: Record<string, unknown> | null;
    files: Record<string, SubmissionFile[]>;
    user?: {
        name: string;
        email: string;
    };
}

export interface CategoryOption {
    value: SubmissionCategoryValue;
    label: string;
    description?: string;
    icon?: string;
    kapasitasUnit?: string;
}

export interface MapPoint {
    id: number;
    entry_type?: EntryTypeValue | null;
    entryTypeLabel?: string;
    berbadan_hukum?: boolean;
    category: SubmissionCategoryValue | null;
    categoryLabel: string;
    desa?: string | null;
    kecamatan?: string | null;
    kabupaten?: string | null;
    deskripsi: string | null;
    latitude: number;
    longitude: number;
    bauran_energi?: number | null;
    kapasitas?: number | null;
}

export interface Download {
    id: number;
    title: string;
    description: string | null;
    original_name: string;
    created_at: string;
    is_active?: boolean;
    sort_order?: number;
    file_path?: string;
}

export interface AdminStats {
    total: number;
    belum: number;
    sudah: number;
}

export interface ChartCategory {
    category: SubmissionCategoryValue | null;
    label: string;
    total: number;
}

export interface BauranEnergiItem {
    category: SubmissionCategoryValue;
    label: string;
    jumlah: number;
    total_bauran: number;
}
