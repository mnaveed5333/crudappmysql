require("dotenv").config({ path: ".env.local" });

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function main() {
  // Hardcoded admin details
  const name = "Admin";
  const email = "admin@example.com";
  const password = "admin123"; // Change this to your desired password

  try {
    // Create a connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new admin into the database
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')",
      [name, email, hashedPassword]
    );

    // Log success message
    console.log(`
      ✅ Admin created successfully!
      ---------------------------------
      Name:    ${name}
      Email:   ${email}
      Role:    admin
      ID:      ${result.insertId}
      ---------------------------------
    `);

    process.exit(0);
  } catch (error) {
    console.error(`
      ❌ Error creating admin:
      ${error.message}
    `);
    process.exit(1);
  }
}

main();