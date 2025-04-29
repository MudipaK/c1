// models/eventRegForm.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventRegSchema = new Schema({
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date, 
    required: true,
  },
  eventStartTime: {
    type: String,
    required: true,
  },
  eventFinishTime: {
    type: String,
    required: true,
  },
  timePeriod: {
    type: String,
    required: true,
  },
  eventPresident: {
    type: String,
    required: true,
  },
  eventProposal: {
    type: String,
    required: true,
  },
  eventForm: {
    type: String,
    required: true,
  },
  eventMode: {
    type: String,
    enum: ["Physical", "Online"],
    required: true,
  },
  eventType: {
    type: String,
    enum: ["Hackathon", "Academic", "Non-Academic"],
    required: true,
  },
  eventVenue: {
    type: String,
    required: false,
    default: "N/A",
  },
  eventStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
    required: true,
  },
  isBlocked: {
    type: Boolean, 
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("eventRegForm", eventRegSchema);
