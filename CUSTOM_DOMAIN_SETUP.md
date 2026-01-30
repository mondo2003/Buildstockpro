# Custom Domain Setup Guide for BuildStock Pro

This comprehensive guide walks you through setting up a custom domain for BuildStock Pro, covering both the frontend (Vercel) and backend (Railway) components.

## Table of Contents

1. [Domain Acquisition](#1-domain-acquisition)
2. [Vercel Domain Configuration (Frontend)](#2-vercel-domain-configuration-frontend)
3. [Railway Domain Configuration (Backend)](#3-railway-domain-configuration-backend)
4. [Environment Variable Updates](#4-environment-variable-updates)
5. [Testing Your Setup](#5-testing-your-setup)
6. [Troubleshooting](#6-troubleshooting)
7. [Checklist](#7-checklist)

---

## 1. Domain Acquisition

### 1.1 Recommended Domain Registrars

Choose a reputable registrar for your domain:

- **Namecheap** (namecheap.com) - Excellent pricing, free WHOIS privacy
- **Cloudflare Registrar** (cloudflare.com) - At-cost pricing, free privacy
- **Google Domains** (domains.google) - Clean interface, free privacy (being sold to Squarespace)
- **Porkbun** (porkbun.com) - Low prices, free privacy, great support
- **GoDaddy** (godaddy.com) - Widely known, but often more expensive

### 1.2 Choosing a Domain Name

Consider these factors:

**Best Practices:**
- Keep it short and memorable (under 15 characters ideal)
- Easy to spell and pronounce
- Avoid hyphens and numbers if possible
- Choose appropriate TLD (.com, .co, .io for tech)
- Check for trademark conflicts

**Examples for BuildStock Pro:**
- `buildstock.pro` (you already own this!)
- `buildstockpro.com`
- `buildstock.app`
- `buildstock.io`

### 1.3 Purchasing Your Domain

1. Create an account with your chosen registrar
2. Search for your desired domain
3. Add to cart and complete purchase
4. Enable WHOIS privacy protection (usually free)
5. **Important:** Keep your login credentials secure

**Estimated Cost:** $10-15/year for .com domains

---

## 2. Vercel Domain Configuration (Frontend)

### 2.1 Understanding Vercel's Domain Options

Vercel offers two approaches:

1. **Vercel-hosted DNS** (Recommended for simplicity)
   - Vercel manages your DNS records
   - Automatic SSL certificate management
   - Faster setup

2. **Self-hosted DNS** (If you want to keep DNS with your registrar)
   - You manage DNS records at your registrar
   - More control but more complex setup

This guide covers both approaches.

### 2.2 Adding Your Domain in Vercel

#### Step 1: Access Domain Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `buildstock-pro` project
3. Go to **Settings** → **Domains**

#### Step 2: Add Your Domain

1. Click **Add Domain**
2. Enter your domain name (e.g., `buildstock.pro` or `www.buildstock.pro`)
3. Choose your preferred option:
   - **Recommended:** Add both `buildstock.pro` and `www.buildstock.pro`
   - Vercel will automatically redirect www to the root domain (or vice versa)

### 2.3 Option A: Using Vercel DNS (Recommended)

#### Step 1: Update Nameservers

1. After adding your domain, Vercel will show you nameserver addresses:
   ```
   NS1: ns1.vercel-dns.com
   NS2: ns2.vercel-dns.com
   ```

2. Go to your domain registrar (where you bought the domain)
3. Find **DNS Management** or **Nameservers**
4. Change nameservers to Vercel's nameservers
5. Save changes

#### Step 2: Wait for Propagation

- Nameserver changes typically take 2-24 hours
- Vercel will automatically detect the change
- You'll receive an email when your domain is active

#### Step 3: Verify DNS Configuration

Vercel will automatically create these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| A | @ | 76.76.19.19 |
| CNAME | www | cname.vercel-dns.com |

### 2.4 Option B: Self-Hosted DNS (Keep DNS at Registrar)

#### Step 1: Choose DNS Records to Add

Vercel will show you the DNS records to add. You'll see two options:

**For A Records (Root Domain):**
```
Type: A
Name: @ (or your domain name)
Value: 76.76.21.21
TTL: 3600 (or default)
```

Add a second A record:
```
Type: A
Name: @ (or your domain name)
Value: 76.76.19.19
TTL: 3600 (or default)
```

**For CNAME (www subdomain):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or default)
```

#### Step 2: Add Records at Your Registrar

1. Log into your domain registrar
2. Find **DNS Management** or **DNS Settings**
3. Add the DNS records shown in Vercel
4. Save changes

**Example Configuration for buildstock.pro:**

| Type | Host/Name | Value/Points to | TTL |
|------|-----------|-----------------|-----|
| A | @ | 76.76.21.21 | 3600 |
| A | @ | 76.76.19.19 | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |

#### Step 3: Verify in Vercel

1. Return to Vercel dashboard
2. Click **Verify** next to your domain
3. Wait for DNS propagation (usually 30 minutes to 24 hours)

### 2.5 Configuring Domain Redirects

#### Setting www → Root Domain Redirect

1. In Vercel Dashboard, go to **Domains** settings
2. Find your www domain (e.g., `www.buildstock.pro`)
3. Click **Edit**
4. Set redirect to your root domain:
   - **From:** `www.buildstock.pro`
   - **To:** `buildstock.pro`
5. Save

Or set Root → www if you prefer:
- **From:** `buildstock.pro`
- **To:** `www.buildstock.pro`

### 2.6 Automatic HTTPS

Vercel automatically:
- Generates SSL certificates via Let's Encrypt
- Enables HTTPS for your custom domain
- Forces HTTPS redirects (HTTP → HTTPS)
- Handles certificate renewal automatically

**No manual action required!**

### 2.7 Deployment Configuration

Your `vercel.json` already has the correct structure:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

No changes needed for custom domain support.

---

## 3. Railway Domain Configuration (Backend)

Railway provides custom domain support for your backend API.

### 3.1 Understanding Railway Domain Setup

Railway domains require:
- Custom domain in Railway dashboard
- CNAME record at your DNS provider
- Automatic SSL provisioning

### 3.2 Adding Your Domain in Railway

#### Step 1: Access Your Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your BuildStock Pro backend project
3. Click on your backend service

#### Step 2: Add Custom Domain

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your subdomain, for example:
   - `api.buildstock.pro` (recommended)
   - Or any subdomain you prefer
4. Click **Add**

**Note:** Railway typically requires a subdomain (CNAME), not a root domain.

#### Step 3: Configure DNS

Railway will show you the CNAME record to add:

```
Type: CNAME
Name: api
Value: [your-railway-generated-id].railway.app
TTL: 3600
```

Example:
```
Type: CNAME
Host: api
Points to: buildstock-pro-backend.up.railway.app
TTL: 3600
```

#### Step 4: Add DNS Record at Your Registrar

1. Go to your domain registrar's DNS management
2. Add the CNAME record shown in Railway
3. Save changes

**Example for buildstock.pro:**

| Type | Host/Name | Value/Points to | TTL |
|------|-----------|-----------------|-----|
| CNAME | api | buildstock-pro-backend.up.railway.app | 3600 |

### 3.3 Enabling HTTPS

Railway automatically:
- Provision SSL certificate via Let's Encrypt
- Enable HTTPS for your custom domain
- Handle certificate renewal

**No manual action required!**

Wait 5-10 minutes after DNS propagation for SSL to provision.

### 3.4 Verifying Your Railway Domain

1. Return to Railway dashboard
2. Check for green checkmark next to your domain
3. Test access: `https://api.buildstock.pro/health`

---

## 4. Environment Variable Updates

After configuring your custom domains, update environment variables.

### 4.1 Update Railway Backend Variables

#### Step 1: Access Railway Variables

1. Go to Railway Dashboard
2. Select your backend project
3. Go to **Variables** tab

#### Step 2: Update CORS_ORIGIN

Change:
```
CORS_ORIGIN=https://buildstock.pro
```

To (if using www):
```
CORS_ORIGIN=https://www.buildstock.pro
```

**Important:** Include the protocol (https://) and no trailing slash.

#### Step 3: Update Other Variables

If you have any hardcoded URLs, update them:

```
# Example (if you have these)
FRONTEND_URL=https://buildstock.pro
ALLOWED_ORIGINS=https://buildstock.pro,https://www.buildstock.pro
```

#### Step 4: Redeploy

After updating variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete (~2-3 minutes)

### 4.2 Update Vercel Frontend Variables

#### Step 1: Access Vercel Variables

1. Go to Vercel Dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**

#### Step 2: Update NEXT_PUBLIC_API_URL

Change from Railway default:
```
NEXT_PUBLIC_API_URL=https://buildstock-pro-backend.up.railway.app
```

To your custom domain:
```
NEXT_PUBLIC_API_URL=https://api.buildstock.pro
```

#### Step 3: Update Supabase Variables (if needed)

Your Supabase configuration shouldn't change, but verify:

```
NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (your existing key)
```

#### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest production deployment
3. Wait for deployment to complete (~2-3 minutes)

### 4.3 Additional URLs to Check

Search your codebase for any hardcoded URLs:

**Frontend:**
- `/buildstock-pro/frontend/.env.production`
- `/buildstock-pro/frontend/.env.local`

**Backend:**
- `/buildstock-pro/backend/.env.production`
- Any API endpoints in code

**Example Search Commands:**
```bash
# Search for railway.app references
grep -r "railway.app" /Users/macbook/Desktop/buildstock.pro/buildstock-pro

# Search for vercel.app references
grep -r "vercel.app" /Users/macbook/Desktop/buildstock.pro/buildstock-pro
```

---

## 5. Testing Your Setup

### 5.1 DNS Propagation Check

#### Check Globally

Use online tools to verify DNS propagation:

- [DNSChecker](https://dnschecker.org/) - Enter your domain and check A/CNAME records
- [WhatsMyDNS](https://www.whatsmydns.net/) - Check global propagation

**What to check:**
- A records for root domain point to Vercel IPs (76.76.21.21, 76.76.19.19)
- CNAME for www points to cname.vercel-dns.com
- CNAME for api points to your Railway domain

#### Local Check

Use `dig` or `nslookup`:

```bash
# Check root domain
dig buildstock.pro

# Check www subdomain
dig www.buildstock.pro

# Check API subdomain
dig api.buildstock.pro
```

**Expected Results:**
- Root domain returns A records with Vercel IPs
- www returns CNAME pointing to cname.vercel-dns.com
- api returns CNAME pointing to Railway

#### Clear Local DNS Cache

If testing locally:

**Mac:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Windows:**
```cmd
ipconfig /flushdns
```

**Linux:**
```bash
sudo systemd-resolve --flush-caches
```

### 5.2 SSL Certificate Verification

#### Check SSL Status

**Online Tools:**
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Comprehensive SSL test
- [Why No Padlock](https://www.whynopadlock.com/) - Quick SSL check

**Command Line:**
```bash
# Check SSL certificate
curl -Iv https://buildstock.pro

# Check certificate details
openssl s_client -connect buildstock.pro:443 -servername buildstock.pro
```

**What to Look For:**
- Valid certificate (not self-signed)
- Certificate issued to your domain
- Not expired

**Expected:**
- Vercel and Railway both use Let's Encrypt
- Automatic renewal every 90 days
- Certificate should show as valid

### 5.3 End-to-End Testing

#### Frontend Tests

1. **Access Frontend:**
   ```
   https://buildstock.pro
   https://www.buildstock.pro
   ```

2. **Verify HTTP → HTTPS Redirect:**
   ```
   http://buildstock.pro → Should redirect to https://buildstock.pro
   ```

3. **Test All Pages:**
   - Home page loads
   - Product pages work
   - Cart functions
   - Checkout process
   - Authentication (login/signup)

4. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for console errors
   - Check Network tab for failed requests

#### Backend Tests

1. **Access Backend:**
   ```
   https://api.buildstock.pro/health
   https://api.buildstock.pro/products
   ```

2. **Test API Endpoints:**
   ```bash
   # Health check
   curl https://api.buildstock.pro/health

   # List products
   curl https://api.buildstock.pro/products

   # Test authentication
   curl -X POST https://api.buildstock.pro/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Verify CORS:**
   - Open browser console on frontend
   - Check Network tab for API requests
   - Verify no CORS errors

#### Integration Tests

1. **Frontend → Backend Communication:**
   - Load products on frontend
   - Add items to cart
   - Complete checkout
   - Verify data flows correctly

2. **Authentication Flow:**
   - Sign up new user
   - Log in
   - Access protected routes
   - Verify JWT tokens work

3. **Supabase Integration:**
   - Test database queries
   - Verify real-time subscriptions (if used)
   - Check file uploads (if using Storage)

### 5.4 Performance Testing

#### Check Load Times

```bash
# Test frontend
curl -w "@curl-format.txt" -o /dev/null -s https://buildstock.pro

# Test backend
curl -w "@curl-format.txt" -o /dev/null -s https://api.buildstock.pro/health
```

**Create curl-format.txt:**
```text
time_namelookup:  %{time_namelookup}\n
time_connect:     %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer: %{time_pretransfer}\n
time_redirect:    %{time_redirect}\n
time_starttransfer: %{time_starttransfer}\n
----------\n
time_total:       %{time_total}\n
```

#### Use Online Tools

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

---

## 6. Troubleshooting

### 6.1 DNS Issues

#### Issue: Domain Not Resolving

**Symptoms:**
- "Server not found" error
- "This site can't be reached"

**Solutions:**

1. **Check DNS Propagation:**
   ```bash
   dig buildstock.pro
   nslookup buildstock.pro
   ```

2. **Verify DNS Records:**
   - Log into your registrar
   - Check DNS records match Vercel/Railway instructions
   - Ensure no typos in IP addresses or CNAME targets

3. **Wait Longer:**
   - DNS changes can take 24-48 hours
   - Check propagation status at dnschecker.org

4. **Clear Local Cache:**
   - Flush DNS cache (see Section 5.1)
   - Try different device/network

5. **Verify Nameservers:**
   - If using Vercel DNS, confirm nameservers are set correctly
   - Some registrars have multiple nameserver fields (use all provided)

#### Issue: Intermittent Resolution

**Symptoms:**
- Works sometimes, not others
- Different devices show different results

**Solutions:**

1. **Check TTL Settings:**
   - Lower TTL to 300 seconds during setup
   - Increase to 3600+ after stable

2. **Multiple DNS Records:**
   - Remove old/duplicate DNS records
   - Ensure only one A/CNAME record per name

3. **ISP DNS Caching:**
   - Try Google DNS (8.8.8.8)
   - Try Cloudflare DNS (1.1.1.1)

### 6.2 SSL Certificate Issues

#### Issue: SSL Not Provisioning

**Symptoms:**
- "Your connection is not private"
- "SSL certificate error"

**Solutions:**

1. **Verify DNS Propagation:**
   - SSL provisioning requires DNS to be fully propagated
   - Wait 24 hours after DNS changes

2. **Check CAA Records:**
   - Some domains have CAA records restricting certificate authorities
   - Ensure Let's Encrypt is allowed

3. **Railway-Specific:**
   - Railway requires CNAME (not A record)
   - Cannot use root domain directly

4. **Force Certificate Renewal:**
   - Railway: Remove and re-add domain
   - Vercel: Automatic, but can contact support

#### Issue: Mixed Content Warnings

**Symptoms:**
- Browser blocks resources
- "Mixed content" errors in console

**Solutions:**

1. **Update All URLs to HTTPS:**
   - Check code for http:// references
   - Update to https:// or use protocol-relative URLs

2. **Verify Environment Variables:**
   - All API URLs should use HTTPS
   - No hardcoded HTTP URLs

### 6.3 CORS Issues

#### Issue: CORS Errors After Domain Change

**Symptoms:**
- Browser console shows CORS errors
- API requests blocked
- "Access-Control-Allow-Origin" header issues

**Solutions:**

1. **Update CORS_ORIGIN in Railway:**
   ```
   CORS_ORIGIN=https://buildstock.pro
   ```
   - Match exactly (no trailing slash)
   - Include protocol (https://)

2. **Allow Multiple Origins:**
   If you need both www and non-www:
   ```typescript
   // In backend/src/index.ts
   const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];

   .use(cors({
     origin: (origin) => allowedOrigins.includes(origin) || origin,
     credentials: true,
   }))
   ```

   Then set:
   ```
   CORS_ORIGIN=https://buildstock.pro,https://www.buildstock.pro
   ```

3. **Verify Preflight Requests:**
   - OPTIONS requests should be handled
   - Check Access-Control-Allow-Methods header

4. **Check Case Sensitivity:**
   - `https://buildstock.pro` ≠ `https://BuildStock.pro`

#### Issue: API Not Accessible

**Symptoms:**
- API returns 404 or connection errors
- Health endpoint not responding

**Solutions:**

1. **Verify NEXT_PUBLIC_API_URL:**
   ```
   NEXT_PUBLIC_API_URL=https://api.buildstock.pro
   ```

2. **Test API Directly:**
   ```bash
   curl https://api.buildstock.pro/health
   ```

3. **Check Backend Deployment:**
   - Verify Railway service is running
   - Check deployment logs
   - Ensure PORT=10000 is set

4. **Verify CNAME Record:**
   - api subdomain should point to Railway
   - Check with `dig api.buildstock.pro`

### 6.4 Vercel-Specific Issues

#### Issue: Build Failures After Domain Change

**Solutions:**

1. **Clear Build Cache:**
   - Vercel Dashboard → Settings → Git
   - Clear build cache and redeploy

2. **Check Environment Variables:**
   - Ensure all variables are set for production
   - No missing required variables

3. **Verify Framework Settings:**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Issue: Deployment Domain Still Shows .vercel.app

**Solutions:**

1. **Set Primary Domain:**
   - Vercel Dashboard → Domains
   - Click on your custom domain
   - Set as primary domain

2. **Update Production Branch:**
   - Settings → Git
   - Update production branch domain

### 6.5 Railway-Specific Issues

#### Issue: Service Not Starting

**Solutions:**

1. **Check Deployment Logs:**
   - Railway Dashboard → Deployments
   - View logs for errors
   - Common issues: missing dependencies, wrong PORT

2. **Verify Environment Variables:**
   - PORT=10000
   - NODE_ENV=production
   - All Supabase variables set

3. **Health Check:**
   - Ensure health endpoint exists
   - Returns 200 status

#### Issue: High Latency on Custom Domain

**Solutions:**

1. **DNS Check:**
   - Use `dig` to check resolution
   - Try direct Railway URL: `https://[project].up.railway.app`

2. **Compare Performance:**
   ```bash
   # Custom domain
   time curl https://api.buildstock.pro/health

   # Railway default domain
   time curl https://buildstock-pro.up.railway.app/health
   ```

3. **Contact Railway Support:**
   - If custom domain significantly slower
   - May be DNS routing issue

### 6.6 General Troubleshooting Steps

#### Systematic Approach

1. **Isolate the Problem:**
   - Test frontend directly
   - Test backend directly
   - Test integration

2. **Check Logs:**
   - Vercel deployment logs
   - Railway deployment logs
   - Browser console
   - Network tab in DevTools

3. **Compare Old vs New:**
   - Does old .vercel.app URL work?
   - Does old .railway.app URL work?
   - Compare responses

4. **Rollback if Needed:**
   - Revert environment variables
   - Use temporary default domains
   - Fix issues, then retry

#### Getting Help

**Vercel Support:**
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://www.vercel-status.com/

**Railway Support:**
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app/

**Community Resources:**
- Stack Overflow
- GitHub Issues
- Vercel Community Discord

---

## 7. Checklist

Use this checklist to ensure everything is configured correctly.

### Domain Acquisition

- [ ] Domain purchased from reputable registrar
- [ ] WHOIS privacy enabled
- [ ] Domain login credentials stored securely
- [ ] Auto-renew enabled (optional but recommended)

### Frontend (Vercel)

- [ ] Custom domain added in Vercel dashboard
- [ ] DNS records configured (A records or nameservers)
- [ ] www subdomain configured with redirect
- [ ] HTTPS enabled (automatic)
- [ ] Primary domain set correctly
- [ ] Deployment successful on custom domain
- [ ] All pages load correctly
- [ ] HTTP redirects to HTTPS

### Backend (Railway)

- [ ] Custom domain (subdomain) added in Railway
- [ ] CNAME record configured at registrar
- [ ] HTTPS enabled (automatic)
- [ ] Service responding on custom domain
- [ ] Health check endpoint working
- [ ] API endpoints accessible

### Environment Variables

**Railway (Backend):**
- [ ] CORS_ORIGIN updated to frontend domain
- [ ] Any other hardcoded URLs updated
- [ ] Service redeployed after variable changes
- [ ] Variables set to correct environment (Production)

**Vercel (Frontend):**
- [ ] NEXT_PUBLIC_API_URL updated to backend custom domain
- [ ] Supabase variables unchanged (correct)
- [ ] Any other URLs updated
- [ ] Project redeployed after variable changes
- [ ] Variables set to Production environment

### DNS Records

**At Registrar:**

- [ ] A records for root domain → Vercel IPs
- [ ] CNAME for www → cname.vercel-dns.com
- [ ] CNAME for api → Railway domain
- [ ] No conflicting records (old/duplicate)
- [ ] TTL set appropriately (3600 recommended)

### Testing

- [ ] DNS propagation verified (dnschecker.org)
- [ ] SSL certificates valid (ssl labs)
- [ ] Frontend loads on custom domain
- [ ] Backend loads on custom domain
- [ ] Frontend → Backend communication works
- [ ] No CORS errors
- [ ] Authentication works
- [ ] Database operations work
- [ ] No console errors
- [ ] Performance acceptable

### Final Verification

- [ ] Test from multiple devices/networks
- [ ] Test on mobile devices
- [ ] Check all major browsers (Chrome, Firefox, Safari)
- [ ] Verify email links work (if using)
- [ ] Test third-party integrations (if any)
- [ ] Monitor for 24-48 hours for issues

### Documentation

- [ ] Save registrar login credentials
- [ ] Document custom domains for reference
- [ ] Update any documentation with new URLs
- [ ] Notify team of domain change (if applicable)
- [ ] Update any hardcoded URLs in documentation

---

## Quick Reference

### Example DNS Configuration

For `buildstock.pro` with subdomains:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 3600 |
| A | @ | 76.76.19.19 | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |
| CNAME | api | buildstock-pro.up.railway.app | 3600 |

### Environment Variables Summary

**Railway Backend:**
```bash
CORS_ORIGIN=https://buildstock.pro
PORT=10000
NODE_ENV=production
# ... other variables
```

**Vercel Frontend:**
```bash
NEXT_PUBLIC_API_URL=https://api.buildstock.pro
NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (your key)
```

### Useful Commands

```bash
# Check DNS propagation
dig buildstock.pro
dig www.buildstock.pro
dig api.buildstock.pro

# Test SSL
curl -Iv https://buildstock.pro
openssl s_client -connect buildstock.pro:443

# Test API
curl https://api.buildstock.pro/health

# Flush DNS cache (Mac)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Search for hardcoded URLs
grep -r "railway.app" .
grep -r "vercel.app" .
```

### Important URLs

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **DNS Checker:** https://dnschecker.org
- **SSL Labs:** https://www.ssllabs.com/ssltest/
- **WhatsMyDNS:** https://www.whatsmydns.net/

---

## Timeline Estimates

- **Domain Purchase:** 10-15 minutes
- **DNS Configuration:** 15-30 minutes
- **DNS Propagation:** 2-24 hours (usually < 6 hours)
- **SSL Provisioning:** 5-30 minutes (after DNS propagation)
- **Environment Variable Updates:** 15-30 minutes
- **Testing:** 30-60 minutes
- **Total Time:** 4-26 hours (mostly waiting for propagation)

**Pro Tip:** Start the process in the morning to allow DNS propagation to complete during the day.

---

## Support and Resources

### Official Documentation

- **Vercel Domains:** https://vercel.com/docs/concepts/projects/domains
- **Railway Domains:** https://docs.railway.app/guides/domains
- **Next.js Deployment:** https://nextjs.org/docs/deployment

### Community

- **Vercel Discord:** https://vercel.com/discord
- **Railway Discord:** https://discord.gg/railway
- **Stack Overflow:** Tag questions with vercel, railway, next.js

### Emergency Rollback

If critical issues arise:

1. **Revert Environment Variables:**
   - Railway: Change CORS_ORIGIN back
   - Vercel: Change NEXT_PUBLIC_API_URL back

2. **Remove Custom Domain (if needed):**
   - Vercel: Remove domain, use .vercel.app
   - Railway: Remove domain, use .railway.app

3. **Redeploy:**
   - Trigger deployment on both platforms

4. **Fix Issues:**
   - Debug locally
   - Test thoroughly
   - Retry custom domain setup

---

**Last Updated:** 2026-01-30

**Version:** 1.0

**For Questions:** Refer to official documentation or community support channels
