import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
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
  return <div className="flex h-screen bg-white">
      <aside className="w-64 border-r border-gray-200 bg-[FCEDEB] bg-[#fcedeb]">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <img alt="Logo" src="/lovable-uploads/60671658-caa0-425a-80aa-01b3fc17c753.png" className="h-8 w-8 object-fill" />
            <span className="text-xl font-semibold text-[#c3cff5]">acumen</span>
          </Link>
          <nav className="mt-6 space-y-1">
            {sidebarItems.map(item => <Link key={item.href} to={item.href} className={cn("flex items-center px-3 py-2 text-sm rounded-md transition-colors", location.pathname === item.href ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Link>)}
          </nav>
          {sidebarAction && <div className="mt-6">
              {sidebarAction}
            </div>}
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6">{children}</div>
      </main>
    </div>;
};
export default DashboardLayout;