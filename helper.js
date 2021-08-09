
// ----------------- DEPENDENCIES & SETUP ------------------------- //

const bcrypt = require('bcrypt');


// ------------------- HELPER FUNCTIONS --------------------------- //

// Function used to generate shortURL or userID. 
// The output is an alphanumeric string of 6 characters.
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};


// Filter urlDatabase to only retrieve the URLs
// created by the current logged in user. 
const urlForUser = (userid, urlDatabase) => {

  const filteredObj = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userid) {
      filteredObj[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredObj;
};


// Registration check: search for email entered by user in the users database.
// This is to avoid a new user registering with an existing address
const emailLookup = (testEmail, users) => {

  for (const user in users) {
    if (users[user]['email'] === testEmail) {
      return true;
    }
  }
  return;
};


// LOGIN: verification of email and password entered by user.
const verifyCredentials = (testEmail, testPassword, users) => {

  // check user input against email/password stored in database.
  for (const user_id in users) {
    if (users[user_id]['email'] === testEmail) {
      if (bcrypt.compareSync(testPassword, users[user_id]['password'])) {
        return user_id;
      }
    }
  }
  return undefined;
};


// Adds http:// to the longURL if not included by user.
// If http:// is not included, the URL will not be valid.
const appendHttp = longURL => {

  if (!(longURL).includes('http')) {
    longURL = 'http://' + longURL;
  }
  return longURL;
};




// ------------------ EXPORTED FUNCTIONS -------------------- //

module.exports = { urlForUser, generateRandomString, verifyCredentials, emailLookup, appendHttp };