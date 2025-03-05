import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { SidebarBrand } from "@/components/ui/sidebar-brand";
import { Sidebar, SidebarProvider, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarHeader } from "@/components/ui/sidebar";
import { User, ChevronsUpDown, Calendar, Home, Inbox, Search, Settings } from "lucide-react";
interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  sidebarAction?: React.ReactNode;
}
const DashboardLayout = ({
  children,
  sidebarItems,
  sidebarAction
}: DashboardLayoutProps) => {
  const location = useLocation();
  return <SidebarProvider>
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarBrand logoSrc="/lovable-uploads/icon.png" companyName="Acumen" href="/" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map(sidebarItems => <SidebarMenuItem key={sidebarItems.label}>
                  <SidebarMenuButton asChild tooltip={sidebarItems.label}>
                    <a href={sidebarItems.href} className="hover:bg-accent">
                      <sidebarItems.icon />
                      <span>{sidebarItems.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>    
    </Sidebar>

    <main className="flex-1 min-w-100vh bg-slate-50">
      <div className="px-4 py-2 bg-neutral-50">
        <SidebarTrigger className="h-4 w-4 mt-2" />
      </div>
      <div className="p-6 py-0 bg-neutral-50">
      <div className="px-8 py-6">{children}</div>
      </div>
    </main>
  </SidebarProvider>;
};
export default DashboardLayout;