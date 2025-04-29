const express = require("express");
const { authenticationUtil } = require("../utils");
const {
    createEvent,
    getEvents,
    updateEventStatus,
    updateEvent,
    deleteEvent,
    getEventsByOrganization,
    getEventsById,
} = require("../controllers/eventController");

const eventRegRouter = express.Router();

// Middleware to authenticate the user
eventRegRouter.post("/createEvent", authenticationUtil, createEvent);
eventRegRouter.get("/getEvents/:organizationId", authenticationUtil, getEventsByOrganization);        
eventRegRouter.put("/updateEventStatus/:id", authenticationUtil, updateEventStatus);
eventRegRouter.put("/updateEvent/:id", authenticationUtil, updateEvent);
eventRegRouter.delete("/deleteEvent/:id", authenticationUtil, deleteEvent);
eventRegRouter.get("/getAllEvents", getEvents); // Get all events
eventRegRouter.get("/getEventById/:id", getEventsById); // Get event by ID
// Add event
eventRegRouter.post("/addEvent", authenticationUtil, createEvent);  

//Update and remove event
eventRegRouter.put("/updateEvent/:id", authenticationUtil, updateEvent);
eventRegRouter.delete("/removeEvent/:id", authenticationUtil, deleteEvent);

module.exports = eventRegRouter;