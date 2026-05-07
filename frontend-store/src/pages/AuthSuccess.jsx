import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { brandAssets } from '../data/assets';

// Landing page after Google OAuth redirect
// Backend sets httpOnly cookies before redirecting here
export default function AuthSuccess() {
  const navigate = useNavigate();
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    // Fetch user info using the cookie that was just set by backend
    fetchMe()
      .then(() => {
        toast.success('Signed in successfully!');
        navigate('/', { replace: true });
      })
      .catch(() => {
        toast.error('Sign-in failed. Please try again.');
        navigate('/login', { replace: true });
      });
  }, [fetchMe, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100">
      <div className="flex flex-col items-center gap-4">
        <img src={brandAssets.logo} alt="Loading..." className="h-12 w-auto animate-pulse" />
        <p className="text-brand-primary font-semibold text-lg">Signing you in...</p>
      </div>
    </div>
  );
}

