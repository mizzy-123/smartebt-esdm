import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className,
    alt = 'Logo SMART EBT - Dinas Energi dan Sumber Daya Mineral Provinsi Jawa Tengah',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo.png"
            alt={alt}
            className={className}
            {...props}
        />
    );
}
