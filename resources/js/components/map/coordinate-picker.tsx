'use client';

import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { useEffect, useRef } from 'react';

interface CoordinatePickerProps {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
}

export default function CoordinatePicker({ latitude, longitude, onChange }: CoordinatePickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<LeafletMarker | null>(null);
    const onChangeRef = useRef(onChange);

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
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            const defaultLat = latitude ?? -2.5489;
            const defaultLng = longitude ?? 118.0149;

            const map = L.map(mapRef.current, {
                center: [defaultLat, defaultLng],
                zoom: latitude ? 13 : 5,
                scrollWheelZoom: false,
            });

            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);

            const placeMarker = (lat: number, lng: number) => {
                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);

                    return;
                }

                const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
                marker.on('dragend', () => {
                    // wrap() normalizes longitude to -180..180 after panning around the globe
                    const pos = marker.getLatLng().wrap();
                    marker.setLatLng(pos);
                    onChangeRef.current(pos.lat, pos.lng);
                });
                markerRef.current = marker;
            };

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

    return (
        <div className="space-y-3">
            <div className="h-72 overflow-hidden rounded-xl border border-border shadow-sm">
                <div ref={mapRef} className="h-full w-full" />
            </div>
            <p className="text-xs text-muted-foreground">
                Klik pada peta untuk menentukan koordinat lokasi, atau isi manual di bawah.
            </p>
        </div>
    );
}
