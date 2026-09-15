import { Link } from 'react-router-dom';
import { Target, Eye, Users, BookOpen, HandHelping, ArrowRight, Layers, Database, Shield } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { APP_NAME } from '@/utils/constants';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <section className="py-16 bg-gradient-to-br from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">About {APP_NAME}</h1>
          <p className="mt-4 text-lg text-gray-600">
            {APP_NAME} is a peer-to-peer skill exchange platform designed specifically for college students.
            We believe every student has something to teach and something to learn.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To create a collaborative campus environment where students can easily share their skills
                and find help from peers. We break down the barriers between "I can help with this" and
                "I need help with this" by connecting students directly.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                A campus where no student struggles alone. Whether it's programming, design, or
                academic subjects, there's always a peer ready to help — and a way for you to give back
                by sharing what you know.
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">What You Can Do</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: BookOpen, title: 'Offer Skills', desc: 'List skills you can teach — from programming to photography. Set your level, availability, and preferred mode.' },
                { icon: HandHelping, title: 'Request Help', desc: 'Create help requests when you need assistance. Set priority, deadline, and preferred mode.' },
                { icon: Users, title: 'Browse & Connect', desc: 'Search and filter skills, view provider profiles, and offer help on open requests.' },
                { icon: Layers, title: 'Smart Matching', desc: 'Our matching system ranks skill providers by exact match and category relevance.' },
                { icon: Shield, title: 'Safe & Secure', desc: 'Role-based access, protected routes, and admin moderation keep the platform safe.' },
                { icon: Database, title: 'Track Everything', desc: 'Dashboard, my skills, my requests, feedback — all in one organized place.' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-emerald-600 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Join the community</h2>
            <p className="text-emerald-50 mb-6">Start sharing your skills and finding help today.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-semibold transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
