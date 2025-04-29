const Crew = require("../models/Crew");

const createCrew = async (req, res) => {
  const { name,description, phone, email, workType, leader, profilePic } = req.body;

  try {
    const crew = new Crew({ name,description, phone, email, workType, leader, profilePic });
    await crew.save();
    res.status(201).json({ message: "Crew created successfully", crew });
  } catch (err) {
    res.status(500).json({ message: "Failed to create crew", error: err.message });
  }
};

const getCrews = async (req, res) => {
  try {
    const crews = await Crew.find();
    res.status(200).json(crews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch crews", error: err.message });
  }
};

const updateCrewStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const crew = await Crew.findById(id);
    if (!crew) {
      return res.status(404).json({ message: "Crew not found" });
    }

    crew.status = status;
    await crew.save();
    res.status(200).json({ message: "Crew status updated successfully", crew });
  } catch (err) {
    res.status(500).json({ message: "Failed to update crew status", error: err.message });
  }
};

const updateCrew = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const crew = await Crew.findByIdAndUpdate(id, updatedData, { new: true });
    if (!crew) {
      return res.status(404).json({ message: "Crew not found" });
    }
    res.status(200).json({ message: "Crew updated successfully", crew });
  } catch (err) {
    res.status(500).json({ message: "Failed to update crew", error: err.message });
  }
};

const deleteCrew = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCrew = await Crew.findByIdAndDelete(id);
    if (!deletedCrew) {
      return res.status(404).json({ message: "Crew not found" });
    }
    res.status(200).json({ message: "Crew deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete crew", error: err.message });
  }
};

// Add a new crew member to an existing crew
const addCrewMember = async (req, res) => {
  const { crewId } = req.params;
  const { name, email, phone } = req.body;

  try {
    const crew = await Crew.findById(crewId);
    if (!crew) {
      return res.status(404).json({ message: "Crew not found" });
    }

    // Add the new member to the crew's crewMembers array
    crew.crewMembers.push({ name, email, phone });
    await crew.save();

    res.status(200).json({ message: "Crew member added successfully", crew });
  } catch (err) {
    res.status(500).json({ message: "Failed to add crew member", error: err.message });
  }
};

// Update a specific crew member's details
const updateCrewMember = async (req, res) => {
  const { crewId, memberId } = req.params;
  const { name, email, phone } = req.body;

  try {
    const crew = await Crew.findById(crewId);
    if (!crew) {
      return res.status(404).json({ message: "Crew not found" });
    }

    const memberIndex = crew.crewMembers.findIndex((member) => member._id.toString() === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ message: "Crew member not found" });
    }

    crew.crewMembers[memberIndex] = { ...crew.crewMembers[memberIndex], name, email, phone };
    await crew.save();

    res.status(200).json({ message: "Crew member updated successfully", crew });
  } catch (err) {
    res.status(500).json({ message: "Failed to update crew member", error: err.message });
  }
};

// Remove a crew member
const removeCrewMember = async (req, res) => {
  const { crewId, memberId } = req.params;

  try {
    const crew = await Crew.findById(crewId);
    if (!crew) {
      return res.status(404).json({ message: "Crew not found" });
    }

    const memberIndex = crew.crewMembers.findIndex((member) => member._id.toString() === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ message: "Crew member not found" });
    }

    crew.crewMembers.splice(memberIndex, 1); // Remove the crew member from the array
    await crew.save();

    res.status(200).json({ message: "Crew member removed successfully", crew });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove crew member", error: err.message });
  }
};

module.exports = {
  createCrew,
  getCrews,
  updateCrewStatus,
  updateCrew,
  deleteCrew,
  addCrewMember,
  updateCrewMember,
  removeCrewMember,
};
