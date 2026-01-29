# Authentication Setup Guide

This guide walks you through the authentication system implemented in BuildStock Pro.

## Overview

We're using **Supabase Authentication** with the following features:
- Email/password authentication
- OAuth (Google) integration
- Protected routes
- User profiles with location preferences
- Guest cart to user cart sync on sign-in
- Row Level Security (RLS) for data protection

## Setup Instructions

### 1. Apply Database Migrations

The migrations are in `/supabase-migrations/`. You need to apply them to your Supabase project.

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to https://app.supabase.com/project/your-project-id/sql
2. Copy the contents of `001_create_user_profiles.sql`
3. Paste and run it
4. Copy the contents of `002_update_cart_items_for_auth.sql`
5. Paste and run it

**Option B: Using CLI**
```bash
npx tsx apply-migrations.ts
```

### 2. Configure OAuth Providers

To enable Google OAuth:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Add redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`
5. Save the configuration

### 3. Update Environment Variables

Your `.env.local` should already have:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Enable Email Confirmation (Optional)

To require email confirmation for new users:

1. Go to **Authentication → Settings** in Supabase dashboard
2. Enable **Email Confirmation**
3. Customize email templates if needed

## Authentication Flow

### Sign Up
1. User clicks "Sign In" → Modal opens
2. User enters email/password or clicks "Continue with Google"
3. For email: Confirmation link sent (if enabled)
4. User profile automatically created via trigger
5. Guest cart merged with user cart
6. User redirected to home page

### Sign In
1. User enters credentials
2. Supabase validates and creates session
3. User profile loaded from database
4. Guest cart merged with existing user cart
5. User menu appears in header

### Sign Out
1. User clicks "Sign Out" in menu
2. Session destroyed
3. New guest session created
4. Cart converted to guest cart

## File Structure

```
frontend/
├── app/
│   ├── auth/
│   │   ├── signin/page.tsx          # Sign-in page
│   │   └── callback/route.ts        # OAuth callback handler
│   └── profile/
│       ├── page.tsx                 # User profile page
│       └── preferences/page.tsx     # Location preferences
├── components/
│   ├── SignInModal.tsx              # Authentication modal
│   ├── UserMenu.tsx                 # User dropdown menu
│   └── ProtectedRoute.tsx           # Route protection wrapper
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser Supabase client
│   │   ├── server.ts                # Server Supabase client
│   │   └── middleware.ts            # Auth middleware
│   ├── hooks/
│   │   └── useAuth.ts               # Auth state hook
│   ├── cart-sync.ts                 # Cart merging utilities
│   └── utils/
│       └── guest-session.ts         # Guest session management
├── middleware.ts                    # Next.js middleware
└── types/
    └── supabase.ts                  # TypeScript types

supabase-migrations/
├── 001_create_user_profiles.sql     # User profiles table
└── 002_update_cart_items_for_auth.sql # Cart table updates
```

## Usage Examples

### Protecting a Route

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Your protected content</div>
    </ProtectedRoute>
  );
}
```

### Checking Auth State

```tsx
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Welcome, {user.email}</div>;
}
```

### Accessing User Profile

```tsx
import { createClient } from '@/lib/supabase/client';

async function loadProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return profile;
}
```

### Updating User Location

```tsx
const supabase = createClient();

const { error } = await supabase
  .from('user_profiles')
  .update({
    location_name: 'San Francisco, CA',
    location_lat: 37.7749,
    location_lng: -122.4194,
  })
  .eq('user_id', user.id);
```

## Security Features

### Row Level Security (RLS)

All tables have RLS policies that ensure:
- Users can only see their own data
- Guests can only access cart items via session ID
- Automatic cleanup on user deletion

### Middleware Protection

The Next.js middleware (`middleware.ts`) automatically:
- Protects authenticated routes
- Redirects unauthenticated users to sign-in
- Refreshes user sessions

### Session Management

- Server-side sessions stored securely
- Automatic token refresh
- Session persistence across page reloads

## Troubleshooting

### User profile not created on signup

**Issue**: User signs up but profile is missing

**Solution**: Check that the trigger `on_auth_user_created` exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Cart not syncing on sign-in

**Issue**: Guest cart items disappear after login

**Solution**: Check browser console for errors, verify `localStorage` has `guest_session_id`

### OAuth redirect fails

**Issue**: Google sign-in redirects to error page

**Solution**: Verify redirect URL in Google Cloud Console matches your Supabase project URL

### RLS policies blocking access

**Issue**: Users get "permission denied" errors

**Solution**: Check RLS policies in Supabase dashboard under **Database → Authentication → Policies**

## Testing

Test the authentication flow:

1. **Guest User**: Browse site, add items to cart
2. **Sign Up**: Create account, verify cart persists
3. **Sign Out**: Verify new guest session created
4. **Sign In**: Log in, verify cart restored
5. **OAuth**: Test Google sign-in flow
6. **Protected Routes**: Try accessing `/dashboard` while logged out
7. **Profile**: Update location preferences

## Next Steps

- Add more OAuth providers (GitHub, Facebook, etc.)
- Implement password reset flow
- Add email verification resend
- Create admin role permissions
- Add MFA (multi-factor authentication)
- Implement social account linking

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
