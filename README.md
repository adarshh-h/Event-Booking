# BookIt — Live Event Booking Platform

A full-stack event booking platform where organizers create events with limited seats and users browse and book them. Think stripped-down Eventbrite: real accounts, real bookings, an organizer dashboard, and an analytics view.

Built with **React + Vite**, **Node.js + Express**, **Prisma**, and **PostgreSQL**.

---

## Quickstart (Docker — recommended)

> Requires: [Docker Desktop](https://www.docker.com/products/docker-desktop/) running.

```bash
git clone https://github.com/adarshh-h/Event-Booking.git
cd Event-Booking
docker-compose up --build
```

That's it. Docker will:
1. Start a PostgreSQL 16 database
2. Run all migrations (`prisma migrate deploy`)
3. Seed sample data (organizers, events, bookings)
4. Start the backend API and frontend

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:5173     |
| Backend  | http://localhost:5000     |

> **Note:** The backend waits for Postgres to pass its health check before starting, so the first boot takes ~15 seconds.

> **Fresh start:** Run `docker-compose down -v` before `docker-compose up --build` to wipe the database and reseed from scratch.

---

## Seed accounts

All seed accounts use password: `password123`

| Email               | Role      |
|---------------------|-----------|
| alice@bookit.com    | ORGANIZER |
| bob@bookit.com      | ORGANIZER |
| charlie@bookit.com  | USER      |
| diana@bookit.com    | USER      |

> **DSA Prep Workshop** is seeded as sold out — use it to test the sold-out UI state.

---

## Verifying the no-oversell guarantee

The hardest requirement: two users booking the last seat simultaneously → exactly one succeeds.

Create an event with **capacity 1** via the organizer dashboard, grab tokens for two users and fire simultaneous requests on Windows PowerShell:

```powershell
# Login both users
$r1 = Invoke-RestMethod -Uri "http://localhost:5000/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"charlie@bookit.com","password":"password123"}'
$r2 = Invoke-RestMethod -Uri "http://localhost:5000/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"diana@bookit.com","password":"password123"}'
$TOKEN1 = $r1.token
$TOKEN2 = $r2.token
# create Event with capacity 1 so we check 2 user book 1 seat at a time and copy the event id from edit event
# Fire both simultaneously (replace EVENT_ID)
$job1 = Start-Job -ArgumentList $TOKEN1, EVENT_ID { param($tok,$eid) try { $r = Invoke-RestMethod -Uri "http://localhost:5000/events/$eid/book" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $tok"}; "CHARLIE: SUCCESS $($r.status)" } catch { "CHARLIE: FAILED $($_.ErrorDetails.Message)" } }
$job2 = Start-Job -ArgumentList $TOKEN2, EVENT_ID { param($tok,$eid) try { $r = Invoke-RestMethod -Uri "http://localhost:5000/events/$eid/book" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $tok"}; "DIANA: SUCCESS $($r.status)" } catch { "DIANA: FAILED $($_.ErrorDetails.Message)" } }
Start-Sleep 3
Receive-Job $job1
Receive-Job $job2
```

Expected output:
```
CHARLIE: SUCCESS CONFIRMED
DIANA:   FAILED {"message":"Event sold out"}
```

Exactly one succeeds, one gets 409. See `NOTES.md` for how this is enforced.

---

## Manual setup (without Docker)

<details>
<summary>Expand for local setup instructions</summary>

### Prerequisites
- Node.js v18+
- PostgreSQL running locally
- npm

### 1. Clone the repo

```bash
git clone https://github.com/adarshh-h/Event-Booking.git
cd Event-Booking
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bookit"
JWT_SECRET="your-secret-key-here"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

Run migrations, seed, and start:

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

</details>

---

## Tech stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, Tailwind CSS      |
| Backend  | Node.js, Express 5                |
| ORM      | Prisma 6                          |
| Database | PostgreSQL 16                     |
| Auth     | JWT + bcrypt                      |
| Deploy   | Docker Compose                    |

---

## API reference

### Auth
```
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

### Events
```
GET    /events?search=&date=&page=    # paginated, indexed, search + date filter
GET    /events/:id                    # detail + logs EVENT_VIEWED
POST   /events/:id/book               # concurrency-safe booking
```

### Bookings
```
GET    /me/bookings                   # current user's bookings
DELETE /bookings/:id                  # cancel (sets status CANCELLED, frees seat)
```

### Organizer
```
POST   /organizer/events              # create event
PATCH  /organizer/events/:id          # edit (capacity can't drop below booked)
GET    /organizer/events              # own events + sold counts
GET    /organizer/events/:id/attendees
GET    /organizer/events/:id/analytics  # view → booking conversion from activity_log
```

---

## Available scripts

### Backend (`cd backend`)

| Command                        | Description                              |
|--------------------------------|------------------------------------------|
| `npm run dev`                  | Start with nodemon (hot reload)          |
| `npm run start`                | Start (production)                       |
| `npx prisma migrate deploy`    | Run all pending migrations               |
| `npm run db:seed`              | Seed sample data                         |
| `npx prisma migrate reset`     | Drop + recreate schema + re-seed         |
| `npx prisma studio`            | Open DB GUI at port 5555                 |

### Frontend (`cd frontend`)

| Command           | Description             |
|-------------------|-------------------------|
| `npm run dev`     | Start dev server        |
| `npm run build`   | Production build        |

---

## Project structure

```
Event-Booking/
├── docker-compose.yml
├── backend/
│   ├── config/          # Prisma client singleton
│   ├── controllers/     # Business logic (auth, event, booking)
│   ├── middleware/       # authMiddleware, roleMiddleware
│   ├── prisma/
│   │   ├── migrations/  # Migration files (run with migrate deploy)
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── routes/          # Express routers
│   ├── utils/           # JWT sign/verify
│   └── server.js
└── frontend/
    └── src/
        ├── api/         # Axios instance
        ├── components/  # Navbar, EventCard, ProtectedRoute
        ├── context/     # AuthContext
        └── pages/       # Home, EventDetail, MyBookings, Login, Signup
            └── organizer/  # Dashboard, CreateEvent, EditEvent, Attendees, Analytics
```
