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
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const fullUrl = window.location.href;

    console.log('[Auth] AuthSuccess - Full URL:', fullUrl);
    console.log('[Auth] AuthSuccess callback - URL params:', { 
      accessToken: !!accessToken, 
      refreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length,
      refreshTokenLength: refreshToken?.length,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...${accessToken.substring(accessToken.length - 20)}` : 'N/A',
      refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...${refreshToken.substring(refreshToken.length - 20)}` : 'N/A',
    });

    // If tokens are in URL, save them as non-httpOnly cookies as a fallback
    // This helps in environments where third-party httpOnly cookies are blocked.
    if (accessToken) {
      // Validate token format before saving
      if (typeof accessToken !== 'string' || accessToken.length < 50) {
        console.error('[Auth] ERROR: Invalid access_token format!', { length: accessToken?.length, token: accessToken });
        toast.error('Sign-in failed: Invalid token format. Please try again.');
        navigate('/login', { replace: true });
        return;
      }
      document.cookie = `access_token=${accessToken}; path=/; max-age=900; SameSite=Lax`;
      localStorage.setItem('token', accessToken);
      console.log('[Auth] Access token saved to localStorage, length:', accessToken.length);
    } else {
      console.error('[Auth] ERROR: No access_token in URL params! Google OAuth may have failed.');
      toast.error('Sign-in failed: No access token received. Please try again.');
      navigate('/login', { replace: true });
      return;
    }
    
    if (refreshToken) {
      // Validate token format before saving
      if (typeof refreshToken !== 'string' || refreshToken.length < 50) {
        console.error('[Auth] ERROR: Invalid refresh_token format!', { length: refreshToken?.length, token: refreshToken });
        toast.error('Sign-in failed: Invalid refresh token format. Please try again.');
        navigate('/login', { replace: true });
        return;
      }
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
      localStorage.setItem('refreshToken', refreshToken);
      console.log('[Auth] Refresh token saved to localStorage, length:', refreshToken.length);
    } else {
      console.error('[Auth] ERROR: No refresh_token in URL params! Token extraction failed.');
      toast.error('Sign-in failed: No refresh token received. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    // Verify tokens were saved before making request
    const savedToken = localStorage.getItem('token');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    console.log('[Auth] Verification - tokens in localStorage:', {
      token: !!savedToken,
      refreshToken: !!savedRefreshToken,
      tokenLength: savedToken?.length,
      refreshTokenLength: savedRefreshToken?.length,
      match: {
        accessTokenMatches: savedToken === accessToken,
        refreshTokenMatches: savedRefreshToken === refreshToken,
      }
    });

    if (!savedToken || !savedRefreshToken) {
      console.error('[Auth] CRITICAL: Tokens failed to save to localStorage!');
      toast.error('Sign-in failed: Could not save session tokens. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    // Fetch user info with retry logic for timing issues
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = (attempt) => Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff

    const attemptFetchMe = async () => {
      try {
        await fetchMe();
        console.log('[Auth] fetchMe successful, redirecting to home');
        toast.success('Signed in successfully!');
        navigate('/', { replace: true });
      } catch (err) {
        retryCount++;
        console.error(`[Auth] fetchMe attempt ${retryCount} failed:`, err.message);
        
        if (retryCount < maxRetries) {
          const delay = retryDelay(retryCount - 1);
          console.log(`[Auth] Retrying fetchMe in ${delay}ms...`);
          setTimeout(attemptFetchMe, delay);
        } else {
          console.error('[Auth] fetchMe failed after all retries');
          toast.error('Sign-in failed. Please try again.');
          navigate('/login', { replace: true });
        }
      }
    };

    // Start the attempt
    attemptFetchMe();
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

