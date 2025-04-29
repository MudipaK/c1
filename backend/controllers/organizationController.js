const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Organization = require("../models/Organization");
const User = require("../models/User");
const { sendOrganizationDeletionNotifications, sendOrganizationUpdateNotifications, sendClubCreationNotifications } = require("../utils/sendOrganisationEmails");

const organizationValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Organization name is required")
    .isLength({ min: 3 })
    .withMessage("Organization name must be at least 3 characters long"),

  body("president").trim().notEmpty().withMessage("President is required"),

  body("staffAdvisor")
    .trim()
    .notEmpty()
    .withMessage("Staff Advisor is required"),

  body("eventIds")
    .optional()
    .isArray()
    .withMessage("Event IDs must be an array")
    .custom(
      (value) =>
        !value.length ||
        value.every((id) => mongoose.Types.ObjectId.isValid(id))
    )
    .withMessage("Invalid Event ID(s)"),
];

const createOrganization = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, president, staffAdvisor, eventIds } = req.body;

    // Check if the staff advisor exists and has the correct role
    const advisorUser = await User.findById(staffAdvisor);
    if (!advisorUser) {
      return res.status(400).json({ message: "Staff advisor not found" });
    }
    if (advisorUser.role !== "staff advisor") {
      return res
        .status(400)
        .json({ message: "Selected user is not a staff advisor" });
    }

    // Check if the president exists and is a valid user
    const presidentUser = await User.findById(president);
    if (!presidentUser) {
      return res.status(400).json({ message: "President user not found" });
    }

    // Check if organization with same name already exists
    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) {
      return res
        .status(400)
        .json({ message: "Organization with this name already exists" });
    }

    const newOrganization = new Organization({
      name,
      president,
      staffAdvisor,
      eventIds: eventIds || [],
    });

    await newOrganization.save();

    // Populate the references before sending response
    const populatedOrg = await Organization.findById(newOrganization._id)
      .populate("president", "username email")
      .populate("staffAdvisor", "username email")
      .populate("eventIds");

    // Send notification emails
    sendClubCreationNotifications(populatedOrg).catch((err) =>
      console.error("Failed to send notifications:", err)
    );

    res.status(201).json({
      message: "Organization created successfully",
      organization: populatedOrg,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAllOrganizations = async (req, res) => {
  try {
    // Populate president, staff advisor and events
    const organizations = await Organization.find()
      .populate("president", "username email")
      .populate("staffAdvisor", "username email")
      .populate("eventIds");

    res.json(organizations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getOrganizationById = async (req, res) => {
  const { id } = req.params;
  try {
    // Populate president, staff advisor and events
    const organization = await Organization.findById(id)
      .populate("president", "username email")
      .populate("staffAdvisor", "username email")
      .populate("eventIds");

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.json(organization);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update the updateOrganization function:
const updateOrganization = async (req, res) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, president, staffAdvisor, eventIds } = req.body;

    const organization = await Organization.findById(id)
      .populate("president", "username email")
      .populate("staffAdvisor", "username email");

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Track what changes are being made for notifications
    const changes = [];

    if (name && name !== organization.name) {
      // Check for duplicates
      const existingOrg = await Organization.findOne({ name });
      if (existingOrg) {
        return res
          .status(400)
          .json({ message: "Organization with this name already exists" });
      }
      changes.push(`Name changed from "${organization.name}" to "${name}"`);
    }

    // If president is being updated, validate the new president
    if (president && president !== organization.president.toString()) {
      const presidentUser = await User.findById(president);
      if (!presidentUser) {
        return res.status(400).json({ message: "President user not found" });
      }
      changes.push(`President updated to ${presidentUser.username}`);
    }

    // If staff advisor is being updated, validate the new advisor
    if (staffAdvisor && staffAdvisor !== organization.staffAdvisor.toString()) {
      const advisorUser = await User.findById(staffAdvisor);
      if (!advisorUser) {
        return res.status(400).json({ message: "Staff advisor not found" });
      }
      if (advisorUser.role !== "staff advisor") {
        return res
          .status(400)
          .json({ message: "Selected user is not a staff advisor" });
      }
      changes.push(`Staff Advisor updated to ${advisorUser.username}`);
    }

    // Check if events were added or removed
    if (
      eventIds &&
      JSON.stringify(eventIds) !== JSON.stringify(organization.eventIds)
    ) {
      if (eventIds.length > organization.eventIds.length) {
        changes.push(`Events added to organization`);
      } else if (eventIds.length < organization.eventIds.length) {
        changes.push(`Events removed from organization`);
      } else {
        changes.push(`Event list updated`);
      }
    }

    // Save the original organization for notification purposes
    const originalOrg = { ...organization.toObject() };

    // Update organization fields
    organization.name = name || organization.name;
    organization.president = president || organization.president;
    organization.staffAdvisor = staffAdvisor || organization.staffAdvisor;
    organization.eventIds = eventIds || organization.eventIds;

    await organization.save();

    // Populate the references before sending response
    const populatedOrg = await Organization.findById(organization._id)
      .populate("president", "username email")
      .populate("staffAdvisor", "username email")
      .populate("eventIds");

    // Send notification emails if there are changes
    if (changes.length > 0) {
      sendOrganizationUpdateNotifications(populatedOrg, changes).catch((err) =>
        console.error("Failed to send update notifications:", err)
      );
    }

    res.json({
      message: "Organization updated successfully",
      organization: populatedOrg,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update the deleteOrganization function:
const deleteOrganization = async (req, res) => {
  const { id } = req.params;

  try {
    // First get the organization with populated fields for notification
    const organization = await Organization.findById(id)
      .populate("president", "username email")
      .populate("staffAdvisor", "username email");

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (organization.eventIds.length) {
      return res
        .status(400)
        .json({ message: "Cannot delete organization with events" });
    }

    // Store organization data before deletion
    const orgData = { ...organization.toObject() };

    // Delete the organization
    await Organization.findByIdAndDelete(id);

    // Send notification emails about the deletion
    sendOrganizationDeletionNotifications(orgData).catch((err) =>
      console.error("Failed to send deletion notifications:", err)
    );

    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete organization" });
  }
};

module.exports = {
  organizationValidator,
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
