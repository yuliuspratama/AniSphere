# AniSphere

Platform komprehensif untuk tracking, discovery, gamifikasi, dan interaksi sosial seputar anime dan manga.

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **APIs**: Kitsu, Jikan, AniList GraphQL, Anime Facts, Waifu.pics, AnimeChan, Katanime
- **PWA**: Service Worker, Manifest, Offline Support

## Features

### ✅ Completed Features

- **Beranda**: Personalized recommendations, trending anime, anime roulette, watch order guide
- **Koleksiku**: Watchlist management, release calendar, shared lists, progress tracker
- **Arena Komunitas**: Fantasy league, quizzes, badges, bingo challenges, clubs
- **Jelajah**: Advanced search, trend dashboard, staff profiles, anime/manga detail pages
- **Profil**: User statistics, badges showcase, league team, review wall, favorite quotes
- **PWA**: Installable app, service worker, offline support

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   
   Create a `.env.local` file in the root directory with the following variables:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   **Important**: 
   - Get these values from your Supabase project dashboard: https://app.supabase.com
   - Never commit `.env.local` to version control (it's already in `.gitignore`)
   - Only use `NEXT_PUBLIC_*` variables for client-side code
   - Never expose your service role key!

3. Run database migrations:
- Go to Supabase Dashboard → SQL Editor
- Run the SQL from `supabase/migrations/20240101000000_initial_schema.sql`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components
  - `anime/` - Anime-specific components
  - `collection/` - Watchlist and collection components
  - `community/` - Community and gamification components
  - `explore/` - Search and discovery components
  - `profile/` - User profile components
  - `pwa/` - PWA-related components
- `lib/` - Utility functions, API clients, hooks
- `types/` - TypeScript type definitions
- `supabase/` - Database migrations and Supabase config
- `public/` - Static assets, PWA manifest, service worker

## PWA Features

AniSphere is a Progressive Web App (PWA) with:

- **Installable**: Users can install the app on their devices
- **Offline Support**: Service worker caches pages and assets
- **App-like Experience**: Standalone display mode
- **Fast Loading**: Cached resources for better performance

To test PWA features:
1. Build the app: `npm run build`
2. Serve it: `npm start`
3. Open in Chrome/Edge
4. Check "Add to Home Screen" prompt

## Database Setup

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the migration file: `supabase/migrations/20240101000000_initial_schema.sql`
4. Configure Row Level Security (RLS) policies as needed

## API Configuration

The app uses multiple free APIs:
- **Kitsu API**: Main anime/manga data
- **Jikan API**: MyAnimeList data (rate limited: 2 req/s)
- **AniList GraphQL**: Alternative data source
- **Anime Facts API**: Trivia for quizzes
- **AnimeChan API**: English quotes
- **Katanime API**: Indonesian quotes
- **Waifu.pics**: Character images (SFW only)

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Supabase Setup

1. Create project at supabase.com
2. Run database migrations
3. Configure OAuth providers (Google, GitHub) if needed
4. Set up storage buckets if using file uploads

## PWA Icons

**IMPORTANT**: Create app icons before deploying:
- `public/icon-192x192.png` - 192x192 icon (required for PWA)
- `public/icon-512x512.png` - 512x512 icon (required for PWA)

You can use tools like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

Or generate from a logo/image:
```bash
# Using ImageMagick (if installed)
convert logo.png -resize 192x192 public/icon-192x192.png
convert logo.png -resize 512x512 public/icon-512x512.png
```

## Security

AniSphere has been built with security best practices in mind:

- ✅ Input validation and sanitization
- ✅ XSS prevention utilities
- ✅ Rate limiting on API routes
- ✅ Row Level Security (RLS) enabled on all database tables
- ✅ Secure authentication with Supabase Auth
- ✅ Environment variables properly secured
- ✅ No hardcoded secrets or credentials

See [SECURITY.md](./SECURITY.md) and [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) for detailed security documentation.

**Before pushing to production:**
1. Review all RLS policies in Supabase dashboard
2. Ensure `.env.local` is not committed (already in `.gitignore`)
3. Verify OAuth redirect URLs in Supabase dashboard
4. Run `npm audit` to check for vulnerabilities
5. Test authentication flows
6. Review [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Important**: Never commit:
- `.env.local` or any `.env*` files
- API keys, secrets, or credentials
- `node_modules/` directory
- Build artifacts

## License

MIT
