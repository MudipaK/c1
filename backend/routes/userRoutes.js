const express = require("express");
const { authenticationUtil } = require("../utils");
const {
  getUsers,
  deleteUser,
  createUser,
  updateUser,
} = require("../controllers/userController");

const userRouter = express.Router();

// Routes for CRUD operations on users
userRouter.get("/getUsers", authenticationUtil, getUsers);
// userRouter.post("/users", createUser);
userRouter.delete("/deleteUser/:id", authenticationUtil, deleteUser);
userRouter.put("/updateUser/:id", authenticationUtil, updateUser);

module.exports = userRouter;
