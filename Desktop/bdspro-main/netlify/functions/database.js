// Simple file-based database for Netlify functions
// In production, replace this with a real database like PlanetScale, Supabase, etc.

const fs = require('fs');
const path = require('path');

const DB_FILE = '/tmp/bds_pro_db.json';

// Initialize database
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      transactions: [],
      referrals: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Read database
function readDB() {
  initDB();
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

// Write database
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// User operations
function createUser(userData) {
  const db = readDB();
  db.users.push(userData);
  writeDB(db);
  return userData;
}

function findUserByEmail(email) {
  const db = readDB();
  return db.users.find(user => user.email === email);
}

function findUserById(userId) {
  const db = readDB();
  return db.users.find(user => user.user_id === userId);
}

function updateUser(userId, updates) {
  const db = readDB();
  const userIndex = db.users.findIndex(user => user.user_id === userId);
  if (userIndex !== -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    writeDB(db);
    return db.users[userIndex];
  }
  return null;
}

module.exports = {
  initDB,
  readDB,
  writeDB,
  createUser,
  findUserByEmail,
  findUserById,
  updateUser
};
