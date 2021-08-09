
// ---------------------- DATA ------------------------- //

// stores URLs (test data below)
const urlDatabase = {
  "test1": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  "test2": {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  },
  "test3": {
    longURL: "https://www.ecosia.org",
    userID: "131hbs"
  }
};


// stores user data (test data below)
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$ZSsUvBpNxGbS9qAalvESt.qydnJ/0f982H3gZMyK24OEUn9Hkopq2"
  },
};


module.exports = { urlDatabase, users };