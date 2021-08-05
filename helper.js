


// ------------------- HELPER FUNCTIONS --------------------------- //

// generate shortURL OR userID
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

// email lookup: get a user by their email
const getUserByEmail = (email, password, users) => {

  let userID;

  // login check
  for (const user in users) {
    if (users[user]['email'] === email) {
      if (bcrypt.compareSync(password, users[user]['password'])) {
        userID = users[user]['id'];
        console.log
        request.session.user_id = userID;
        response.redirect('/urls');
        return user;
      }
    }
  }

  // registration check
  // for (const user in users) {
  //   if (users[user]['email'] === email) {
  //     response.status(400).send("This email is already registered in our system");
  //   }
  // } 

  //return user;
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


// ------------------ EXPORTED MODULES -------------------- //

module.exports = { urlForUser, generateRandomString, getUserByEmail };