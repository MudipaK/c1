// POST route to assign a staff advisor to an event
staffAdvisorRoutes.route("/staff-advisor").post(verifyToken, async (request, response) => {
    let db = database.getDb();
    const { eventId, staffAdvisorDetails } = request.body; // Assuming eventId and staffAdvisorDetails are passed in the request body

    try {
        // Check if the event exists
        const event = await db.collection("events").findOne({ _id: new ObjectId(eventId) });
        if (!event) {
            return response.status(404).json({ message: "Event not found." });
        }

        // Check if a staff advisor is already assigned
        const existingAdvisor = await db.collection("staff_advisors").findOne({ eventID: new ObjectId(eventId) });
        if (existingAdvisor) {
            return response.status(400).json({ message: "A staff advisor is already assigned to this event." });
        }

        // Insert the new staff advisor details
        const result = await db.collection("staff_advisors").insertOne({
            eventID: new ObjectId(eventId),
            ...staffAdvisorDetails,
        });

        response.status(201).json({ message: "Staff advisor assigned successfully.", result });
    } catch (error) {
        console.error("Error assigning staff advisor:", error);
        response.status(500).json({ message: "Internal Server Error" });
    }
});

// PUT route to update staff advisor details for an event
staffAdvisorRoutes.route("/staff-advisor/:eventId").put(verifyToken, async (request, response) => {
    let db = database.getDb();
    const eventId = request.params.eventId;
    const staffAdvisorDetails = request.body; // Assuming the updated details are passed in the request body

    try {
        // Check if the event exists
        const event = await db.collection("events").findOne({ _id: new ObjectId(eventId) });
        if (!event) {
            return response.status(404).json({ message: "Event not found." });
        }

        // Check if a staff advisor is assigned to the event
        const staffAdvisor = await db.collection("staff_advisors").findOne({ eventID: new ObjectId(eventId) });
        if (!staffAdvisor) {
            return response.status(404).json({ message: "No staff advisor assigned to this event." });
        }

        // Update the staff advisor details
        const result = await db.collection("staff_advisors").updateOne(
            { eventID: new ObjectId(eventId) },
            { $set: staffAdvisorDetails }
        );

        response.status(200).json({ message: "Staff advisor updated successfully.", result });
    } catch (error) {
        console.error("Error updating staff advisor:", error);
        response.status(500).json({ message: "Internal Server Error" });
    }
});

// DELETE route to remove a staff advisor from an event
staffAdvisorRoutes.route("/staff-advisor/:eventId").delete(verifyToken, async (request, response) => {
    let db = database.getDb();
    const eventId = request.params.eventId;

    try {
        // Check if the event exists
        const event = await db.collection("events").findOne({ _id: new ObjectId(eventId) });
        if (!event) {
            return response.status(404).json({ message: "Event not found." });
        }

        // Check if a staff advisor is assigned to the event
        const staffAdvisor = await db.collection("staff_advisors").findOne({ eventID: new ObjectId(eventId) });
        if (!staffAdvisor) {
            return response.status(404).json({ message: "No staff advisor assigned to this event." });
        }

        // Delete the staff advisor
        const result = await db.collection("staff_advisors").deleteOne({ eventID: new ObjectId(eventId) });

        response.status(200).json({ message: "Staff advisor removed successfully.", result });
    } catch (error) {
        console.error("Error removing staff advisor:", error);
        response.status(500).json({ message: "Internal Server Error" });
    }
});



module.exports = staffAdvisorRoutes;
