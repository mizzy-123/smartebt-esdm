import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { landing } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0A2463] via-[#1a3a7a] to-[#1B8B41] p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={landing()}
                            className="flex flex-col items-center gap-3 font-medium transition-transform hover:scale-105"
                        >
                            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg sm:h-32 sm:w-32">
                                <AppLogoIcon className="h-full w-full object-contain p-1" />
                            </div>
                            <div className="flex flex-col items-center text-white">
                                <span className="font-bold text-xl tracking-tight leading-tight">SMART-EBT</span>
                                <span className="text-xs text-blue-200 uppercase tracking-widest font-semibold">ESDM</span>
                            </div>
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
                        <div className="mb-8 space-y-2 text-center">
                            <h1 className="text-xl font-bold text-[#0A2463]">{title}</h1>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
