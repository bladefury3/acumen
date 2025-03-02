
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
  sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    }
  ],
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
              {sidebarItems.map(sidebarItem => <SidebarMenuItem key={sidebarItem.label}>
                  <SidebarMenuButton asChild tooltip={sidebarItem.label}>
                    <a href={sidebarItem.href} className="hover:bg-accent">
                      <sidebarItem.icon />
                      <span>{sidebarItem.label}</span>
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
