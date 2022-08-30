const { client } = require('./postgresClient');

function addUser(data) {
  return client.query(
    `INSERT INTO users(login, password) values('${data.login}', '${data.password}')`,
  );
}

exports.addUser = addUser;
