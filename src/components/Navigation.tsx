
import { Home, FileText, MessageCircle, PieChart } from 'lucide-react';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navItems = [
    { name: 'Home', url: '#', icon: Home },
    { name: 'Features', url: '#features', icon: PieChart },
    { name: 'Testimonials', url: '#testimonials', icon: MessageCircle },
    { name: 'Pricing', url: '#pricing', icon: FileText }
  ];

  return (
    <NavBar items={navItems} className="sm:pt-4" />
  );
};

export default Navigation;
