'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { SignInModal } from '@/components/SignInModal';
import { UserMenu } from '@/components/UserMenu';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { itemCount, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check user authentication status
    const checkUser = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    checkUser();
  }, []);

  const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/search', label: 'Search' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const actionLinks = [
    { href: '/quotes', label: 'Quotes' },
    { href: '/bulk-orders', label: 'Bulk Orders' },
    { href: '/contact-requests', label: 'Contact Requests' },
  ];

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-md'
          : 'bg-white/80 backdrop-blur-lg border-b border-gray-200'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-xl md:text-2xl font-bold tracking-tight transition-transform group-hover:scale-105">
              BuildStop{' '}
              <span className="text-primary">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Actions Dropdown/Section */}
            <div className="relative group">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                Actions
              </button>
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {actionLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all group"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary/90 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1 animate-in zoom-in duration-200">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <UserMenu />
            ) : (
              <Button
                onClick={() => setIsSignInModalOpen(true)}
                variant="default"
                className="ml-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all"
              >
                Sign In
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button & Cart */}
          <div className="md:hidden flex items-center gap-2">
            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary/90 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Actions Section */}
            <div className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </div>
            {actionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors ml-4"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="px-4 py-3 border-t border-gray-200">
                <UserMenu />
              </div>
            ) : (
              <Button
                onClick={() => {
                  setIsSignInModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                variant="default"
                className="w-full mt-4 bg-gradient-to-r from-primary to-primary/90"
              >
                Sign In
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>

    <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />
    </>
  );
}
