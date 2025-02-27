const CTASection = () => {
  return <section id="pricing" className="py-24 bg-primary relative overflow-hidden">
      <div className="bg-gray-300"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Lesson Planning?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of teachers who are already saving time and creating better lessons with Acumen.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-primary font-medium px-8 py-3 rounded-lg transition-colors">
              Start Free Trial
            </button>
            <p className="text-white/80 text-sm">No credit card required • 14-day free trial</p>
          </div>
        </div>
      </div>
    </section>;
};
export default CTASection;