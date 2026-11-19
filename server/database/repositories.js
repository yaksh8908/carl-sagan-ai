const toUser = (row) =>
  row && { id: row.id, name: row.name, email: row.email, passwordHash: row.password_hash, createdAt: row.created_at };

const toConversation = (row) =>
  row && {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.message_count !== undefined && { messageCount: row.message_count }),
  };

const toMessage = (row) =>
  row && { id: row.id, conversationId: row.conversation_id, role: row.role, content: row.content, createdAt: row.created_at };

export function createRepositories(db) {
  const q = {
    userCreate: db.prepare('INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)'),
    userByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    userById: db.prepare('SELECT * FROM users WHERE id = ?'),
    userRename: db.prepare('UPDATE users SET name = ? WHERE id = ?'),

    sessionCreate: db.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'),
    sessionGet: db.prepare('SELECT * FROM sessions WHERE id = ?'),
    sessionDelete: db.prepare('DELETE FROM sessions WHERE id = ?'),
    sessionPurge: db.prepare('DELETE FROM sessions WHERE expires_at <= ?'),

    convList: db.prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count
         FROM conversations c WHERE c.user_id = ? ORDER BY c.updated_at DESC, c.id DESC`
    ),
    convCount: db.prepare('SELECT COUNT(*) AS n FROM conversations WHERE user_id = ?'),
    convCreate: db.prepare('INSERT INTO conversations (user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?)'),
    convOwned: db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?'),
    convDelete: db.prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?'),
    convTouch: db.prepare('UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?'),

    msgList: db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC'),
    msgRecent: db.prepare(
      `SELECT * FROM (SELECT * FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?) ORDER BY id ASC`
    ),
    msgInsert: db.prepare('INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)'),
    msgGet: db.prepare('SELECT * FROM messages WHERE id = ?'),
  };

  return {
    transaction(fn) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const result = fn();
        db.exec('COMMIT');
        return result;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    users: {
      create({ name, email, passwordHash }) {
        const { lastInsertRowid } = q.userCreate.run(name, email, passwordHash, new Date().toISOString());
        return toUser(q.userById.get(Number(lastInsertRowid)));
      },
      findByEmail: (email) => toUser(q.userByEmail.get(email)),
      findById: (id) => toUser(q.userById.get(id)),
      rename(id, name) {
        q.userRename.run(name, id);
        return toUser(q.userById.get(id));
      },
    },

    sessions: {
      create: ({ id, userId, expiresAt }) => q.sessionCreate.run(id, userId, new Date().toISOString(), expiresAt),
      find: (id) => q.sessionGet.get(id) ?? null,
      delete: (id) => q.sessionDelete.run(id),
      purgeExpired: (now = Date.now()) => q.sessionPurge.run(now).changes,
    },

    conversations: {
      listByUser: (userId) => q.convList.all(userId).map(toConversation),
      countByUser: (userId) => q.convCount.get(userId).n,
      create(userId, title) {
        const now = new Date().toISOString();
        const { lastInsertRowid } = q.convCreate.run(userId, title, now, now);
        return toConversation(q.convOwned.get(Number(lastInsertRowid), userId));
      },
      findOwned: (id, userId) => toConversation(q.convOwned.get(id, userId)),
      delete: (id, userId) => q.convDelete.run(id, userId).changes > 0,
      touch: (id, title, updatedAt) => q.convTouch.run(title, updatedAt, id),
    },

    messages: {
      list: (conversationId) => q.msgList.all(conversationId).map(toMessage),
      recent: (conversationId, limit) => q.msgRecent.all(conversationId, limit).map(toMessage),
      insert(conversationId, role, content, createdAt = new Date().toISOString()) {
        const { lastInsertRowid } = q.msgInsert.run(conversationId, role, content, createdAt);
        return toMessage(q.msgGet.get(Number(lastInsertRowid)));
      },
    },
  };
}
