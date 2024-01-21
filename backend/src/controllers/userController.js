const User = require("../models/User");
const { emailLoggerFn } = require("../modules/logging");

async function createUser(req, res) {
  const pool = req.pool;
  const { username, name } = req.body;

  if (
    username === undefined ||
    typeof username !== "string" ||
    !username.match(/^ist[0-9]+$/g) ||
    name === undefined ||
    typeof name !== "string" ||
    (await User.getOne(pool, username)) !== undefined
  )
    return res.status(400).send("Invalid params");

  const user = await User.createOne(pool, username, name);
  res.status(201).send(user);

  delete user.photo;
  emailLoggerFn(req.user.name, "User", req.method, null, user);
}

async function deleteUser(req, res) {
  const pool = req.pool;
  const { username } = req.params;

  if (!username.match(/^ist[0-9]+$/g)) return res.status(400).send("Invalid params");

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
