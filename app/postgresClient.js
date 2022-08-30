const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'PhoneBook',
  password: '338671',
  port: 8000,
});

exports.client = client;
