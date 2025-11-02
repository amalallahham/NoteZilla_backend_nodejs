const { run, get } = require("../db/db");

const User = {
  async findByEmail(email) {
    const user = await get(
      `SELECT * FROM Users WHERE LOWER(email) = LOWER(?)`,
      [email.trim()]
    );
    console.log("findByEmail:", email, "->", user);
    return user;
  },

  findById(id) {
    return get(`SELECT * FROM Users WHERE id = ?`, [id]);
  },

  async create({ firstName, lastName, email, passwordHash, role = "user" }) {
    return run(
      `INSERT INTO Users (firstName, lastName, email, passwordHash, role, apiCalls)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [firstName, lastName, email, passwordHash, role]
    );
  },

  async incrementApiCalls(userId) {
    return run(`UPDATE Users SET apiCalls = apiCalls + 1 WHERE id = ?`, [
      userId,
    ]);
  },

  //Checks if user has calls remaining
  async hasApiCallsRemaining(userId, limit = 20) {
    const user = await get(`SELECT apiCalls FROM Users WHERE id = ?`, [userId]);
    if (!user) return false;
    return user.apiCalls < limit;
  },

  //Gets current API call count
  async getApiCallsCount(userId) {
    const user = await get(`SELECT apiCalls FROM Users WHERE id = ?`, [userId]);
    return user ? user.apiCalls : null;
  },
};

module.exports = User;
