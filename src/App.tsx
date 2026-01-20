import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import LandingPage from './components/LandingPage';

function App() {
  const { user, loading } = useAuth();

  // Check for legal pages
  const path = window.location.pathname;
  if (path === '/terms-of-service') {
    return <TermsOfService />;
  }
  if (path === '/privacy-policy') {
    return <PrivacyPolicy />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (path === '/login' || path === '/signup') {
    return <Auth />;
  }

  return <LandingPage />;
}

export default App;
