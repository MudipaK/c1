const mongoose = require("mongoose");

const crewMemberSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
  });
  
  const crewSchema = new mongoose.Schema({
    name: String,
    description:String,
    phone: String,
    email: String,
    workType: String,
    leader: String,
    profilePic: String,
    status: { type: String, default: "active" },
    crewMembers: [crewMemberSchema], 
  });
  
  module.exports = mongoose.model("Crew", crewSchema);