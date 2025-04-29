const express = require("express");
const { authorizationUtil, authenticationUtil } = require("../utils");
const {
  login,
  register,
  changeRole,
  changePassword,
  getUserDetails,
} = require("../controllers");

const authRouter = express.Router();

authRouter.get("/getUserDetails", authenticationUtil, getUserDetails);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.put(
  "/change-role",
  authenticationUtil,
  authorizationUtil(["staff admin"]),
  changeRole
);
authRouter.put("/change-password", authenticationUtil, changePassword);

module.exports = authRouter;
