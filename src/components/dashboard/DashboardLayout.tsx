
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";

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

const DashboardLayout = ({ children, sidebarItems, sidebarAction }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center space-x-2 py-2">
              <img src="/lovable-uploads/eefa55b4-bd39-4945-9eba-3b9fbf729d79.png" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-semibold text-gray-900">acumen</span>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              {sidebarItems.map((item, idx) => (
                <SidebarLink
                  key={idx}
                  link={{
                    label: item.label,
                    href: item.href,
                    icon: <item.icon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                  }}
                />
              ))}
            </div>
          </div>
          {sidebarAction && (
            <div className="mt-6">
              {sidebarAction}
            </div>
          )}
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-auto bg-white">
        <div className="px-8 py-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
