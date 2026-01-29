'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, MapPin, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UserProfile {
  full_name: string | null;
  location_name: string | null;
}

export function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('full_name, location_name')
          .eq('user_id', user.id)
          .single();

        setProfile(profileData);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  if (!user) {
    return null;
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:inline">{displayName}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>

            {/* Location */}
            {profile?.location_name && (
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{profile.location_name}</span>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Profile</span>
            </Link>

            <Link
              href="/profile/preferences"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Preferences</span>
            </Link>

            <hr className="my-2" />

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-50 transition-colors text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
