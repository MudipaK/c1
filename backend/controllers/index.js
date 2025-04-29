const {
  login,
  register,
  changeRole,
  changePassword,
  getUserDetails,
} = require("./authController");

const {
  getAllBookings,
  createBooking,
  updateBookingStatus,
  blockDates,
  checkAvailability,
  deleteBooking
} = require("./calendarController");

module.exports = {
  login,
  register,
  changeRole,
  changePassword,
  getUserDetails,
  getAllBookings,
  createBooking,
  updateBookingStatus,
  blockDates,
  checkAvailability,
  deleteBooking
};
