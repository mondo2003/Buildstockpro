'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { mergeCartWithUserCart } from '@/lib/cart-sync';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setState({ user, loading: false });
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;

      // When user signs in, merge their guest cart with their user cart
      if (event === 'SIGNED_IN' && user) {
        const guestSessionId = localStorage.getItem('guest_session_id');
        if (guestSessionId) {
          await mergeCartWithUserCart(guestSessionId, user.id);
          localStorage.removeItem('guest_session_id');
        }

        setState({ user, loading: false });
      } else if (event === 'SIGNED_OUT') {
        // Create new guest session on sign out
        const newGuestSessionId = crypto.randomUUID();
        localStorage.setItem('guest_session_id', newGuestSessionId);
        setState({ user: null, loading: false });
      } else {
        setState({ user, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
