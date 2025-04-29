const express = require("express");
const { authenticationUtil,authorizationUtil } = require("../utils");
const {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} = require("../controllers/organizationController");

const organizationRouter = express.Router();

organizationRouter.post("/createOrganization", authenticationUtil,authorizationUtil(["staff advisor"]),createOrganization);
organizationRouter.get("/getOrganizations", getAllOrganizations);
organizationRouter.get("/getOrganization/:id", getOrganizationById);
organizationRouter.put("/updateOrganization/:id", authenticationUtil,authorizationUtil(["staff advisor"]), updateOrganization);
organizationRouter.delete("/deleteOrganization/:id", authenticationUtil,authorizationUtil(["staff advisor"]), deleteOrganization);

module.exports = organizationRouter;
