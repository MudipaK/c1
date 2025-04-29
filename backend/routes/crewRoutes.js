const express = require("express");
const { authenticationUtil } = require("../utils");
const {
  createCrew,
  getCrews,
  updateCrewStatus,
  updateCrew,
  deleteCrew,
  addCrewMember,
  updateCrewMember,
  removeCrewMember,
} = require("../controllers/crewController");

const crewRouter = express.Router();

crewRouter.post("/createCrew", authenticationUtil, createCrew);
crewRouter.get("/getCrews", authenticationUtil, getCrews);
crewRouter.put("/updateCrewStatus/:id", authenticationUtil, updateCrewStatus);
crewRouter.put("/updateCrew/:id", authenticationUtil, updateCrew);
crewRouter.delete("/deleteCrew/:id", authenticationUtil, deleteCrew);

// Add crew member
crewRouter.post("/addCrewMember/:crewId", authenticationUtil, addCrewMember);

// Update and remove crew members
crewRouter.put("/updateCrewMember/:crewId/:memberId", authenticationUtil, updateCrewMember);
crewRouter.delete("/removeCrewMember/:crewId/:memberId", authenticationUtil, removeCrewMember);

module.exports = crewRouter;
