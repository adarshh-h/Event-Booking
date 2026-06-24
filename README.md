# BookIt — Live Event Booking Platform

A full-stack event booking platform where organizers create events with limited seats and users browse and book them. Built with React + Vite, Node.js + Express, Prisma, and PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |

---

## Prerequisites

- Node.js v18+
- PostgreSQL running locally
- npm

---

## Setup & Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/bookit.git
cd bookit
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bookit"
JWT_SECRET="your-secret-key-here"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

Run migrations (creates all tables from scratch):

```bash
npx prisma migrate deploy
```

Seed sample data (organizers, users, events, bookings):

```bash
npm run db:seed
```

Start the backend server:

```bash
npm run dev
```

Server runs at `http://localhost:5000`

---

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Seed Accounts

All accounts use password: `password123`

| Email | Role |
|---|---|
| alice@bookit.com | ORGANIZER |
| bob@bookit.com | ORGANIZER |
| charlie@bookit.com | USER |
| diana@bookit.com | USER |

> Event 4 (DSA Prep) is seeded as sold out — useful for concurrency testing.

---

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon |
| `npm run start` | Start server (production) |
| `npx prisma migrate deploy` | Run all migrations |
| `npm run db:seed` | Seed sample data |
| `npx prisma migrate reset` | Drop + recreate all tables + seed |
| `npx prisma studio` | Open Prisma Studio (DB GUI) at port 5555 |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |

---

## API Endpoints

### Auth
```
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

### Events
```
GET    /events?search=&date=&page=
GET    /events/:id
POST   /events/:id/book
```

### Bookings
```
GET    /me/bookings
DELETE /bookings/:id
```

### Organizer
```
POST   /organizer/events
PATCH  /organizer/events/:id
GET    /organizer/events
GET    /organizer/events/:id/attendees
GET    /organizer/events/:id/analytics
```

---

## Testing Concurrency

To verify the no-oversell guarantee, create an event with capacity 1 and run two simultaneous booking requests:

```bash
curl -X POST http://localhost:5000/events/EVENT_ID/book \
  -H "Authorization: Bearer USER1_TOKEN" & \
curl -X POST http://localhost:5000/events/EVENT_ID/book \
  -H "Authorization: Bearer USER2_TOKEN"
```

Expected result: exactly one `201 CONFIRMED`, one `409 Event sold out`.

---

## Project Structure

```
bookit/
├── backend/
│   ├── config/          # DB connection (Prisma client)
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth + role guards
│   ├── prisma/
│   │   ├── migrations/  # Migration files
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── routes/          # Express routers
│   ├── utils/           # JWT helpers
│   └── server.js
└── frontend/
    └── src/
        ├── api/         # Axios instance
        ├── components/  # Navbar, EventCard, ProtectedRoute
        ├── context/     # AuthContext
        └── pages/       # All pages including organizer/
```
