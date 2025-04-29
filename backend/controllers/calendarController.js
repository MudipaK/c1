const CalendarBooking = require('../models/CalendarBooking');

// Get all calendar bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await CalendarBooking.find()
            .populate('createdBy', 'username email')
            .populate('lastModifiedBy', 'username email');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new booking
const createBooking = async (req, res) => {
    try {
        const { startDate, endDate, title, description, venue } = req.body;
        
        // Check for date conflicts
        const conflicts = await CalendarBooking.find({
            $or: [
                {
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                }
            ],
            status: { $in: ['approved', 'blocked'] }
        });

        if (conflicts.length > 0) {
            return res.status(400).json({ 
                message: "Date range conflicts with existing bookings",
                conflicts
            });
        }

        const booking = new CalendarBooking({
            startDate,
            endDate,
            title,
            description,
            venue,
            createdBy: req.user.id,
            status: req.user.role === 'staff admin' ? 'approved' : 'pending'
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const booking = await CalendarBooking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Only staff admin can approve/reject bookings
        if (!['staff admin', 'staff advisor'].includes(req.user.role)) {
            return res.status(403).json({ message: "Unauthorized to update booking status" });
        }

        booking.status = status;
        booking.lastModifiedBy = req.user.id;
        await booking.save();

        res.status(200).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Block dates (staff admin only)
const blockDates = async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;

        if (req.user.role !== 'staff admin') {
            return res.status(403).json({ message: "Only staff admin can block dates" });
        }

        const booking = new CalendarBooking({
            startDate,
            endDate,
            title: `Blocked: ${reason}`,
            description: reason,
            createdBy: req.user.id,
            status: 'blocked',
            isBlocked: true
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Check date availability
const checkAvailability = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const conflicts = await CalendarBooking.find({
            $or: [
                {
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                }
            ],
            status: { $in: ['approved', 'blocked'] }
        });

        res.status(200).json({
            isAvailable: conflicts.length === 0,
            conflicts
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete booking (staff admin only or owner if pending)
const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await CalendarBooking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if user has permission to delete
        if (req.user.role !== 'staff admin' && 
            booking.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to delete this booking" });
        }

        await booking.delete();
        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllBookings,
    createBooking,
    updateBookingStatus,
    blockDates,
    checkAvailability,
    deleteBooking
};
