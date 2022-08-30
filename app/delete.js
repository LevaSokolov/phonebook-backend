const { client } = require('./postgresClient');

function deleteContact(userId, contactId) {
  return client.query(
    `DELETE FROM contacts WHERE id=${contactId} and user_id=${userId}`,
  );
}

exports.deleteContact = deleteContact;
