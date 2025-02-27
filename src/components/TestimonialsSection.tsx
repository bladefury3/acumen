const testimonials = [{
  name: "Sarah Johnson",
  role: "High School Science Teacher",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  quote: "Acumen has transformed how I plan my lessons. What used to take hours now takes minutes, and the quality of my lessons has improved dramatically."
}, {
  name: "Michael Chen",
  role: "Middle School Math Teacher",
  image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  quote: "The collaborative features have been a game-changer for our department. We're able to share and improve our lesson plans together."
}, {
  name: "Emily Rodriguez",
  role: "Elementary School Teacher",
  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  quote: "I love how easy it is to customize templates to fit my teaching style. The standards alignment feature saves me so much time!"
}];
const TestimonialsSection = () => {
  return <section id="testimonials" className="bg-gray-50 py-[128px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Teachers Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of educators who are already saving time and creating better lessons with Acumen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => <div key={index} className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in" style={{
          animationDelay: `${index * 100}ms`
        }}>
              <div className="flex items-center space-x-4 mb-6">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full" loading="lazy" />
                <div>
                  <h3 className="font-medium text-gray-900">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
            </div>)}
        </div>
      </div>
    </section>;
};
export default TestimonialsSection;