PHASE 1 — AUDIT CURRENT ARCHITECTURE

Sebelum melakukan perubahan besar, audit repository secara menyeluruh.

Cari dan identifikasi:

1. Client Components

Cari semua:

"use client"

Kelompokkan menjadi:

benar-benar membutuhkan client
sebenarnya bisa menjadi Server Component
component yang menjadi client hanya karena child component
component yang menggunakan browser API
component yang menggunakan state/interactivity

Jangan otomatis menghapus "use client".

2. Client-side data fetching

Cari pattern seperti:

useEffect()

yang digunakan untuk:

fetch Supabase
fetch API
load page data
load destination
load events
load news
load gallery
load categories
load CMS data

Identifikasi semua initial data fetching yang sebenarnya dapat dilakukan di Server Component.

3. Supabase queries

Audit seluruh query Supabase.

Cari:

supabase.from(...)

dan tentukan:

query dijalankan dari server atau browser
apakah query mengambil data terlalu banyak
apakah menggunakan select("*")
apakah ada unnecessary nested relations
apakah ada filtering yang seharusnya dilakukan database
apakah ada pagination
apakah query memiliki index yang sesuai
apakah query dijalankan berulang kali
apakah query dapat di-cache
4. Loading states

Cari semua:

loading.tsx
loading.ts
isLoading
loading
Memuat halaman
Memuat...
Skeleton
Spinner

Tentukan mana yang:

benar-benar diperlukan
muncul karena client-side fetching
terlalu global
menyebabkan seluruh halaman terlihat loading
seharusnya diganti dengan streaming/skeleton lokal
5. Middleware

Audit:

middleware.ts

Periksa apakah middleware melakukan:

Supabase authentication
session refresh
database request
redirect
logic yang berjalan pada terlalu banyak route

Pastikan middleware tidak menyebabkan unnecessary latency pada public pages.

6. Layout architecture

Audit:

app/layout.tsx
app/**/layout.tsx

Cari:

provider yang menyebabkan seluruh app menjadi Client Component
Supabase client initialization
authentication provider
global loading state
unnecessary data fetching
context yang membuat terlalu banyak component harus "use client"
PHASE 2 — DEFINE CORRECT RENDERING STRATEGY

Buat matrix untuk setiap major route.

Contoh:

Route	Current	Recommended	Reason
/	?	Static/ISR	Mostly public content
/destinasi	?	Server + ISR	Public content
/destinasi/[slug]	?	Server + ISR	SEO/public
/event	?	Server/ISR	Public content
/event/[slug]	?	Server/ISR	Public content
/berita	?	Server/ISR	Public content
/berita/[slug]	?	Server/ISR	SEO
/kuliner	?	Server/ISR	Public content
/galeri	?	Server/ISR	Public content
/maps	?	Server + Client	Interactive map
/search	?	Dynamic	User query
/admin	?	Dynamic	Authenticated
/login	?	Dynamic	Auth

Do not assume every page needs SSR.

Choose between:

Static
ISR / revalidation
Dynamic Server Rendering
Client Component

based on actual requirements.

PHASE 3 — REFACTOR PUBLIC PAGES

Prioritize public pages first.

The target pattern should generally look like:

// Server Component

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <DestinationPage
      destinations={destinations}
    />
  );
}

Create a service/data-access layer where appropriate:

lib/
├── supabase/
│   ├── server.ts
│   └── client.ts
│
├── services/
│   ├── destinations.ts
│   ├── events.ts
│   ├── news.ts
│   └── galleries.ts
│
└── queries/

The exact folder structure may follow the existing project's conventions.

Do not introduce unnecessary abstractions if the project is small.

PHASE 4 — SERVER VS CLIENT COMPONENT BOUNDARIES

Refactor pages so that only interactive portions are Client Components.

Example:

Destination Page
│
├── Header                 Server
├── Hero                   Server
├── Description            Server
├── Category Filter        Client
├── Destination Cards     Server
├── Map                    Client
└── Footer                 Server

Avoid:

"use client"

export default function EntirePage() {
   // entire page becomes client
}

just because one child needs interactivity.

Use the smallest possible Client Component boundary.

PHASE 5 — DATA FETCHING

For initial public content:

Prefer:

Server Component
 ↓
Server-side Supabase query
 ↓
Render

over:

Client Component
 ↓
useEffect()
 ↓
Supabase
 ↓
setState()
 ↓
render

However, retain client-side fetching when it is genuinely necessary, such as:

interactive search
live filters
user-specific data
geolocation
map interactions
realtime functionality
user actions

Do not blindly convert everything to Server Components.

PHASE 6 — CACHING / ISR

Identify content that doesn't need to be fetched from Supabase on every request.

Likely candidates:

destinations
destination detail
news
articles
event listings
event details
categories
public CMS content

Use an appropriate Next.js caching/revalidation strategy.

For example, conceptually:

Public content
 ↓
Next.js cache
 ↓
Supabase

rather than:

Every visitor
 ↓
Supabase query

Choose reasonable revalidation periods based on content type.

For example:

News: relatively short
Events: short/moderate
Destinations: longer
Static information: longer

Do not hardcode arbitrary values without explaining the reasoning.

PHASE 7 — DATABASE QUERY OPTIMIZATION

Audit Supabase/PostgreSQL queries.

Avoid unnecessarily broad queries such as:

.select("*")

when only specific fields are needed.

Prefer selecting only required fields.

Example:

.select(`
  id,
  name,
  slug,
  thumbnail,
  category
`)

Check for:

pagination
filtering at database level
sorting at database level
indexes
foreign keys
unnecessary joins
N+1 queries
duplicate queries

For list pages, never fetch thousands of records if the UI only displays 12–24 items.

Implement pagination/infinite loading where appropriate.

PHASE 8 — PARALLEL DATA FETCHING

Find sequential requests like:

const destinations = await getDestinations();
const events = await getEvents();
const news = await getNews();

when these requests are independent.

Consider:

const [
  destinations,
  events,
  news
] = await Promise.all([
  getDestinations(),
  getEvents(),
  getNews()
]);

Only do this where the queries are genuinely independent.

PHASE 9 — IMAGE PERFORMANCE

This is a tourism website and is expected to be image-heavy.

Audit all major images.

Check:

next/image
image dimensions
responsive sizing
lazy loading
priority loading for above-the-fold hero
WebP/AVIF support
image quality
Supabase Storage image sizes
thumbnails vs original images

Do not load original 3000–6000px images for small cards.

Use appropriate image variants/sizes where possible.

Pay special attention to:

Homepage Hero
Destination Cards
News Cards
Gallery
Event Images
Maps-related images
PHASE 10 — NAVIGATION EXPERIENCE

The website should feel fast when navigating.

Audit:

<Link>
prefetching
route transitions
loading states
unnecessary full page reloads
client-side navigation
global loading overlays

Do not create a global loading screen that blocks the entire application unless genuinely necessary.

If a page has multiple independent sections, prefer localized loading/streaming where appropriate.

PHASE 11 — SEO

Because this is a public tourism information platform, SEO is important.

Make sure public content is rendered in a way that search engines can access.

Check:

Server Components
metadata
dynamic metadata
canonical URLs
sitemap
robots
Open Graph
structured data where appropriate
semantic HTML

Especially:

/destinasi/[slug]
/berita/[slug]
/event/[slug]

These pages should have their content available without relying exclusively on client-side JavaScript fetching.