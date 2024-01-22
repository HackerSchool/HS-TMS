const User = require("../models/User");
const { emailLoggerFn, logInfo } = require("../modules/logging");

async function createUser(req, res) {
  const pool = req.pool;
  const { username, name } = req.body;

  // input validation
  try {
    if (username === undefined || typeof username !== "string" || !username.match(/^ist[0-9]+$/g)) {
      throw new Error(`invalid username '${JSON.stringify(username)}' (${typeof username})`);
    }
    if (name === undefined || typeof name !== "string") {
      throw new Error(`invalid name '${JSON.stringify(name)}' (${typeof name})`);
    }
    if ((await User.getOne(pool, username)) !== undefined) {
      throw new Error(`duplicate username '${username}'`);
    }
  } catch (error) {
    res.status(400).send("Invalid params");
    logInfo("userController/createUser", error.message, "Validation");
    return;
  }

  const user = await User.createOne(pool, username, name);
  res.status(201).send(user);

  delete user.photo;
  emailLoggerFn(req.user.name, "User", req.method, null, user);
}

async function deleteUser(req, res) {
  const pool = req.pool;
  const { username } = req.params;

  if (!username.match(/^ist[0-9]+$/g)) {
    res.status(400).send("Invalid params");
    logInfo("userController/deleteUser", `invalid username '${username}'`, "Validation");
    return;
  }

  const deletedUser = await User.deleteOne(pool, username);

  if (deletedUser === undefined) return res.status(404).send("User not found");

  res.status(204).end();

  delete deletedUser.photo;
  emailLoggerFn(req.user.name, "User", req.method, deletedUser, null);
}

async function getAllUsers(req, res) {
  const pool = req.pool;

  res.status(200).send(await User.getAll(pool));
}

module.exports = {
  createUser,
  deleteUser,
  getAllUsers,
};
