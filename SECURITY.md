# Security Documentation - AniSphere

## Security Measures Implemented

### 1. **Input Validation & Sanitization**

- ✅ **Email Validation**: Regex-based email format validation
- ✅ **Username Validation**: Alphanumeric, underscore, dash only (3-20 chars)
- ✅ **Password Validation**: Minimum 6 characters
- ✅ **Search Query Sanitization**: Removes potentially dangerous characters
- ✅ **Integer Validation**: Range checks for numeric inputs
- ✅ **Content Length Limits**: 
  - Post titles: 200 characters max
  - Post content: 5000 characters max
  - Search queries: 100 characters max

**Location**: `lib/utils/validation.ts`

### 2. **XSS Prevention**

- ✅ **HTML Escaping**: Utility functions to escape HTML entities
- ✅ **Content Sanitization**: Removes script tags and event handlers
- ✅ **React's Built-in Protection**: React automatically escapes content in JSX

**Location**: `lib/utils/xss.ts`

### 3. **Rate Limiting**

- ✅ **API Rate Limiting**: Prevents abuse of API endpoints
  - Kitsu API: 60 requests/minute per IP
  - Jikan API: 10 requests/minute per IP (respects their limit)
  - AniList API: 30 requests/minute per IP
- ✅ **Automatic Cleanup**: Old rate limit records are cleaned up

**Location**: `lib/utils/rate-limit.ts`, applied in all API routes

### 4. **Authentication & Authorization**

- ✅ **Supabase Auth**: Secure authentication with JWT tokens
- ✅ **Protected Routes**: Middleware checks authentication before allowing access
- ✅ **Session Management**: Secure cookie-based session handling
- ✅ **OAuth Security**: Google & GitHub OAuth with proper redirect handling

**Locations**: 
- `middleware.ts` - Route protection
- `app/(auth)/` - Login/Register pages
- `lib/supabase/` - Auth client setup

### 5. **Database Security**

- ✅ **Row Level Security (RLS)**: Enabled on all tables
- ✅ **RLS Policies**: User-specific data access policies
- ✅ **Parameterized Queries**: Supabase uses parameterized queries (prevents SQL injection)
- ✅ **Foreign Key Constraints**: Proper relationships with CASCADE deletes
- ✅ **Data Validation**: Database-level constraints (CHECK, ENUM types)

**Location**: `supabase/migrations/20240101000000_initial_schema.sql`

### 6. **Environment Variables**

- ✅ **Secure Storage**: All sensitive credentials in `.env.local`
- ✅ **Git Ignore**: `.env.local` is in `.gitignore`
- ✅ **Public Variables**: Only `NEXT_PUBLIC_*` variables exposed to client
- ✅ **Service Role Key**: Never exposed to client (only anon key)

**Locations**: 
- `.env.local` - Environment variables (not committed)
- `.gitignore` - Ensures env files not committed

### 7. **API Security**

- ✅ **Input Validation**: All API routes validate and sanitize inputs
- ✅ **Error Handling**: Proper error messages without exposing internals
- ✅ **CORS**: Handled by Next.js (configurable in `next.config.js`)
- ✅ **HTTPS**: Should be enforced in production (Vercel does this automatically)

**Locations**: `app/api/*/route.ts`

### 8. **Dependencies Security**

- ✅ **Regular Updates**: Dependencies updated to latest secure versions
  - Next.js: 14.2.33 (latest with security patches)
  - @supabase/ssr: 0.7.0 (fixed cookie vulnerability)
- ✅ **npm audit**: No known vulnerabilities after updates

**Command**: `npm audit` - Run regularly to check for vulnerabilities

## Security Checklist

### Before Deployment

- [ ] Review all RLS policies in Supabase dashboard
- [ ] Ensure `.env.local` is not committed to git
- [ ] Verify OAuth redirect URLs in Supabase dashboard
- [ ] Test authentication flows (login, register, OAuth)
- [ ] Verify rate limiting works correctly
- [ ] Test input validation with malicious inputs
- [ ] Ensure HTTPS is enabled in production
- [ ] Review and update dependencies: `npm audit`
- [ ] Configure proper CORS if needed
- [ ] Set up monitoring and logging

### Regular Maintenance

- [ ] Monthly dependency updates: `npm update`
- [ ] Security audits: `npm audit`
- [ ] Review Supabase security logs
- [ ] Monitor for suspicious activity
- [ ] Keep Next.js and Supabase packages updated

## Known Security Considerations

### 1. **Rate Limiting**
Current implementation uses in-memory storage. For production at scale, consider:
- Redis-based rate limiting
- Dedicated rate limiting service (e.g., Upstash)

### 2. **Service Worker**
The service worker caches content. Ensure sensitive data is not cached.

### 3. **API Keys**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed to client (this is safe with RLS)
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client

### 4. **User-Generated Content**
- Club posts and comments are stored as-is
- Display content using React's built-in XSS protection
- Consider adding content moderation

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
1. Do not open a public issue
2. Contact the maintainers privately
3. Allow time for the issue to be fixed before disclosure

