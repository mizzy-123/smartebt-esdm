import { Link, usePage } from '@inertiajs/react';
import { FileText, FolderDown, LayoutGrid, PlusCircle } from 'lucide-react';
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

    const mainNavItems: NavItem[] = isAdmin
        ? [
              {
                  title: 'Dashboard Admin',
                  href: '/admin/dashboard',
                  icon: LayoutGrid,
              },
              {
                  title: 'Daftar Pengajuan',
                  href: '/admin/submissions',
                  icon: FileText,
              },
              {
                  title: 'Kelola Unduhan',
                  href: '/admin/downloads',
                  icon: FolderDown,
              },
          ]
        : [
              {
                  title: 'Dashboard',
                  href: '/dashboard',
                  icon: LayoutGrid,
              },
              {
                  title: 'Buat Pengajuan',
                  href: '/submissions/create',
                  icon: PlusCircle,
              },
          ];

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
