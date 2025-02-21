
import { BookOpen, Clock, Users } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 animate-fade-in">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            Create Lesson Plans in <span className="text-primary">Minutes</span>, Not Hours
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Streamline your lesson planning process with Acumen's intelligent tools. Save time and create engaging lessons that inspire your students.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="w-full sm:w-auto bg-secondary hover:bg-secondary-dark text-white font-medium px-8 py-3 rounded-lg transition-colors">
              Start Free Trial
            </button>
            <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-primary font-medium px-8 py-3 rounded-lg border border-gray-200 transition-colors">
              Watch Demo
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="text-primary" size={24} />
              <span className="text-gray-600">Save 5+ hours weekly</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="text-primary" size={24} />
              <span className="text-gray-600">Used by 50k+ teachers</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="text-primary" size={24} />
              <span className="text-gray-600">1000+ lesson templates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
