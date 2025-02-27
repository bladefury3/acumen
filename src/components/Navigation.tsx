
import { Home, FileText, MessageCircle, PieChart } from 'lucide-react';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Navigation = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', url: '#', icon: Home },
    { name: 'Features', url: '#features', icon: PieChart },
    { name: 'Testimonials', url: '#testimonials', icon: MessageCircle },
    { name: 'Pricing', url: '#pricing', icon: FileText }
  ];

  return (
    <>
      <NavBar items={navItems} className="sm:pt-4" />
      <div className="fixed top-4 right-8 z-50 flex items-center gap-4">
        <Link 
          to="/auth" 
          className="text-primary font-medium hover:text-primary-dark transition-colors"
        >
          Sign In
        </Link>
        <button 
          onClick={() => navigate('/auth')} 
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors"
        >
          Sign Up Free
        </button>
      </div>
    </>
  );
};

export default Navigation;
