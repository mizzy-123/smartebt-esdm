// Submission TypeScript types for SMART-EBT

export type SubmissionCategoryValue = 'peternakan_ebt' | 'plts_rooftop' | 'plts_perikanan' | 'pats';
export type SubmissionStatusValue   = 'belum_intervensi' | 'sudah_intervensi';
export type FieldReviewStatusValue  = 'pending' | 'approved' | 'rejected';

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
    category: SubmissionCategoryValue;
    categoryLabel: string;
    status: SubmissionStatusValue;
    statusLabel: string;
    nama_pemohon: string;
    hasRejected: boolean;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
}

export interface SubmissionDetail {
    id: number;
    category: SubmissionCategoryValue;
    categoryLabel: string;
    status: SubmissionStatusValue;
    statusLabel: string;
    nama_pemohon: string;
    nomor_identitas: string;
    alamat_organisasi: string;
    nama_ketua: string;
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
    description: string;
    icon: string;
}

export interface MapPoint {
    id: number;
    category: SubmissionCategoryValue;
    categoryLabel: string;
    deskripsi: string | null;
    latitude: number;
    longitude: number;
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
    category: SubmissionCategoryValue;
    label: string;
    total: number;
}
