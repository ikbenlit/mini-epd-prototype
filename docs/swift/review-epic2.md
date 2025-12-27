# Epic 2 Review Findings

Context: quick review of Epic 2 changes (date/time parsing + agenda entity extraction).

## Findings
1. High - Patient name detection is too permissive for agenda intents and can misclassify appointment tokens as names.
   - Details: create/cancel/reschedule extraction uses `filteredWords` + `isLikelyName`; tokens like "intake", "morgen", or times can be treated as names.
   - Impact: wrong patient selected or wrong appointment targeted.
   - Files: `lib/swift/entity-extractor.ts`
   - Suggestion: skip tokens that parse as date/time or match appointment/location keywords before `isLikelyName`.

2. Medium - Agenda query defaults to "vandaag" when no date is present (e.g., "volgende afspraak").
   - Impact: only today is queried, which can miss the actual next appointment.
   - Files: `lib/swift/entity-extractor.ts`
   - Suggestion: leave `dateRange` undefined or mark "from now" and let backend decide.

3. Medium - `ExtractedEntities` now carries Date objects, but the classify API returns JSON, so Dates become strings.
   - Impact: downstream date ops may break on serialized strings.
   - Files: `lib/swift/types.ts` (see API flow in `app/api/intent/classify/route.ts`)
   - Suggestion: use ISO strings in the DTO or normalize in the API response.

4. Medium - Type drift between lib and store: the store `ExtractedEntities` does not include the new agenda structures.
   - Impact: UI usage may drop agenda fields or require unsafe casting.
   - Files: `stores/swift-store.ts`, `lib/swift/types.ts`
   - Suggestion: align store types with lib types (or re-export the shared type).

5. Low - AI fallback path does not run local extractor; low-confidence agenda intents lose structured entities.
   - Impact: less reliable agenda prefill when AI is used.
   - Files: `app/api/intent/classify/route.ts`, `lib/swift/intent-classifier-ai.ts`
   - Suggestion: post-process AI results with local extractor for agenda intents.

## Testing / QA notes
- Untracked tests exist: `lib/swift/__tests__/date-time-parser.test.ts`.
- Manual scripts exist: `lib/swift/verify-parser.ts` and `lib/swift/verify-entity-extraction.ts` (not run here).
