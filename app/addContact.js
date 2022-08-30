const { client } = require('./postgresClient');

function getAllContactsWithMatchingNumber(data) {
  return client.query(
    `SELECT * FROM contacts where phone_number=${data.phone_number}`,
  );
}

function addContact(data, userId) {
  return client.query(
    `INSERT INTO contacts(first_name, last_name, phone_number, user_id) values('${data.first_name}', '${data.last_name}', ${data.phone_number}, ${userId})`,
  );
}
exports.getAllContactsWithMatchingNumber = getAllContactsWithMatchingNumber;

exports.addContact = addContact;
