# Quick Start: Testing Authentication

## Prerequisites
✅ Supabase project created
✅ `.env.local` configured with Supabase credentials
✅ Frontend dependencies installed (`npm install`)

## Step 1: Apply Database Migrations (5 minutes)

### Option A: Supabase Dashboard (Easiest)
1. Open your Supabase project: https://app.supabase.com/project/YOUR_PROJECT_ID/sql
2. Create a new query
3. Copy the contents of `supabase-migrations/001_create_user_profiles.sql`
4. Paste and click "Run"
5. Create another new query
6. Copy the contents of `supabase-migrations/002_update_cart_items_for_auth.sql`
7. Paste and click "Run"

### Option B: Using CLI
```bash
npx tsx apply-migrations.ts
```

## Step 2: Start the Development Server (1 minute)

```bash
cd frontend
npm run dev
```

Visit: http://localhost:3000

## Step 3: Test Authentication Flow

### Test 1: Sign Up with Email
1. Click "Sign In" in the header
2. Click "Don't have an account? Sign up"
3. Enter email: `test@example.com`
4. Enter password: `testpass123`
5. Click "Create Account"
6. ✅ Success message should appear
7. ✅ You should be signed in
8. ✅ User menu should appear in header

### Test 2: View Profile
1. Click on your avatar/name in the header
2. Click "Profile"
3. ✅ Should see profile page with your info
4. ✅ Member since date shown

### Test 3: Set Location Preferences
1. From profile page, click "Preferences" button
2. Or click avatar → "Preferences"
3. Click "Use My Current Location" (allow location access)
4. ✅ Location should auto-populate
5. Or manually enter:
   - Location Name: "San Francisco, CA"
   - Latitude: 37.7749
   - Longitude: -122.4194
6. Click "Save Preferences"
7. ✅ Success message should appear
8. ✅ Location should show on profile

### Test 4: Cart Sync
1. Sign out
2. Browse to `/search` or homepage
3. Add some items to cart (as guest)
4. Click "Sign In"
5. Sign in with your test account
6. ✅ Cart items should persist
7. ✅ Cart badge should show correct count

### Test 5: Protected Routes
1. Sign out
2. Try to visit: http://localhost:3000/profile
3. ✅ Should redirect to sign-in page
4. Sign in
5. Visit profile again
6. ✅ Should load successfully

### Test 6: Sign Out
1. Click avatar in header
2. Click "Sign Out"
3. ✅ Should be signed out
4. ✅ Sign In button should reappear
5. ✅ New guest session created

## Step 4: Verify Database (Optional)

1. Go to Supabase dashboard
2. Click "Table Editor" → "user_profiles"
3. ✅ Should see your user profile
4. Check the location fields are populated
5. Click "Table Editor" → "cart_items"
6. ✅ Should see any cart items

## Step 5: Test Google OAuth (Optional)

### Setup
1. Go to Supabase dashboard → Authentication → Providers
2. Enable "Google"
3. Get credentials from Google Cloud Console
4. Add redirect URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

### Test
1. Click "Sign In"
2. Click "Continue with Google"
3. ✅ Should redirect to Google
4. ✅ After approval, redirect back to app
5. ✅ Should be signed in

## Troubleshooting

### "Migration failed"
- Ensure you're running SQL in correct Supabase project
- Check for syntax errors in the SQL
- Try running each statement separately

### "Sign up fails"
- Check browser console for errors
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
- Ensure migrations were applied

### "Profile not created"
- Check trigger exists in Supabase: Run in SQL editor:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- If not present, re-run migration 001

### "Cart items disappear"
- Check localStorage for `guest_session_id`
- Open browser DevTools → Console
- Type: `localStorage.getItem('guest_session_id')`
- Should return a UUID string

### "Can't access profile page"
- Sign out and sign in again
- Check middleware is working
- Verify you're not in private browsing mode

### Build errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Next Steps

Once authentication is working:

1. **Customize profile fields** - Edit `user_profiles` table
2. **Add more OAuth providers** - GitHub, Facebook, etc.
3. **Implement password reset** - Add reset password UI
4. **Add email verification** - Enable in Supabase settings
5. **Create admin roles** - Add role-based access control

## Files You Can Customize

- `frontend/components/SignInModal.tsx` - Auth modal styling
- `frontend/app/profile/page.tsx` - Profile page layout
- `frontend/app/profile/preferences/page.tsx` - Preferences form
- `frontend/components/UserMenu.tsx` - User dropdown menu
- `supabase-migrations/*.sql` - Database schema

## Support

If you encounter issues:

1. Check browser console (F12 → Console)
2. Check Supabase logs (Dashboard → Logs)
3. Review `AUTHENTICATION_SETUP.md` for detailed docs
4. Check Supabase documentation: https://supabase.com/docs

## Success Indicators

✅ You can sign up with email/password
✅ You can sign in
✅ Profile page loads with your info
✅ You can update location preferences
✅ Cart items persist when signing in
✅ Protected routes redirect to sign-in
✅ Sign out works correctly

If all these work, authentication is fully functional! 🎉
