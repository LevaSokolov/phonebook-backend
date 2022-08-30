const { client } = require('./postgresClient');

function login(data) {
  return client.query(
    `SELECT * FROM users WHERE login='${data.login}' and password='${data.password}'`,
  );
}

exports.login = login;
