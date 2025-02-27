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
            <SidebarBrand logoSrc="/lovable-uploads/60671658-caa0-425a-80aa-01b3fc17c753.png" companyName="Acumen" href="/" />
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
                    <a href={sidebarItems.href}>
                      <sidebarItems.icon />
                      <span>{sidebarItems.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarMenuButton className="w-full justify-between gap-3 h-12">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 rounded-md" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-muted-foreground">john@example.com</span>
              </div>
            </div>
            <ChevronsUpDown className="h-5 w-5 rounded-md" />
          </SidebarMenuButton>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>

    <main className="flex-1 min-w-100vh">
      <div className="px-4 py-2 bg-slate-50">
        <SidebarTrigger className="h-4 w-4 mt-2" />
      </div>
      <div className="p-6 py-0 bg-slate-50">
      <div className="px-8 py-6">{children}</div>
      </div>
    </main>
  </SidebarProvider>;
};
export default DashboardLayout;