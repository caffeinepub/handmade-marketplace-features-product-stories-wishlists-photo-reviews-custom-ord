import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';

export function Header() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Handmade</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            to="/"
            className="text-sm font-medium transition-colors hover:text-primary"
            activeProps={{ className: 'text-primary' }}
          >
            Home
          </Link>
          {isAuthenticated && (
            <Link
              to="/wishlist"
              className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: 'text-primary' }}
            >
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
            </Link>
          )}
          <Button onClick={handleAuth} disabled={isLoggingIn} variant={isAuthenticated ? 'outline' : 'default'}>
            {isLoggingIn ? 'Loading...' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </nav>
      </div>
    </header>
  );
}
