# NOTES.md — BookIt Technical Decisions

---

## 1. How I enforced the no-oversell guarantee

### The problem

When two users book the last seat at the same time, both requests can read the seat count simultaneously, see `N-1 < N` (seats available), and both proceed to create a booking — resulting in N+1 confirmed bookings. A simple `if (count < capacity)` check inside a transaction is not enough because PostgreSQL's default read does not block concurrent reads.

### The solution — `SELECT FOR UPDATE`

Inside the booking transaction, I lock the event row before reading the seat count:

```js
await prisma.$transaction(async (tx) => {
  // Lock the event row — any other transaction trying to lock
  // the same row will wait until this one commits or rolls back
  const events = await tx.$queryRaw`
    SELECT id, capacity FROM "Event"
    WHERE id = ${eventId}
    FOR UPDATE
  `;

  const bookingCount = await tx.booking.count({
    where: { eventId, status: "CONFIRMED" },
  });

  if (bookingCount >= event.capacity) {
    throw new Error("SOLD_OUT");
  }

  // Safe to create — we hold the lock
  await tx.booking.create({ ... });
});
```

`SELECT FOR UPDATE` acquires a row-level exclusive lock on the event row. When two transactions try to lock the same event simultaneously, PostgreSQL serializes them — the second one waits until the first commits. By the time the second transaction reads the booking count, it sees the first booking already in the table and correctly throws `SOLD_OUT`.

### Why not just use a unique constraint?

The `@@unique([userId, eventId])` constraint on the Booking table prevents the same user from double-booking. But it does nothing to prevent two *different* users from both booking the last seat — that requires the `SELECT FOR UPDATE` approach above.

### Why not use optimistic locking or a version counter?

Optimistic locking (read → compute → write → check for conflict) would also work, but it requires a retry loop on the client side when a conflict is detected. `SELECT FOR UPDATE` is simpler, deterministic, and well-suited for this use case since booking contention is rare and the lock is held for milliseconds.

---

## 2. Schema decisions

### Four tables

| Table | Purpose |
|---|---|
| `User` | Accounts with a `role` enum (USER / ORGANIZER) |
| `Event` | Events owned by an organizer with capacity |
| `Booking` | Links a user to an event; status is CONFIRMED or CANCELLED |
| `ActivityLog` | Append-only event log for analytics |

### Key decisions

**Booking status instead of delete**
When a user cancels, I update `status` to `CANCELLED` instead of deleting the row. This preserves the audit trail, keeps the `activity_log` consistent, and allows the user to re-book the same event later (the unique constraint only blocks two CONFIRMED rows — a cancelled + new confirmed is fine because we handle it as an update).

**Unique constraint on bookings**
`@@unique([userId, eventId])` at the database level prevents double-booking even if two concurrent requests slip through application-level checks.

**`userId` is nullable on `ActivityLog`**
Anonymous views (users who aren't logged in) are tracked with `userId: null`. This gives more accurate view counts for the conversion rate calculation.

**Cancel as status update, not delete**
Deleted rows break analytics. If a user books, cancels, and books again, we need all three events in `ActivityLog`. Keeping the booking row with status `CANCELLED` means the history is intact.

---

## 3. Indexing decisions

```prisma
@@index([title])       -- fast ILIKE search on event title
@@index([eventDate])   -- fast date filter + ordering for pagination
```

These two indexes cover the main query pattern on the events list:
- `WHERE title ILIKE '%search%' AND eventDate >= 'date'`
- `ORDER BY eventDate ASC LIMIT 20 OFFSET N`

Without the `eventDate` index, sorting + paginating 100,000+ rows would require a full table scan on every request. With it, PostgreSQL can use an index scan for both the filter and the sort in a single pass.

A composite index `(title, eventDate)` would be slightly more efficient for combined queries but adds write overhead and was not necessary at this scale.

---

## 4. API design decisions

**`DELETE /bookings/:id` cancels, does not delete**
The endpoint name suggests deletion but the implementation updates status to CANCELLED. This is intentional — hard deletes would break analytics and make re-booking impossible cleanly.

**`POST /events/:id/book` returns the booking object**
The response includes the full booking so the frontend can immediately show confirmation without a second fetch.

**`GET /events` computes `seatsRemaining` and `isSoldOut` server-side**
Rather than sending raw capacity and making the frontend calculate, the API returns computed fields. This keeps the frontend simple and ensures the calculation is always consistent.

**Role guard on organizer routes**
A separate `roleMiddleware` checks `req.user.role === 'ORGANIZER'` after `authMiddleware` sets `req.user`. This keeps auth and authorization concerns separate and reusable.

---

## 5. AI usage

I used Claude (Anthropic) throughout this project for:

- Initial backend scaffold — route structure, Prisma schema, middleware setup
- Debugging the concurrency issue — Claude correctly identified that `$transaction` alone is not enough and suggested `SELECT FOR UPDATE`
- Seed file generation — sample data with realistic events and activity logs
- Frontend component structure — page layout, Tailwind classes, form handling

**Where I disagreed with AI suggestions:**

- Claude initially suggested using `prisma.$transaction` without `SELECT FOR UPDATE`. I pushed back and asked specifically about race conditions under simultaneous requests, at which point it correctly revised to the `FOR UPDATE` approach.
- Claude suggested deleting booking rows on cancel. I changed this to a status update to preserve audit history and allow re-booking.
- Claude suggested a composite `(title, eventDate)` index. I kept them separate since the search and date filter are often used independently, and a composite index would not help prefix-free searches on `eventDate` alone.

The final implementation reflects my own understanding and decisions. I can explain, extend, and debug every part of this codebase.
