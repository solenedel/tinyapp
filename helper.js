
// ----------------- DEPENDENCIES & SETUP ------------------------- //

const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { request } = require('express');  // ??
const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['key0','key1'],
}));

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));


// ------------------ IMPORTED DATA -------------------- //

const { urlDatabase, users } = require('./express_server.js');


// ------------------- HELPER FUNCTIONS --------------------------- //

// generate shortURL OR userID
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};


// filter urlDatabase for user-specific urls
const urlForUser = userid => {

  const filteredObj = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userid) {
      filteredObj[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredObj;
};


// REGISTER: check if email is already registered
const emailLookup = (testEmail, users) => {
  for (const user in users) {
    if (users[user]['email'] === testEmail) {
      response.status(400).send("This email is already registered in our system");
    }
  }
  return; 
};


// LOGIN: verification of email and password
const getUserByEmail = (testEmail, testPassword, users) => {

  let userID;

  // check input against email/password stored in database
  for (const user in users) {
    if (users[user]['email'] === testEmail) {
      if (bcrypt.compareSync(testPassword, users[user]['password'])) {
        userID = users[user]['id'];
        console.log
        request.session.user_id = userID;
        response.redirect('/urls');
        return true;
      }
    }
  }
};





// ------------------ EXPORTED FUNCTIONS -------------------- //

module.exports = { urlForUser, generateRandomString, getUserByEmail, emailLookup };