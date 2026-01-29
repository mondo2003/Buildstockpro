'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, MapPin, Mail, Calendar, Settings, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  full_name: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  preferences: any;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/signin');
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    loadData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const displayName = profile.full_name || user.email?.split('@')[0] || 'User';
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary to-primary/90 h-32"></div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
                <div className="flex items-end gap-6">
                  <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="pb-2">
                    <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/profile/edit">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/profile/preferences">
                      <Settings className="h-4 w-4 mr-2" />
                      Preferences
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Location Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Location</h2>
              </div>
              {profile.location_name ? (
                <div>
                  <p className="text-gray-800 mb-2">{profile.location_name}</p>
                  <p className="text-sm text-gray-500">
                    Coordinates: {profile.location_lat?.toFixed(4)}, {profile.location_lng?.toFixed(4)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">No location set</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/profile/preferences">Set Location</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Account</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-800">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-800">Member since {memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/search">
                  <div className="text-left">
                    <p className="font-semibold">Search Materials</p>
                    <p className="text-xs text-gray-600 mt-1">Find sustainable building materials</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/dashboard">
                  <div className="text-left">
                    <p className="font-semibold">Dashboard</p>
                    <p className="text-xs text-gray-600 mt-1">View your activity and stats</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/profile/preferences">
                  <div className="text-left">
                    <p className="font-semibold">Preferences</p>
                    <p className="text-xs text-gray-600 mt-1">Update your settings</p>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
