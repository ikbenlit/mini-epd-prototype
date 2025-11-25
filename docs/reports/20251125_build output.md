colin@HP17-Ikbenlit:~/development/15-mini-epd-prototype$ pnpm build

> 15-mini-epd-prototype@0.1.0 build /home/colin/development/15-mini-epd-prototype
> next build

  ▲ Next.js 14.2.18
  - Environments: .env.local

   Creating an optimized production build ...
<w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (128kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
 ⚠ Compiled with warnings

./node_modules/.pnpm/@supabase+realtime-js@2.84.0/node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
Learn more: https://nextjs.org/docs/api-reference/edge-runtime

Import trace for requested module:
./node_modules/.pnpm/@supabase+realtime-js@2.84.0/node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
./node_modules/.pnpm/@supabase+realtime-js@2.84.0/node_modules/@supabase/realtime-js/dist/module/index.js
./node_modules/.pnpm/@supabase+supabase-js@2.84.0/node_modules/@supabase/supabase-js/dist/module/index.js
./node_modules/.pnpm/@supabase+ssr@0.7.0_@supabase+supabase-js@2.84.0/node_modules/@supabase/ssr/dist/module/createBrowserClient.js
./node_modules/.pnpm/@supabase+ssr@0.7.0_@supabase+supabase-js@2.84.0/node_modules/@supabase/ssr/dist/module/index.js

./node_modules/.pnpm/@supabase+supabase-js@2.84.0/node_modules/@supabase/supabase-js/dist/module/index.js
A Node.js API is used (process.version at line: 32) which is not supported in the Edge Runtime.
Learn more: https://nextjs.org/docs/api-reference/edge-runtime

Import trace for requested module:
./node_modules/.pnpm/@supabase+supabase-js@2.84.0/node_modules/@supabase/supabase-js/dist/module/index.js
./node_modules/.pnpm/@supabase+ssr@0.7.0_@supabase+supabase-js@2.84.0/node_modules/@supabase/ssr/dist/module/createBrowserClient.js
./node_modules/.pnpm/@supabase+ssr@0.7.0_@supabase+supabase-js@2.84.0/node_modules/@supabase/ssr/dist/module/index.js


./app/epd/patients/[id]/rapportage/components/report-view-edit-modal.tsx
220:6  Warning: React Hook useEffect has a missing dependency: 'handleClose'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
 ✓ Linting and checking validity of types
 ✓ Collecting page data
 ✓ Generating static pages (44/44)
 ✓ Collecting build traces
 ✓ Finalizing page optimization

Route (app)                                               Size     First Load JS
┌ ○ /                                                     60.7 kB         147 kB
├ ○ /_not-found                                           157 B          86.5 kB
├ ƒ /api/deepgram/token                                   0 B                0 B
├ ƒ /api/deepgram/transcribe                              0 B                0 B
├ ƒ /api/fhir/Patient                                     0 B                0 B
├ ƒ /api/fhir/Patient/[id]                                0 B                0 B
├ ƒ /api/fhir/Practitioner                                0 B                0 B
├ ƒ /api/fhir/Practitioner/[id]                           0 B                0 B
├ ƒ /api/intakes                                          0 B                0 B
├ ƒ /api/intakes/[intakeId]                               0 B                0 B
├ ƒ /api/leads                                            0 B                0 B
├ ƒ /api/reports                                          0 B                0 B
├ ƒ /api/reports/[reportId]                               0 B                0 B
├ ƒ /api/reports/classify                                 0 B                0 B
├ ƒ /api/screenings                                       0 B                0 B
├ ƒ /api/screenings/[screeningId]                         0 B                0 B
├ ƒ /api/screenings/[screeningId]/activities              0 B                0 B
├ ƒ /api/screenings/[screeningId]/documents               0 B                0 B
├ ƒ /api/screenings/[screeningId]/documents/[documentId]  0 B                0 B
├ ƒ /auth/callback                                        0 B                0 B
├ ○ /auth/debug                                           1.22 kB        87.6 kB
├ ƒ /auth/logout                                          0 B                0 B
├ ○ /contact                                              6.87 kB        93.2 kB
├ ○ /documentatie                                         6.87 kB        93.2 kB
├ ● /documentatie/[category]                              11.3 kB        97.7 kB
├   ├ /documentatie/authentication
├   ├ /documentatie/interface-design
├   ├ /documentatie/client-management
├   └ [+10 more paths]
├ ƒ /epd/agenda                                           157 B          86.5 kB
├ ƒ /epd/clients                                          157 B          86.5 kB
├ ƒ /epd/clients/[...path]                                0 B                0 B
├ ƒ /epd/dashboard                                        157 B          86.5 kB
├ ƒ /epd/patients                                         10.4 kB        96.8 kB
├ ƒ /epd/patients/[id]                                    6.87 kB        93.2 kB
├ ƒ /epd/patients/[id]/basisgegevens                      5.76 kB        92.1 kB
├ ƒ /epd/patients/[id]/behandelplan                       157 B          86.5 kB
├ ƒ /epd/patients/[id]/diagnose                           157 B          86.5 kB
├ ƒ /epd/patients/[id]/intake                             157 B          86.5 kB
├ ƒ /epd/patients/[id]/intakes                            15.5 kB         102 kB
├ ƒ /epd/patients/[id]/intakes/[intakeId]                 157 B          86.5 kB
├ ƒ /epd/patients/[id]/intakes/[intakeId]/anamnese        9.88 kB        96.3 kB
├ ƒ /epd/patients/[id]/intakes/[intakeId]/behandeladvies  154 kB          240 kB
├ ƒ /epd/patients/[id]/intakes/[intakeId]/contacts        10 kB          96.4 kB
├ ƒ /epd/patients/[id]/intakes/[intakeId]/diagnosis       9.96 kB        96.3 kB
├ ƒ /epd/patients/[id]/intakes/[intakeId]/examination     10.1 kB        96.5 kB
├ ƒ /epd/patients/[id]/intakes/[intakeId]/kindcheck       2.64 kB          89 kB
├ ƒ /epd/patients/[id]/intakes/[intakeId]/risk            10.1 kB        96.5 kB
├ ƒ /epd/patients/[id]/intakes/[intakeId]/rom             10.1 kB        96.5 kB
├ ƒ /epd/patients/[id]/intakes/new                        43.7 kB         130 kB
├ ƒ /epd/patients/[id]/rapportage                         60 kB           146 kB
├ ƒ /epd/patients/[id]/screening                          20.1 kB         106 kB
├ ƒ /epd/patients/new                                     11.4 kB        97.7 kB
├ ƒ /epd/reports                                          157 B          86.5 kB
├ ○ /login                                                76 kB           162 kB
├ ○ /reset-password                                       63.7 kB         150 kB
├ ○ /robots.txt                                           0 B                0 B
├ ○ /set-password                                         57.3 kB         144 kB
├ ○ /sitemap.xml                                          0 B                0 B
└ ○ /update-password                                      57.5 kB         144 kB
+ First Load JS shared by all                             86.4 kB
  ├ chunks/main-app-22c8b598fc0d12ad.js                   84.6 kB
  └ other shared chunks (total)                           1.78 kB


ƒ Middleware                                              74.3 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses getStaticProps)
ƒ  (Dynamic)  server-rendered on demand