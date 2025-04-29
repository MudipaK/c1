const eventRegForm = require("../models/eventModel");
const Organization = require("../models/Organization");
const mongoose = require("mongoose");
const {
  sendEventCreationNotifications,
  sendEventUpdateNotifications,
  sendEventStatusUpdateNotification,
} = require("../utils/sendEventEmails");
const {
  sendEventDeletionNotification,
} = require("../utils/sendOrganisationEmails");
const { User } = require("../models");

const createEvent = async (req, res) => {
  const {
    organizationId,
    eventName,
    eventDate,
    eventStartTime,
    eventFinishTime,
    timePeriod,
    eventPresident,
    eventProposal,
    eventForm,
    eventMode,
    eventType,
    eventVenue,
  } = req.body;

  // Validate organization ID
  if (!organizationId) {
    return res.status(400).json({ message: "Organization ID is required" });
  }

  if (eventVenue && eventVenue.length > 100) {
    return res.status(400).json({ message: "Event venue is too long" });
  }

  // Validate event name
  if (!eventName || eventName.trim() === "") {
    return res.status(400).json({ message: "Event name is required" });
  }

  // Validate event dates and times
  if (!eventDate || !eventStartTime || !eventFinishTime) {
    return res.status(400).json({
      message: "Event date, start time, and finish time are required",
    });
  }

  // Validate that event date is not in the past
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Reset time to beginning of day for date comparison
  const selectedDate = new Date(eventDate);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < currentDate) {
    return res
      .status(400)
      .json({ message: "Event date cannot be in the past" });
  }

  // Parse times for validation
  const startTime = eventStartTime.split(":");
  const endTime = eventFinishTime.split(":");

  if (startTime.length !== 2 || endTime.length !== 2) {
    return res
      .status(400)
      .json({ message: "Invalid time format. Use HH:MM format" });
  }

  const startHour = parseInt(startTime[0]);
  const startMinute = parseInt(startTime[1]);
  const endHour = parseInt(endTime[0]);
  const endMinute = parseInt(endTime[1]);

  // For same-day events, check if start time is before end time
  if (
    startHour > endHour ||
    (startHour === endHour && startMinute >= endMinute)
  ) {
    return res
      .status(400)
      .json({ message: "Event start time must be before finish time" });
  }

  // Create a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if organization exists and populate president and staff advisor
    const organization = await Organization.findById(organizationId)
      .populate("president")
      .populate("staffAdvisor");

    if (!organization) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check for duplicate event name within the same organization
    const duplicateEvent = await eventRegForm.findOne({
      organizationId,
      eventName: { $regex: new RegExp(`^${eventName}$`, "i") }, // Case-insensitive match
    });

    if (duplicateEvent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "An event with this name already exists in this organization",
      });
    }

    // Generate a new ObjectId for the event
    const eventID = new mongoose.Types.ObjectId();

    // Create the event
    const eventCreate = new eventRegForm({
      eventID,
      organizationId,
      eventName,
      eventDate,
      eventStartTime,
      eventFinishTime,
      timePeriod,
      eventPresident,
      eventProposal,
      eventForm,
      eventMode,
      eventType,
      eventVenue,
      eventStatus: "Pending", // Always start with pending status
    });

    await eventCreate.save({ session });

    // Add event ID to organization's events array
    await Organization.findByIdAndUpdate(
      organizationId,
      { $push: { eventIds: eventCreate._id } },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ message: "Event created successfully", event: eventCreate });

    // Send notification emails after successful event creation
    if (organization.president && organization.staffAdvisor) {
      try {
        await sendEventCreationNotifications(organization, eventCreate);
        console.log("Event notification emails sent successfully");
      } catch (emailError) {
        console.error("Failed to send event notification emails:", emailError);
        // We don't want to fail the request if just the email sending fails
      }
    }
  } catch (err) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Failed to create event", error: err.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await eventRegForm.find().populate("organizationId");
    res.status(200).json(events);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch events", error: err.message });
  }
};

const getEventsByOrganization = async (req, res) => {
  const { organizationId } = req.params;

  try {
    const events = await eventRegForm
      .find({ organizationId })
      .populate("organizationId");
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch organization events",
      error: err.message,
    });
  }
};

