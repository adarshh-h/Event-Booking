import prisma from "../config/db.js";

export const createEvent = async (req, res) => {
  try {
    const { title, description, venue, eventDate, capacity, price } = req.body;

    if (!title || !description || !venue || !eventDate || !capacity || price === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        venue,
        eventDate: new Date(eventDate),
        capacity: Number(capacity),
        price: Number(price),
        organizerId: req.user.id,
      },
    });

    res.status(201).json(event);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { search = "", page = 1, date } = req.query;

    const limit = 20;
    const skip = (Number(page) - 1) * limit;

    const where = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    if (date) {
      where.eventDate = { gte: new Date(date) };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { eventDate: "asc" },
        include: {
          _count: {
            select: { bookings: { where: { status: "CONFIRMED" } } },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    const eventsWithSeats = events.map((event) => {
      const bookedSeats = event._count.bookings;
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        venue: event.venue,
        eventDate: event.eventDate,
        capacity: event.capacity,
        price: event.price,
        organizerId: event.organizerId,
        createdAt: event.createdAt,
        bookedSeats,
        seatsRemaining: event.capacity - bookedSeats,
        isSoldOut: bookedSeats >= event.capacity,
      };
    });

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      events: eventsWithSeats,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: { where: { status: "CONFIRMED" } } },
        },
        organizer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Log event view (fire and forget — don't block response)
    prisma.activityLog.create({
      data: { eventId: event.id, action: "EVENT_VIEWED" },
    }).catch(() => {});

    const bookedSeats = event._count.bookings;

    res.status(200).json({
      ...event,
      bookedSeats,
      seatsRemaining: event.capacity - bookedSeats,
      isSoldOut: bookedSeats >= event.capacity,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.body.capacity !== undefined) {
      const bookedSeats = await prisma.booking.count({
        where: { eventId: id, status: "CONFIRMED" },
      });

      if (Number(req.body.capacity) < bookedSeats) {
        return res.status(409).json({
          message: `Capacity cannot be less than seats already booked (${bookedSeats})`,
        });
      }
    }

    // Sanitize — only allow known fields
    const allowedFields = ["title", "description", "venue", "eventDate", "capacity", "price"];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = field === "eventDate" ? new Date(req.body[field]) : req.body[field];
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedEvent);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrganizerEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user.id },
      include: {
        _count: {
          select: { bookings: { where: { status: "CONFIRMED" } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      venue: event.venue,
      eventDate: event.eventDate,
      capacity: event.capacity,
      price: event.price,
      createdAt: event.createdAt,
      soldCount: event._count.bookings,
      seatsRemaining: event.capacity - event._count.bookings,
    }));

    res.status(200).json(formatted);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventAttendees = async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const attendees = await prisma.booking.findMany({
      where: { eventId, status: "CONFIRMED" },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(
      attendees.map((a) => ({
        bookingId: a.id,
        bookedAt: a.createdAt,
        ...a.user,
      }))
    );

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventAnalytics = async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [views, bookingStarted, bookingConfirmed, bookingCancelled] =
      await Promise.all([
        prisma.activityLog.count({ where: { eventId, action: "EVENT_VIEWED" } }),
        prisma.activityLog.count({ where: { eventId, action: "BOOKING_STARTED" } }),
        prisma.activityLog.count({ where: { eventId, action: "BOOKING_CONFIRMED" } }),
        prisma.activityLog.count({ where: { eventId, action: "BOOKING_CANCELLED" } }),
      ]);

    const conversionRate =
      views === 0 ? 0 : Number(((bookingConfirmed / views) * 100).toFixed(2));

    res.status(200).json({
      views,
      bookingStarted,
      bookingConfirmed,
      bookingCancelled,
      conversionRate,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
