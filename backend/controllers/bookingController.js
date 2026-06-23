import prisma from "../config/db.js";

export const bookEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.id;

    const booking = await prisma.$transaction(async (tx) => {
      // Lock the event row to prevent concurrent oversell
      const events = await tx.$queryRaw`
        SELECT id, capacity FROM "Event"
        WHERE id = ${eventId}
        FOR UPDATE
      `;

      const event = events[0];

      if (!event) {
        throw new Error("EVENT_NOT_FOUND");
      }

      const existingBooking = await tx.booking.findUnique({
        where: {
          userId_eventId: { userId, eventId },
        },
      });
      if (existingBooking) {
        if (existingBooking.status === "CONFIRMED") {
          throw new Error("ALREADY_BOOKED");
        }

        const bookingCount = await tx.booking.count({
          where: {
            eventId,
            status: "CONFIRMED",
          },
        });

        if (bookingCount >= event.capacity) {
          throw new Error("SOLD_OUT");
        }

        await tx.activityLog.create({
          data: {
            eventId,
            userId,
            action: "BOOKING_STARTED",
          },
        });

        const updated = await tx.booking.update({
          where: {
            id: existingBooking.id,
          },
          data: {
            status: "CONFIRMED",
          },
        });

        await tx.activityLog.create({
          data: {
            eventId,
            userId,
            action: "BOOKING_CONFIRMED",
          },
        });

        return updated;
      }
      const bookingCount = await tx.booking.count({
        where: { eventId, status: "CONFIRMED" },
      });

      if (bookingCount >= event.capacity) {
        throw new Error("SOLD_OUT");
      }

      await tx.activityLog.create({
        data: { eventId, userId, action: "BOOKING_STARTED" },
      });

      const booking = await tx.booking.create({
        data: { userId, eventId },
      });

      await tx.activityLog.create({
        data: { eventId, userId, action: "BOOKING_CONFIRMED" },
      });

      return booking;
    });

    res.status(201).json(booking);

  } catch (error) {
    if (error.message === "EVENT_NOT_FOUND") {
      return res.status(404).json({ message: "Event not found" });
    }
    if (error.message === "ALREADY_BOOKED") {
      return res.status(409).json({ message: "Already booked this event" });
    }
    if (error.message === "SOLD_OUT") {
      return res.status(409).json({ message: "Event sold out" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            eventDate: true,
            price: true,
            capacity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(bookings);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(409).json({ message: "Booking already cancelled" });
    }

    // UPDATE status instead of deleting — preserves history and frees the seat
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    await prisma.activityLog.create({
      data: {
        eventId: booking.eventId,
        userId: booking.userId,
        action: "BOOKING_CANCELLED",
      },
    });

    res.status(200).json({ message: "Booking cancelled successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const bookEvent = async (req, res) => {
//   try {
//     const eventId = Number(req.params.id);
//     const userId = req.user.id;

//     const booking = await prisma.$transaction(async (tx) => {
//       // Lock the event row to prevent concurrent oversell
//       const events = await tx.$queryRaw`
//         SELECT id, capacity FROM "Event"
//         WHERE id = ${eventId}
//         FOR UPDATE
//       `;

//       const event = events[0];

//       if (!event) {
//         throw new Error("EVENT_NOT_FOUND");
//       }

//       const existingBooking = await tx.booking.findUnique({
//         where: {
//           userId_eventId: { userId, eventId },
//         },
//       });

//       if (existingBooking) {
//         if (existingBooking.status === "CONFIRMED") {
//           throw new Error("ALREADY_BOOKED");
//         }
//         // If previously cancelled, allow re-booking by updating status
//         const updated = await tx.booking.update({
//           where: { id: existingBooking.id },
//           data: { status: "CONFIRMED" },
//         });

//         await tx.activityLog.create({
//           data: { eventId, userId, action: "BOOKING_STARTED" },
//         });
//         await tx.activityLog.create({
//           data: { eventId, userId, action: "BOOKING_CONFIRMED" },
//         });

//         return updated;
//       }

//       const bookingCount = await tx.booking.count({
//         where: { eventId, status: "CONFIRMED" },
//       });

//       if (bookingCount >= event.capacity) {
//         throw new Error("SOLD_OUT");
//       }

//       await tx.activityLog.create({
//         data: { eventId, userId, action: "BOOKING_STARTED" },
//       });

//       const booking = await tx.booking.create({
//         data: { userId, eventId },
//       });

//       await tx.activityLog.create({
//         data: { eventId, userId, action: "BOOKING_CONFIRMED" },
//       });

//       return booking;
//     });

//     res.status(201).json(booking);

//   } catch (error) {
//     if (error.message === "EVENT_NOT_FOUND") {
//       return res.status(404).json({ message: "Event not found" });
//     }
//     if (error.message === "ALREADY_BOOKED") {
//       return res.status(409).json({ message: "Already booked this event" });
//     }
//     if (error.message === "SOLD_OUT") {
//       return res.status(409).json({ message: "Event sold out" });
//     }
//     res.status(500).json({ message: error.message });
//   }
// };