# TODO - useDashboardData Production Cleanup

## Step 1 — Refactor notifications parsing ✅

- Extract reusable helper to map notifications + pagination from dashboard response.
- Use helper in initial load and notification pagination handler.

## Step 2 — Improve typing & reduce casts

- Introduce local minimal response interfaces for the parts we use.
- Reduce repeated `as ... Record<string, unknown>` blocks.

## Step 3 — WebSocket effect hardening

- Remove console.log.
- Stabilize notification handler with a ref to avoid unsubscribe mismatch risks.

## Step 4 — Error handling consistency

- Validate sessions/reviews response shape and throw predictable errors.

## Step 5 — Run lint/build

- Run `npm run lint` and `npm run build` (if available).
