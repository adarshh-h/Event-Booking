import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data in order (children first)
  await prisma.activityLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // --- Users ---
  const organizer1 = await prisma.user.create({
    data: {
      name: "Alice Organizer",
      email: "alice@bookit.com",
      password: passwordHash,
      role: "ORGANIZER",
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      name: "Bob Organizer",
      email: "bob@bookit.com",
      password: passwordHash,
      role: "ORGANIZER",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: "Charlie User",
      email: "charlie@bookit.com",
      password: passwordHash,
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Diana User",
      email: "diana@bookit.com",
      password: passwordHash,
      role: "USER",
    },
  });

  console.log("✅ Users created");

  // --- Events ---
  const now = new Date();
  const future = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const event1 = await prisma.event.create({
    data: {
      title: "React & Node.js Workshop",
      description: "A hands-on full-day workshop covering React hooks, Next.js, and building REST APIs with Node.js and Express.",
      venue: "Bangalore Tech Hub, Koramangala",
      eventDate: future(10),
      capacity: 50,
      price: 999,
      organizerId: organizer1.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Startup Pitch Night",
      description: "10 early-stage startups pitch to a panel of investors. Open to attendees, networking session follows.",
      venue: "91springboard, HSR Layout, Bengaluru",
      eventDate: future(15),
      capacity: 100,
      price: 0,
      organizerId: organizer1.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: "Cloud Computing Bootcamp",
      description: "Intensive 2-day bootcamp covering AWS fundamentals, EC2, S3, RDS, and deploying production apps.",
      venue: "WeWork Galaxy, Residency Road, Bengaluru",
      eventDate: future(20),
      capacity: 30,
      price: 2499,
      organizerId: organizer2.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: "DSA Interview Prep — FAANG Edition",
      description: "Mock interviews, problem-solving patterns, and tips from engineers who cracked Google, Amazon, and Microsoft.",
      venue: "Online (Zoom)",
      eventDate: future(5),
      capacity: 2, // intentionally low to demo sold-out
      price: 499,
      organizerId: organizer2.id,
    },
  });

  console.log("✅ Events created");

  // --- Bookings ---
  await prisma.booking.create({
    data: { userId: user1.id, eventId: event1.id, status: "CONFIRMED" },
  });

  await prisma.booking.create({
    data: { userId: user2.id, eventId: event1.id, status: "CONFIRMED" },
  });

  await prisma.booking.create({
    data: { userId: user1.id, eventId: event2.id, status: "CONFIRMED" },
  });

  // Fill up event4 (sold out demo)
  await prisma.booking.create({
    data: { userId: user1.id, eventId: event4.id, status: "CONFIRMED" },
  });
  await prisma.booking.create({
    data: { userId: user2.id, eventId: event4.id, status: "CONFIRMED" },
  });

  console.log("✅ Bookings created");

  // --- Activity Logs ---
  const logs = [
    { eventId: event1.id, userId: user1.id, action: "EVENT_VIEWED" },
    { eventId: event1.id, userId: user1.id, action: "BOOKING_STARTED" },
    { eventId: event1.id, userId: user1.id, action: "BOOKING_CONFIRMED" },
    { eventId: event1.id, userId: user2.id, action: "EVENT_VIEWED" },
    { eventId: event1.id, userId: user2.id, action: "BOOKING_STARTED" },
    { eventId: event1.id, userId: user2.id, action: "BOOKING_CONFIRMED" },
    { eventId: event1.id, action: "EVENT_VIEWED" }, // anonymous view
    { eventId: event2.id, userId: user1.id, action: "EVENT_VIEWED" },
    { eventId: event2.id, userId: user1.id, action: "BOOKING_STARTED" },
    { eventId: event2.id, userId: user1.id, action: "BOOKING_CONFIRMED" },
    { eventId: event2.id, action: "EVENT_VIEWED" },
    { eventId: event3.id, action: "EVENT_VIEWED" },
    { eventId: event4.id, userId: user1.id, action: "EVENT_VIEWED" },
    { eventId: event4.id, userId: user1.id, action: "BOOKING_STARTED" },
    { eventId: event4.id, userId: user1.id, action: "BOOKING_CONFIRMED" },
    { eventId: event4.id, userId: user2.id, action: "EVENT_VIEWED" },
    { eventId: event4.id, userId: user2.id, action: "BOOKING_STARTED" },
    { eventId: event4.id, userId: user2.id, action: "BOOKING_CONFIRMED" },
  ];

  await prisma.activityLog.createMany({ data: logs });

  console.log("✅ Activity logs created");
  console.log("\n📋 Seed accounts (password: password123)");
  console.log("  alice@bookit.com   — ORGANIZER");
  console.log("  bob@bookit.com     — ORGANIZER");
  console.log("  charlie@bookit.com — USER");
  console.log("  diana@bookit.com   — USER");
  console.log("\n  event4 (DSA prep) is sold out — good for concurrency testing");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
