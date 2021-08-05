
// ----------------- DEPENDENCIES & SETUP ------------------------- //

const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { request, response } = require('express');  // ??
const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['key0','key1'],
}));

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));


// ------------------ IMPORTED DATA -------------------- //



// ------------------- HELPER FUNCTIONS --------------------------- //

// generate shortURL OR userID
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};


// filter urlDatabase for user-specific urls
const urlForUser = (userid, urlDatabase) => {

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
      return true;
      
    }
  }
  return; 
};


// LOGIN: verification of email and password
const getUserByEmail = (testEmail, testPassword, users) => {


  // check input against email/password stored in database
  for (const user_id in users) {
    if (users[user_id]['email'] === testEmail) {
      if (bcrypt.compareSync(testPassword, users[user_id]['password'])) {
    
        //response.redirect('/urls');
        return user_id;
      }
    }
  }
};





// ------------------ EXPORTED FUNCTIONS -------------------- //

module.exports = { urlForUser, generateRandomString, getUserByEmail, emailLookup };