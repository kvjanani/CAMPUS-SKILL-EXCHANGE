import { Link } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-red-500 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-sm text-gray-500 mb-6">You don't have permission to access this page. If you believe this is an error, please contact an administrator.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-semibold transition-colors"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
