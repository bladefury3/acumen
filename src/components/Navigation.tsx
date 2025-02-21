
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-nav' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="font-display text-2xl font-bold text-primary">Acumen</Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Testimonials</a>
            <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</a>
            <Link to="/auth" className="text-primary font-medium hover:text-primary-dark transition-colors">Sign In</Link>
            <button 
              onClick={() => navigate('/auth')} 
              className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors"
            >
              Sign Up Free
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white absolute top-16 left-0 w-full border-t border-gray-100 animate-fade-in">
            <div className="px-4 py-2 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-primary py-2">Features</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-primary py-2">Testimonials</a>
              <a href="#pricing" className="block text-gray-600 hover:text-primary py-2">Pricing</a>
              <Link to="/auth" className="block w-full text-left text-primary font-medium hover:text-primary-dark py-2">
                Sign In
              </Link>
              <button 
                onClick={() => navigate('/auth')}
                className="block w-full bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark"
              >
                Sign Up Free
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
