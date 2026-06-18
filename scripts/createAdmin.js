require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function main() {
  const [, , name, email, password] = process.argv;
  if (!name || !email || !password) {
    console.log('Usage: node scripts/createAdmin.js "Admin Name" admin@example.com 91029102');
    process.exit(1);
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  const hashed = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')", [name, email, hashed]);

  console.log("Admin created:", email);
  process.exit(0);
}

main();