
import { Home, Settings as SettingsIcon, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Settings = () => {
  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: SettingsIcon,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="container px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <p>Settings page content will go here.</p>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
