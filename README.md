# Deplai booking demo

A real, working meeting-booking app: pick a 30-minute slot, leave your details, get a
confirmation. Estonian and English. Built to be both a **public demo** of what Deplai
deploys and a **usable tool** for booking Deplai consultations.

Deliberately small: one container, one SQLite file, no separate database server or API
service. That is the point — a small app should not need heavy infrastructure.

```
app/                  Nuxt pages and components
  pages/index.vue     booking flow (slot picker -> form -> confirmation), markup only
  pages/admin.vue     owner view, /admin?key=...
  composables/useBooking.ts  the flow's state: slots, selection, submit, confirmation
  components/         DemoBanner, SlotPicker, BookingForm, BookingSuccess, header/footer
  assets/css/main.css the whole design system, ~250 lines, no framework
server/
  api/slots.get.ts        available slots for the coming working days
  api/bookings.post.ts    create a booking (rate limited, validated)
  api/admin/bookings.get.ts  owner list, guarded by a key
  routes/sitemap.xml.get.ts  two URLs, one per language, with hreflang
  tasks/demo/reset.ts     nightly wipe of demo data (03:00 UTC)
  utils/                  db.ts (SQLite), slots.ts (times, DST), validation.ts, rate-limit.ts
shared/types/booking.ts   types shared by server and client, plus the guards that narrow to them
i18n/locales/             et.json, en.json — every visible string
public/                   favicon, robots.txt, llms.txt
```

Types are the contract between the two halves: `BookingTopic` and `Locale` are unions, not
`string`, and the only places an unknown value becomes one of them are `validateBookingRequest`
(request bodies) and `toAdminBooking` (rows SQLite hands back as plain text).

## How it works

- **Slots**: weekdays, 09:00–15:00 Estonian time, 30 minutes, 10 working days ahead,
  minimum 2 hours' notice. Times are computed in `Europe/Tallinn` and stored as UTC, so
  daylight saving is handled correctly.
- **No double booking**: `UNIQUE(starts_at)` in SQLite. Two people submitting the same slot
  at the same moment cannot both succeed — the loser gets a translated "pick another time".
- **Tamper-proof**: a posted time is checked against the generated slot list, so a
  handcrafted "Sunday 03:00" is rejected.
- **Demo mode**: a banner above the header, an amber accent, a `Demo` marker in the sticky header, a note on the
  confirmation saying no email is sent and the booking is wiped, and a nightly reset. Set
  `NUXT_PUBLIC_DEMO_MODE=false` and `NUXT_RESET_ENABLED=false` to use it as a real booking tool.

## Design

The same design system as [deplai.eu](https://deplai.eu): the same tokens (light and dark mode
via `prefers-color-scheme`), Geist + Geist Mono self-hosted from npm, 8px/14px radii, the sticky
header and the "d." monogram. One deliberate difference: the accent follows the mode. In demo
mode (`html[data-mode="demo"]`, set in `app.vue`) it is amber (`#B45309`, amber 700, 4.5:1 on
white); with `NUXT_PUBLIC_DEMO_MODE=false` it becomes Deplai green. A visitor who knows
deplai.eu sees at a glance that the demo is a sandbox. The favicon's dot is amber for the same
reason; regenerate it in green if the app is switched to real use.

The flow is two columns: what the meeting is (title, lead, facts) on the left, the booking panel
on the right. One day at a time (a scrollable day strip, then that day's times) instead of every
day stacked, so the times never push the form off screen. The confirmation offers an
"add to calendar" `.ics` file built on the client from `MEETING_MINUTES`.

## Being found

The point of a public demo is that people and models can find it and describe it correctly.

| File | What it does |
|---|---|
| `public/robots.txt` | Allows everything except `/admin`, naming the AI crawlers that only honour a rule addressed to them |
| `public/llms.txt` | Plain-language summary: what the app is, what it does, how it is built |
| `server/routes/sitemap.xml.get.ts` | `/sitemap.xml` with both language URLs and hreflang |
| `app/pages/index.vue` | schema.org `WebPage` + `ReserveAction` JSON-LD |

Canonical and hreflang tags come from `useLocaleHead` in `app/app.vue`; they follow
`NUXT_PUBLIC_SITE_URL`, so set it before going live.

## Development

```bash
npm install
npm run dev          # http://localhost:3000  (/en for English)
npm run typecheck
```

The database is created automatically at `./data/booking.db`.
Owner view: <http://localhost:3000/admin?key=change-me>

## Deploy to Coolify

New Resource → repository → Build Pack **Dockerfile**, port `3000`.

| Setting | Value |
|---|---|
| Persistent volume | `/data` (without it, bookings disappear on every redeploy) |
| Domain | `https://demo.deplai.app` |

Environment variables (note the `NUXT_` prefix — Nuxt maps these onto `runtimeConfig` at
runtime; without the prefix the build-time defaults win):

```
NUXT_DATABASE_PATH=/data/booking.db
NUXT_ADMIN_KEY=<long random string>
NUXT_PUBLIC_SITE_URL=https://demo.deplai.app
NUXT_PUBLIC_DEMO_MODE=true
NUXT_RESET_ENABLED=true
```

Resource limits: 0.5 CPU / 256 MB is plenty.

## Changing things

| What | Where |
|---|---|
| Visible text (both languages) | `i18n/locales/et.json`, `en.json` |
| Meeting times, length, lead time | `server/utils/slots.ts` (`SLOT_TIMES`, `WORKING_DAYS_AHEAD`, `MIN_LEAD_TIME_HOURS`) |
| Topics in the form | `BOOKING_TOPICS` in `shared/types/booking.ts` + `topic_*` keys in both locales |
| Colours and layout | `app/assets/css/main.css` (`--accent*` is the amber demo accent) |
| What crawlers and models are told | `public/robots.txt`, `public/llms.txt`, the JSON-LD in `app/pages/index.vue` |
| Reset schedule | `nitro.scheduledTasks` in `nuxt.config.ts` |

## Not included (on purpose)

No confirmation emails yet: the owner view shows every booking and the visitor gets a
reference on screen. In demo mode the confirmation says so plainly. Adding email means an
SMTP call in `server/api/bookings.post.ts` — about 20 lines, using the same Zone mailbox as
deplai.eu — and dropping the demo note's first sentence.

No automated tests. The pieces worth covering first are `buildSlotDays` (DST boundaries, lead
time) and `validateBookingRequest`; both are pure functions and take no setup.
