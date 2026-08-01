import { Link, usePage } from '@inertiajs/react';
import { Building2, ClipboardList, FileText, FolderDown, LayoutGrid, Leaf } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Auth } from '@/types';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as { auth: Auth };
    const isAdmin = auth.user?.role === 'admin';

    const inputNav: NavItem[] = [
        {
            title: 'Info Potensi Lokal EBT',
            href: '/submissions/create?type=potensi',
            icon: Leaf,
        },
        {
            title: 'Infrastruktur Terbangun',
            href: '/submissions/create?type=terbangun',
            icon: Building2,
        },
        {
            title: isAdmin ? 'Data Saya' : 'Dashboard',
            href: '/dashboard',
            icon: isAdmin ? ClipboardList : LayoutGrid,
        },
    ];

    const mainNavItems: NavItem[] = isAdmin
        ? [
              {
                  title: 'Dashboard Admin',
                  href: '/admin/dashboard',
                  icon: LayoutGrid,
              },
              ...inputNav,
              {
                  title: 'Verifikasi Data',
                  href: '/admin/submissions',
                  icon: FileText,
              },
              {
                  title: 'Kelola Unduhan',
                  href: '/admin/downloads',
                  icon: FolderDown,
              },
          ]
        : inputNav;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
