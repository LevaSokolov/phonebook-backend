const { client } = require('./postgresClient');

function getAllContacts(userId) {
  return client.query(`SELECT * FROM contacts WHERE user_id=${userId}`);
}

exports.getAllContacts = getAllContacts;
