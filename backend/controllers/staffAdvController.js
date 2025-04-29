const mongoose = require("mongoose");
const StaffAdvisor = require("../models/staffAdvisorModel");

// Get all staff advisors
const getStaffAdvisors = async (req, res) => {
    try {
        const staffAdvisors = await StaffAdvisor.find({}).sort({ createdAt: -1 });
        res.status(200).json(staffAdvisors);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get a single staff advisor by ID
const getStaffAdvisor = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid staff advisor ID" });
    }

    try {
        const staffAdvisor = await StaffAdvisor.findById(id);
        if (!staffAdvisor) {
            return res.status(404).json({ error: "Staff advisor not found" });
        }
        res.status(200).json(staffAdvisor);
    } catch (error) {
        res.status(500).json({ error: "Error fetching staff advisor" });
    }
};

// Create a new staff advisor
const createStaffAdvisor = async (req, res) => {
    const {
        name,
        email,
        phoneNumber,
        faculty,
        department,
        clubName,
        eventID
    } = req.body;

    if (!eventID) {
        return res.status(400).json({ error: "An event must be assigned to the staff advisor" });
    }

    try {
        const staffAdvisor = await StaffAdvisor.create({
            name,
            email,
            phoneNumber,
            faculty,
            department,
            clubName,
            eventID
        });

        res.status(201).json(staffAdvisor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a staff advisor
const deleteStaffAdvisor = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid staff advisor ID" });
    }

    try {
        const staffAdvisor = await StaffAdvisor.findByIdAndDelete(id);
        if (!staffAdvisor) {
            return res.status(404).json({ error: "Staff advisor not found" });
        }

        res.status(200).json({ message: "Staff advisor deleted successfully", staffAdvisor });
    } catch (error) {
        res.status(500).json({ error: "Error deleting staff advisor" });
    }
};

// Update a staff advisor
const updateStaffAdvisor = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid staff advisor ID" });
    }

    try {
        const staffAdvisor = await StaffAdvisor.findByIdAndUpdate(id, req.body, { new: true });
        if (!staffAdvisor) {
            return res.status(404).json({ error: "Staff advisor not found" });
        }

        res.status(200).json(staffAdvisor);
    } catch (error) {
        res.status(500).json({ error: "Error updating staff advisor" });
    }
};

module.exports = {
    getStaffAdvisor,
    getStaffAdvisors,
    createStaffAdvisor,
    updateStaffAdvisor,
    deleteStaffAdvisor
};
