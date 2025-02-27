
import { Home, FileText, MessageCircle, PieChart } from 'lucide-react';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (url: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(url);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const element = document.querySelector(url);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { name: 'Home', url: '#', icon: Home },
    { name: 'Features', url: '#features', icon: PieChart },
    { name: 'Testimonials', url: '#testimonials', icon: MessageCircle },
    { name: 'Pricing', url: '#pricing', icon: FileText }
  ];

  return (
    <NavBar 
      items={navItems} 
      className="sm:pt-4"
      onItemClick={(url) => handleScroll(url)} 
    />
  );
};

export default Navigation;
