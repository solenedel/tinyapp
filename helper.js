
// ----------------- DEPENDENCIES & SETUP ------------------------- //

const bcrypt = require('bcrypt');

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
const verifyCredentials = (testEmail, testPassword, users) => {

  // check input against email/password stored in database
  for (const user_id in users) {
    if (users[user_id]['email'] === testEmail) {
      if (bcrypt.compareSync(testPassword, users[user_id]['password'])) {
        return user_id;
      }
    }
  }
  return undefined;
};


// Adding http:// to the longURL is not included by user
const appendHttp = longURL => {

  if (!(longURL).includes('http')) {
    longURL = 'http://' + longURL;
  }
  return longURL;
};




// ------------------ EXPORTED FUNCTIONS -------------------- //

module.exports = { urlForUser, generateRandomString, verifyCredentials, emailLookup, appendHttp };