import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { kecamatan as kecamatanRoute, kelurahan as kelurahanRoute } from '@/routes/wilayah';
import { useEffect, useRef, useState } from 'react';

export type WilayahOption = {
    id: number;
    nama: string;
};

type WilayahValue = {
    kabupaten: string;
    kecamatan: string;
    desa: string;
};

interface WilayahSelectFieldsProps {
    kabupatenOptions: WilayahOption[];
    value: WilayahValue;
    onChange: (value: WilayahValue) => void;
    errors?: Partial<Record<'kabupaten' | 'kecamatan' | 'desa', string>>;
}

async function fetchWilayahOptions(url: string): Promise<WilayahOption[]> {
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
    });

    if (!response.ok) {
        return [];
    }

    const payload = (await response.json()) as { data?: WilayahOption[] };

    return payload.data ?? [];
}

function findOptionId(options: WilayahOption[], nama: string): string {
    if (!nama) {
        return '';
    }

    const match = options.find((option) => option.nama.toLowerCase() === nama.toLowerCase());

    return match ? String(match.id) : '';
}

export default function WilayahSelectFields({
    kabupatenOptions,
    value,
    onChange,
    errors,
}: WilayahSelectFieldsProps) {
    const shouldHydrate = useRef(true);
    const [kabupatenId, setKabupatenId] = useState(() => findOptionId(kabupatenOptions, value.kabupaten));
    const [kecamatanId, setKecamatanId] = useState('');
    const [desaId, setDesaId] = useState('');
    const [kecamatanOptions, setKecamatanOptions] = useState<WilayahOption[]>([]);
    const [desaOptions, setDesaOptions] = useState<WilayahOption[]>([]);
    const [loadingKecamatan, setLoadingKecamatan] = useState(false);
    const [loadingDesa, setLoadingDesa] = useState(false);

    useEffect(() => {
        if (!kabupatenId) {
            setKecamatanOptions([]);
            setKecamatanId('');
            setDesaOptions([]);
            setDesaId('');

            return;
        }

        const controller = new AbortController();
        const hydrate = shouldHydrate.current;
        setLoadingKecamatan(true);

        fetchWilayahOptions(kecamatanRoute.url({ query: { kabupaten_id: Number(kabupatenId) } }))
            .then((options) => {
                if (controller.signal.aborted) {
                    return;
                }

                setKecamatanOptions(options);
                setKecamatanId(hydrate ? findOptionId(options, value.kecamatan) : '');
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingKecamatan(false);
                }
            });

        return () => controller.abort();
        // value.kecamatan only used for first hydrate
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kabupatenId]);

    useEffect(() => {
        if (!kecamatanId) {
            setDesaOptions([]);
            setDesaId('');

            return;
        }

        const controller = new AbortController();
        const hydrate = shouldHydrate.current;
        setLoadingDesa(true);

        fetchWilayahOptions(kelurahanRoute.url({ query: { kecamatan_id: Number(kecamatanId) } }))
            .then((options) => {
                if (controller.signal.aborted) {
                    return;
                }

                setDesaOptions(options);
                setDesaId(hydrate ? findOptionId(options, value.desa) : '');

                if (hydrate) {
                    shouldHydrate.current = false;
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingDesa(false);
                }
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kecamatanId]);

    const handleKabupatenChange = (nextId: string) => {
        shouldHydrate.current = false;
        setKabupatenId(nextId);
        setKecamatanId('');
        setDesaId('');
        setKecamatanOptions([]);
        setDesaOptions([]);

        const selected = kabupatenOptions.find((option) => String(option.id) === nextId);
        onChange({
            kabupaten: selected?.nama ?? '',
            kecamatan: '',
            desa: '',
        });
    };

    const handleKecamatanChange = (nextId: string) => {
        shouldHydrate.current = false;
        setKecamatanId(nextId);
        setDesaId('');
        setDesaOptions([]);

        const selected = kecamatanOptions.find((option) => String(option.id) === nextId);
        onChange({
            kabupaten: value.kabupaten,
            kecamatan: selected?.nama ?? '',
            desa: '',
        });
    };

    const handleDesaChange = (nextId: string) => {
        shouldHydrate.current = false;
        setDesaId(nextId);
        const selected = desaOptions.find((option) => String(option.id) === nextId);
        onChange({
            kabupaten: value.kabupaten,
            kecamatan: value.kecamatan,
            desa: selected?.nama ?? '',
        });
    };

    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
                <Label>Kabupaten</Label>
                <Select value={kabupatenId || undefined} onValueChange={handleKabupatenChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih kabupaten" />
                    </SelectTrigger>
                    <SelectContent>
                        {kabupatenOptions.map((option) => (
                            <SelectItem key={option.id} value={String(option.id)}>
                                {option.nama}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors?.kabupaten && <p className="text-xs text-destructive">{errors.kabupaten}</p>}
            </div>

            <div className="space-y-1.5">
                <Label>Kecamatan</Label>
                <Select
                    value={kecamatanId || undefined}
                    onValueChange={handleKecamatanChange}
                    disabled={!kabupatenId || loadingKecamatan}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={loadingKecamatan ? 'Memuat...' : 'Pilih kecamatan'} />
                    </SelectTrigger>
                    <SelectContent>
                        {kecamatanOptions.map((option) => (
                            <SelectItem key={option.id} value={String(option.id)}>
                                {option.nama}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors?.kecamatan && <p className="text-xs text-destructive">{errors.kecamatan}</p>}
            </div>

            <div className="space-y-1.5">
                <Label>Desa / Kelurahan</Label>
                <Select
                    value={desaId || undefined}
                    onValueChange={handleDesaChange}
                    disabled={!kecamatanId || loadingDesa}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={loadingDesa ? 'Memuat...' : 'Pilih desa / kelurahan'} />
                    </SelectTrigger>
                    <SelectContent>
                        {desaOptions.map((option) => (
                            <SelectItem key={option.id} value={String(option.id)}>
                                {option.nama}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors?.desa && <p className="text-xs text-destructive">{errors.desa}</p>}
            </div>
        </div>
    );
}
