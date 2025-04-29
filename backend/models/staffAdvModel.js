const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const staffAdvisorSchema = new Schema({
    eventID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "eventRegForm"
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    faculty: {
        type: String,
        required: true
    },

    department: {
        type: String,
        required: true
    },

    clubName: {
        type: String,
        required: true
    }
});

const StaffAdvisor = mongoose.model("StaffAdvisor", staffAdvisorSchema);

module.exports = StaffAdvisor;
