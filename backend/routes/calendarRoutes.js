const express = require("express");
const { authenticationUtil, authorizationUtil } = require("../utils");
const {
    getAllBookings,
    createBooking,
    updateBookingStatus,
    blockDates,
    checkAvailability,
    deleteBooking
} = require("../controllers/calendarController");

const calendarRouter = express.Router();

// All routes require authentication
calendarRouter.use(authenticationUtil);

// Public routes (for authenticated users)
calendarRouter.get("/bookings", getAllBookings);
calendarRouter.post("/bookings", createBooking);
calendarRouter.get("/check-availability", checkAvailability);

// Admin only routes
calendarRouter.post("/block-dates", authorizationUtil(["staff admin"]), blockDates);
calendarRouter.put("/bookings/:id/status", authorizationUtil(["staff admin", "staff advisor"]), updateBookingStatus);

// Delete route (protected by controller logic)
calendarRouter.delete("/bookings/:id", deleteBooking);

module.exports = calendarRouter;
