
import { BookOpen, Clock, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div id="hero" className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Get started with Acumen</span>
              <Link to="/auth" className="flex items-center gap-1 text-[#003C5A] hover:text-[#003C5A]/90 transition-colors">
                Sign up now
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Create Lesson Plans in <span className="text-[#003C5A]">Minutes</span>, Not Hours
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Streamline your lesson planning process with Acumen's intelligent tools. Save time and create engaging lessons that inspire your students.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              asChild 
              size="lg" 
              className="w-full sm:w-auto bg-[#003C5A] text-white hover:bg-[#003C5A]/90"
            >
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto border-[#003C5A] text-[#003C5A] hover:bg-[#003C5A]/10"
            >
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="text-[#003C5A]" size={24} />
              <span className="text-gray-600">Save 5+ hours weekly</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="text-[#003C5A]" size={24} />
              <span className="text-gray-600">Used by 50k+ teachers</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="text-[#003C5A]" size={24} />
              <span className="text-gray-600">1000+ lesson templates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
