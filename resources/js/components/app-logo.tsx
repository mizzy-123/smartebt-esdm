import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#FDB813] text-[#0A2463]">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-sidebar-foreground">
                    SMART-EBT
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">ESDM</span>
            </div>
        </>
    );
}
