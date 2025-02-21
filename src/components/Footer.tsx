
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="font-display text-2xl font-bold text-primary">Acumen</span>
            <p className="text-gray-600 text-sm">
              Empowering teachers with smart lesson planning tools to create engaging learning experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">Features</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">Pricing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">Testimonials</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">Guide</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">Privacy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">Terms</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary text-sm">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Acumen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
