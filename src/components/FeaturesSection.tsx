import { BookOpen, Clock, Users, Star, ThumbsUp, Calendar } from 'lucide-react';
const features = [{
  icon: BookOpen,
  title: "Ready-Made Templates",
  description: "Access hundreds of customizable templates across all subjects and grade levels."
}, {
  icon: Clock,
  title: "Time-Saving Automation",
  description: "Generate lesson plans automatically based on your curriculum and teaching style."
}, {
  icon: Users,
  title: "Collaboration Tools",
  description: "Share and collaborate with other teachers to create better lesson plans together."
}, {
  icon: Star,
  title: "Standards Alignment",
  description: "Automatically align your lessons with state and national education standards."
}, {
  icon: ThumbsUp,
  title: "Easy Customization",
  description: "Modify any template or lesson plan to perfectly fit your classroom needs."
}, {
  icon: Calendar,
  title: "Smart Scheduling",
  description: "Plan your entire semester with our intelligent scheduling assistant."
}];
const FeaturesSection = () => {
  return <section id="features" className="bg-white py-[160px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Create Amazing Lessons
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features that help you create, organize, and deliver engaging lessons efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
          const Icon = feature.icon;
          return <div key={index} className="group p-6 bg-white rounded-xl border border-gray-100 hover:border-primary/20 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in" style={{
            animationDelay: `${index * 100}ms`
          }}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>;
        })}
        </div>
      </div>
    </section>;
};
export default FeaturesSection;