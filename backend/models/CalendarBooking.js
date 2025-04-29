const mongoose = require('mongoose');

const calendarBookingSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'blocked'],
        default: 'pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    venue: String,
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Add index for efficient date range queries
calendarBookingSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('CalendarBooking', calendarBookingSchema);
