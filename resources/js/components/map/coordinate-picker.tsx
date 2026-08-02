'use client';

import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { Loader2, MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { search as wilayahSearch } from '@/routes/wilayah';

interface CoordinatePickerProps {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
}

type SearchResult = {
    label: string;
    latitude: number;
    longitude: number;
};

type PlaceMarkerFn = (lat: number, lng: number) => void;

const JAWA_TENGAH_CENTER: [number, number] = [-7.150975, 110.1402594];

export default function CoordinatePicker({
    latitude,
    longitude,
    onChange,
}: CoordinatePickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<LeafletMarker | null>(null);
    const placeMarkerRef = useRef<PlaceMarkerFn | null>(null);
    const onChangeRef = useRef(onChange);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (typeof window === 'undefined' || !mapRef.current) {
            return;
        }

        let cancelled = false;

        import('leaflet').then((L) => {
            if (cancelled || !mapRef.current || mapInstanceRef.current) {
                return;
            }

            delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            const defaultLat = latitude ?? JAWA_TENGAH_CENTER[0];
            const defaultLng = longitude ?? JAWA_TENGAH_CENTER[1];

            const map = L.map(mapRef.current, {
                center: [defaultLat, defaultLng],
                zoom: latitude ? 13 : 8,
                scrollWheelZoom: false,
            });

            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);

            const placeMarker: PlaceMarkerFn = (lat, lng) => {
                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);

                    return;
                }

                const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
                marker.on('dragend', () => {
                    const pos = marker.getLatLng().wrap();
                    marker.setLatLng(pos);
                    onChangeRef.current(pos.lat, pos.lng);
                });
                markerRef.current = marker;
            };

            placeMarkerRef.current = placeMarker;

            if (latitude !== null && longitude !== null) {
                placeMarker(latitude, longitude);
            }

            map.on('click', (event) => {
                const { lat, lng } = event.latlng.wrap();
                placeMarker(lat, lng);
                onChangeRef.current(lat, lng);
            });

            requestAnimationFrame(() => {
                map.invalidateSize();
            });
        });

        return () => {
            cancelled = true;
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
            placeMarkerRef.current = null;
        };
        // Initialize once; latitude/longitude updates handled below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (markerRef.current && latitude !== null && longitude !== null) {
            markerRef.current.setLatLng([latitude, longitude]);
            mapInstanceRef.current?.panTo([latitude, longitude]);
        }
    }, [latitude, longitude]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        const trimmed = query.trim();

        if (trimmed.length < 3) {
            setResults([]);
            setSearching(false);
            setSearchError(null);

            return;
        }

        setSearching(true);
        setSearchError(null);

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    wilayahSearch.url({ query: { q: trimmed } }),
                    {
                        headers: { Accept: 'application/json' },
                        credentials: 'same-origin',
                    },
                );

                if (!response.ok) {
                    throw new Error('search failed');
                }

                const payload = (await response.json()) as { data?: SearchResult[] };
                setResults(payload.data ?? []);
                setShowResults(true);
            } catch {
                setResults([]);
                setSearchError('Gagal mencari lokasi. Coba lagi.');
            } finally {
                setSearching(false);
            }
        }, 400);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [query]);

    const selectResult = (result: SearchResult) => {
        placeMarkerRef.current?.(result.latitude, result.longitude);
        mapInstanceRef.current?.setView([result.latitude, result.longitude], 15);
        onChange(result.latitude, result.longitude);
        setQuery(result.label);
        setShowResults(false);
        setResults([]);
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => {
                            if (results.length > 0) {
                                setShowResults(true);
                            }
                        }}
                        onBlur={() => {
                            // Delay so click on result still registers
                            window.setTimeout(() => setShowResults(false), 150);
                        }}
                        placeholder="Cari lokasi, desa, atau alamat..."
                        className="pr-9 pl-9"
                        autoComplete="off"
                    />
                    {searching && (
                        <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                </div>

                {showResults && (results.length > 0 || searchError || (query.trim().length >= 3 && !searching)) && (
                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-white shadow-lg">
                        {searchError && (
                            <p className="px-3 py-2 text-xs text-destructive">{searchError}</p>
                        )}
                        {!searchError && results.length === 0 && !searching && (
                            <p className="px-3 py-2 text-xs text-muted-foreground">
                                Lokasi tidak ditemukan. Coba kata kunci lain.
                            </p>
                        )}
                        {results.map((result) => (
                            <button
                                key={`${result.latitude}-${result.longitude}-${result.label}`}
                                type="button"
                                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectResult(result)}
                            >
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span className="line-clamp-2">{result.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-72 overflow-hidden rounded-xl border border-border shadow-sm">
                <div ref={mapRef} className="h-full w-full" />
            </div>
            <p className="text-xs text-muted-foreground">
                Cari lokasi, klik peta, atau geser marker untuk menentukan koordinat.
            </p>
        </div>
    );
}
