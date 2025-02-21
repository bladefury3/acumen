
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

const DashboardLayout = ({ children, sidebarItems, sidebarAction }: DashboardLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          <nav className="mt-6 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  location.pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          {sidebarAction && (
            <div className="mt-6">
              {sidebarAction}
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
