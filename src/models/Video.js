const { run, all, get } = require("../db/db");

class Video {
  static async create({ title, videoUrl, transcript, userId }) {
    return await run(
      `INSERT INTO Videos (title, videoUrl, transcript, summary, userId)
       VALUES (?, ?, ?, NULL, ?)`,
      [title, videoUrl, transcript, userId]
    );
  }

  static async findByUser(userId) {
    return await all("SELECT * FROM Videos WHERE userId = ? ORDER BY createdAt DESC", [userId]);
  }

  static async findById(id) {
    return await get("SELECT * FROM Videos WHERE id = ?", [id]);
  }
}

module.exports = Video;
