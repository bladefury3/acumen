
import { Home, FileText, MessageCircle, PieChart, LogIn } from 'lucide-react';
import { NavBar } from '@/components/ui/tubelight-navbar';

const Navigation = () => {
  const navItems = [
    { name: 'Home', url: '#hero', icon: Home },
    { name: 'Features', url: '#features', icon: PieChart },
    { name: 'Testimonials', url: '#testimonials', icon: MessageCircle },
    { name: 'Pricing', url: '#pricing', icon: FileText },
    { name: 'Sign In', url: '/auth', icon: LogIn }
  ];

  return (
    <NavBar items={navItems} className="sm:pt-4" />
  );
};

export default Navigation;
