
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kitenge',
  password: '1930', // Replace with your password
  port: 5432,
});

const seed = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
      ['admin@kitenge.com', hashedPassword]
    );

    console.log('Admin user seeded successfully');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    pool.end();
  }
};

seed();