const updateEventStatus = async (req, res) => {
  const { id } = req.params;
  const { eventStatus } = req.body;
  let eventStatusExtracted = eventStatus.eventStatus; // Assuming eventStatus is an object with a property eventStatus
  const userId = req.user.id; // Assuming user info is in the request

  // Validate that a status was provided
  if (!eventStatus) {
    return res.status(400).json({ message: "Event status is required" });
  }

  // Validate status is one of the allowed values
  const allowedStatuses = ["Pending", "Approved", "Rejected"];
  if (!allowedStatuses.includes(eventStatusExtracted)) {
    return res.status(400).json({
      message: "Invalid status. Must be Pending, Approved, or Rejected",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the event
    const event = await eventRegForm.findById(id);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Event not found" });
    }

    // Find the organization to check if user is the staff advisor
    const organization = await Organization.findById(event.organizationId)
      .populate("president")
      .populate("staffAdvisor");

    if (!organization) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Organization not found" });
    }

    // Verify the user is the staff advisor
    const isStaffAdvisor =
      organization.staffAdvisor &&
      (organization.staffAdvisor._id.toString() === userId ||
        organization.staffAdvisor.toString() === userId);

    if (!isStaffAdvisor) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ message: "Only staff advisors can update event status" });
    }

    // Store the old status for notification purposes
    const oldStatus = event.eventStatus;

    // Update the event status
    const updatedEvent = await eventRegForm.findByIdAndUpdate(
      id,
      { eventStatus: eventStatusExtracted }, // This correctly updates the eventStatus field
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Event status updated successfully",
      event: updatedEvent,
    });

    try {
      await sendEventStatusUpdateNotification(
        organization,
        updatedEvent,
        oldStatus,
        eventStatusExtracted
      );
      console.log("Event status update notification emails sent successfully");
    } catch (emailError) {
      console.error("Failed to send event status update emails:", emailError);
      // We don't want to fail the request if just the email sending fails
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Failed to update event status", error: err.message });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const oldOrganizationId = updatedData.oldOrganizationId;

  // Status changes are handled in a separate controller
  if (updatedData.eventStatus) {
    delete updatedData.eventStatus;
  }

  // Remove oldOrganizationId from data to be updated
  if (updatedData.oldOrganizationId) {
    delete updatedData.oldOrganizationId;
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find current event data to compare changes later
    const currentEvent = await eventRegForm.findById(id).lean();
    if (!currentEvent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Event not found" });
    }

    // If organization is changing, update both organizations' event arrays
    if (
      oldOrganizationId &&
      updatedData.organizationId &&
      oldOrganizationId !== updatedData.organizationId
    ) {
      // Remove event from old organization
      await Organization.findByIdAndUpdate(
        oldOrganizationId,
        { $pull: { eventIds: id } },
        { session }
      );

      // Add event to new organization
      await Organization.findByIdAndUpdate(
        updatedData.organizationId,
        { $push: { eventIds: id } },
        { session }
      );
    }

    // Apply validation for time and date if those fields are being updated
    if (
      updatedData.eventDate ||
      updatedData.eventStartTime ||
      updatedData.eventFinishTime
    ) {
      // Validate event date is not in the past (if being changed)
      if (updatedData.eventDate) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const selectedDate = new Date(updatedData.eventDate);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < currentDate) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: "Event date cannot be in the past" });
        }
      }

      // Validate start/end times (if both are provided in update)
      if (updatedData.eventStartTime && updatedData.eventFinishTime) {
        const startTime = updatedData.eventStartTime.split(":");
        const endTime = updatedData.eventFinishTime.split(":");

        if (startTime.length !== 2 || endTime.length !== 2) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: "Invalid time format. Use HH:MM format" });
        }

        const startHour = parseInt(startTime[0]);
        const startMinute = parseInt(startTime[1]);
        const endHour = parseInt(endTime[0]);
        const endMinute = parseInt(endTime[1]);

        if (
          startHour > endHour ||
          (startHour === endHour && startMinute >= endMinute)
        ) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: "Event start time must be before finish time" });
        }
      }
      // If only one time field is being updated, compare with the existing one
      else if (updatedData.eventStartTime) {
        const startTime = updatedData.eventStartTime.split(":");
        const endTime = currentEvent.eventFinishTime.split(":");

        if (startTime.length !== 2 || endTime.length !== 2) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: "Invalid time format. Use HH:MM format" });
        }

        const startHour = parseInt(startTime[0]);
        const startMinute = parseInt(startTime[1]);
        const endHour = parseInt(endTime[0]);
        const endMinute = parseInt(endTime[1]);

        if (
          startHour > endHour ||
          (startHour === endHour && startMinute >= endMinute)
        ) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: "Event start time must be before finish time" });
        }
      } else if (updatedData.eventFinishTime) {
        const startTime = currentEvent.eventStartTime.split(":");
        const endTime = updatedData.eventFinishTime.split(":");

        if (startTime.length !== 2 || endTime.length !== 2) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: "Invalid time format. Use HH:MM format" });
        }

        const startHour = parseInt(startTime[0]);
        const startMinute = parseInt(startTime[1]);
        const endHour = parseInt(endTime[0]);
        const endMinute = parseInt(endTime[1]);

        if (
          startHour > endHour ||
          (startHour === endHour && startMinute >= endMinute)
        ) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: "Event start time must be before finish time" });
        }
      }
    }

    if (updatedData.eventVenue && updatedData.eventVenue.length > 100) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Event venue is too long" });
    }

    // Check for duplicate event name if name is being changed
    if (
      updatedData.eventName &&
      updatedData.eventName !== currentEvent.eventName
    ) {
      const organizationId =
        updatedData.organizationId || currentEvent.organizationId;

      const duplicateEvent = await eventRegForm.findOne({
        organizationId,
        eventName: { $regex: new RegExp(`^${updatedData.eventName}$`, "i") },
        _id: { $ne: id }, // Exclude current event
      });

      if (duplicateEvent) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message:
            "An event with this name already exists in this organization",
        });
      }
    }

    // Update the event
    const updatedEvent = await eventRegForm.findByIdAndUpdate(id, updatedData, {
      new: true,
      session,
    });

    // Track which fields were updated for notification purposes
    const changedFields = [];
    Object.keys(updatedData).forEach((key) => {
      if (
        JSON.stringify(updatedData[key]) !== JSON.stringify(currentEvent[key])
      ) {
        changedFields.push({
          field: key,
          oldValue: currentEvent[key],
          newValue: updatedData[key],
        });
      }
    });

    await session.commitTransaction();
    session.endSession();

    // Get organization details for notification
    const organization = await Organization.findById(
      updatedData.organizationId || currentEvent.organizationId
    )
      .populate("president")
      .populate("staffAdvisor");

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
      changedFields: changedFields,
    });

    // Send email notifications about the update
    if (
      organization &&
      organization.president &&
      organization.staffAdvisor &&
      changedFields.length > 0
    ) {
      try {
        await sendEventUpdateNotifications(
          organization,
          updatedEvent,
          changedFields
        );
        console.log("Event update notification emails sent successfully");
      } catch (emailError) {
        console.error(
          "Failed to send event update notification emails:",
          emailError
        );
        // We don't want to fail the request if just the email sending fails
      }
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Failed to update event", error: err.message });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;
  console.log(req.user);

  if (!req.user) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the event to get its organization
    const event = await eventRegForm.findById(id);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Event not found" });
    }

    // Get organization details for notification
    const organization = await Organization.findById(event.organizationId)
      .populate("president")
      .populate("staffAdvisor");

    if (!organization) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Organization not found" });
    }

    // Store event details for notification after deletion
    const eventCopy = { ...event.toObject() };
    const oldStatus = event.eventStatus;

    // Get deleting user's info if available
    let deletedByName = null;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        deletedByName = user.firstName
          ? `${user.firstName} ${user.lastName || ""}`
          : user.email;
      }
    }

    // Remove event from organization's events array
    await Organization.findByIdAndUpdate(
      event.organizationId,
      { $pull: { eventIds: id } },
      { session }
    );

    // Delete the event
    await eventRegForm.findByIdAndDelete(id, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "Event deleted successfully" });

    // Send notification emails after successful deletion
    try {
      let error = await sendEventDeletionNotification(
        organization,
        eventCopy,
        oldStatus,
        deletedByName
      );
      console.log("Event deletion notification emails sent successfully");
    } catch (emailError) {
      console.error("Failed to send event deletion emails:", emailError);
      // We don't fail the request if email sending fails
    }
  } catch (err) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Failed to delete event", error: err.message });
  }
};

const getEventsById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await eventRegForm.findById(id).populate("organizationId");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch event",
      error: err.message,
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventsByOrganization,
  updateEventStatus,
  updateEvent,
  deleteEvent,
  getEventsById,
};
