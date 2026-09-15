import { Link } from 'react-router-dom';
import {
  GraduationCap, ArrowRight, BookOpen, HandHelping, Users,
  Search, MessageSquare, Shield, Sparkles, CheckCircle2,
} from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl animate-float" />
          <div className="absolute bottom-10 -left-20 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6 animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              Peer-to-peer learning for college students
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {APP_TAGLINE}
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {APP_NAME} connects students to share skills and find help within their campus community.
              Offer what you know, request what you need, and grow together.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-gray-700 bg-white border border-gray-200 hover:border-emerald-300 hover:text-emerald-700 font-semibold transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '11+', label: 'Skill Categories', icon: BookOpen },
              { value: '3', label: 'Skill Levels', icon: GraduationCap },
              { value: '4', label: 'Request Statuses', icon: HandHelping },
              { value: '100%', label: 'Student Focused', icon: Users },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-2">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Three simple steps to start exchanging skills with your peers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Share Your Skills', desc: 'Add skills you know — programming, design, languages, and more. Set your availability and preferred mode.', icon: BookOpen },
              { num: '02', title: 'Find Help', desc: 'Browse available skills or create a help request. Our matching system finds students who can assist you.', icon: Search },
              { num: '03', title: 'Connect With Students', desc: 'Offer help on open requests, track progress, and submit feedback after completion.', icon: Users },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative group">
                  <div className="absolute -top-4 -left-2 text-6xl font-bold text-emerald-100 select-none">{step.num}</div>
                  <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-200 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Everything you need for a thriving campus skill exchange.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Skill Management', desc: 'Full CRUD for skills — add, edit, delete, and browse what others offer.', icon: BookOpen },
              { title: 'Help Requests', desc: 'Create requests when you need help. Track status from Open to Completed.', icon: HandHelping },
              { title: 'Smart Matching', desc: 'Rule-based matching finds students with the right skills for your request.', icon: Search },
              { title: 'Feedback System', desc: 'Rate and review after receiving help. Build trust through transparency.', icon: MessageSquare },
              { title: 'Student Dashboard', desc: 'Track your skills, requests, and activity in one clean overview.', icon: GraduationCap },
              { title: 'Admin Controls', desc: 'Administrators can manage users, skills, requests, and moderate content.', icon: Shield },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-emerald-200 transition-all">
                  <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to start exchanging skills?</h2>
          <p className="mt-3 text-emerald-50">Join your campus community today. It's free and takes less than a minute.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-lg transition-all hover:scale-105"
            >
              Create Your Account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white border-2 border-white/30 hover:bg-white/10 font-semibold transition-all"
            >
              Already have an account? Login
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-emerald-50 text-sm">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Free forever</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Student-focused</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
