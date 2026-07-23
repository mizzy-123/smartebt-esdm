'use client';

import type { MapPoint } from '@/types/submission';
import type { Map as LeafletMap } from 'leaflet';
import { useEffect, useRef } from 'react';

interface PublicMapProps {
    points: MapPoint[];
    height?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    peternakan_ebt: '#1B8B41',
    plts_rooftop: '#0A2463',
    plts_perikanan: '#0077b6',
    pats: '#FDB813',
};

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export default function PublicMap({ points, height = '480px' }: PublicMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !mapRef.current) {
            return;
        }

        let cancelled = false;

        import('leaflet').then((L) => {
            if (cancelled || !mapRef.current) {
                return;
            }

            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            const map = L.map(mapRef.current, {
                center: [-2.5489, 118.0149],
                zoom: 5,
                scrollWheelZoom: false,
            });

            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);

            points.forEach((point) => {
                const color = CATEGORY_COLORS[point.category] ?? '#0A2463';
                const icon = L.divIcon({
                    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
                    className: 'ebt-map-marker',
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                });

                const marker = L.marker([point.latitude, point.longitude], { icon }).addTo(map);
                const label = escapeHtml(point.categoryLabel);
                const description = escapeHtml(point.deskripsi ?? 'Tidak ada deskripsi.');

                marker.bindPopup(`
                    <div style="min-width:200px;font-family:sans-serif">
                        <div style="background:#0A2463;color:white;padding:8px 12px;margin:-13px -20px 10px;border-radius:12px 12px 0 0;font-weight:600;font-size:13px">
                            ${label}
                        </div>
                        <p style="margin:0;font-size:13px;color:#333;line-height:1.5">${description}</p>
                    </div>
                `);
            });

            if (points.length > 0) {
                const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude] as [number, number]));
                map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
            }

            requestAnimationFrame(() => {
                map.invalidateSize();
            });
        });

        return () => {
            cancelled = true;

            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [points]);

    return (
        <div
            className="overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-lg"
            style={{ height }}
        >
            <div ref={mapRef} className="h-full w-full" />
        </div>
    );
}
