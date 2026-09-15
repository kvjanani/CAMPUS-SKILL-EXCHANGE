import { Link } from 'react-router-dom';
import { GraduationCap, Github, Mail, Heart } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">{APP_NAME}</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">{APP_TAGLINE}</p>
            <p className="text-sm text-gray-500 mt-3 max-w-md">
              A peer-to-peer skill exchange platform built for college students.
              Share what you know, find help when you need it.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Github className="h-4 w-4" /> GitHub</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> Contact</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex items-center justify-center gap-1.5 text-sm text-gray-500">
          <span>© 2026 {APP_NAME}. Made with</span>
          <Heart className="h-4 w-4 text-emerald-500" />
          <span>for students.</span>
        </div>
      </div>
    </footer>
  );
}
