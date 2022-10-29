/* eslint-disable no-unused-vars */
const http = require('http');

const jwt = require('jsonwebtoken');

const url = require('url');

const { deleteContact } = require('./delete');

const { login } = require('./login');

const {
  addContact,
  getAllContactsWithMatchingNumber,
} = require('./addContact');

const { addUser } = require('./addUser');

const { getAllContacts } = require('./getContacts');

const { client } = require('./postgresClient');

const port = 5432;

const SECRET = 'shhhhh';

// eslint-disable-next-line no-unused-vars
function errorHandler(errorMessage, response) {
  response.statusCode = 400;
  response.end(JSON.stringify({ message: errorMessage }));
}

function getUserId(headers, response) {
  try {
    const token = headers.authorization;
    const decoded = jwt.verify(token, SECRET);
    const { userId } = decoded;
    return userId;
  } catch (err) {
    errorHandler('Token error', response);
    return null;
  }
}

function getDataFromRequestBody(request) {
  return new Promise((resolve) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk.toString();
    });
    request.on('end', () => {
      const data = JSON.parse(body);
      resolve(data);
    });
  });
}
client.connect();

http
  .createServer(async (request, response) => {
    const returnError = (errorMessage) => {
      errorHandler(errorMessage, response);
    };
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');
    response.setHeader('Access-Control-Allow-Methods', '*');
    // e: {message: error text};
    // GET
    if (request.method === 'GET') {
      if (request.url === '/contacts') {
        const userId = getUserId(request.headers, response);
        if (!userId) {
          return;
        }
        getAllContacts(userId).then((result) => {
          const rawResult = result.rows;
          const resultJson = JSON.stringify(rawResult);
          response.end(resultJson);
        });
        return;
      }
    }
    if (request.method === 'POST') {
      // POST
      if (request.url === '/contacts-add') {
        const data = await getDataFromRequestBody(request);
        const userId = getUserId(request.headers, response);
        if (!data.phone_number) {
          returnError('Fill phone number field');
          return;
        }
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(data.phone_number)) {
          returnError('Do not write letters in phone field, fool');
          return;
        }
        getAllContactsWithMatchingNumber(data).then((result) => {
          const contacts = result.rows;
          if (contacts.length === 0) {
            addContact(data, userId).then(() => {
              response.end(JSON.stringify({ message: 'Contact added' }));
            });
          } else {
            returnError('Phone number already exists');
          }
        });
        return;
      }
      if (request.url === '/add-user') {
        const data = await getDataFromRequestBody(request);
        addUser(data)
          .then((result) => {
            response.end(JSON.stringify(result));
          })
          .catch((e) => {
            if (e.code === '23505') {
              returnError('This username already taken, dude');
            }
          });
        return;
      }
      if (request.url === '/login') {
        const data = await getDataFromRequestBody(request);
        login(data)
          .then((result) => {
            if (result.rows.length === 0) {
              throw new Error('Wrong login or pass');
            }
            const token = jwt.sign({ userId: `${result.rows[0].id}` }, SECRET);
            response.end(JSON.stringify({ token }));
          })
          .catch((e) => {
            response.statusCode = 401;
            response.end(JSON.stringify({ message: e.message }));
          });
        return;
      }
    }
    // DELETE
    if (request.method === 'DELETE') {
      if (request.url === '/contacts') {
        const userId = getUserId(request.headers, response);
        const data = await getDataFromRequestBody(request);
        deleteContact(userId, data.contactId)
          .then(() => {
            response.end();
          })
          .catch(() => {
            returnError('Failure');
          });
      }
    }
    response.end();
  })
  .listen(port);
