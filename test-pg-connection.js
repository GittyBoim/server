const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.prisma.io',
  port: 5432,
  user: '9eb83fa7fa96823bdac81998aa56b4e6aa1b1c16079184070cb6a02cc4ed381e',
  password: 'sk_K7mkvGmrfb5b65RzmPPhohFv',
  ssl: true
});

pool.query('SELECT current_database(), current_user, version()', (err, res) => {
  if (err) {
    console.error('Connection/Query error:', err);
  } else {
    console.log('Successfully connected!');
    console.log('Database:', res.rows[0]);
  }
  pool.end();
});
