const { assert, expect } = require('chai');
const bcrypt = require('bcrypt');

const { urlForUser, generateRandomString, verifyCredentials, emailLookup, appendHttp } = require('../helper.js');

// ------------------ TEST DATA ------------------ //

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};


const urlDatabase = {
  "test1": {
    longURL: "https://www.example.org",
    userID: "aJ48lW"
  },
  "test2": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  "test3": {
    longURL: "https://www.ecosia.org",
    userID: "131hbs"
  }
};


// --------------------- TEST: verifyCredentials ------------------------- //

describe('verifyCredentials', function() {

  it('should return a user id if the email and password is valid', function() {
    const user = verifyCredentials("user@example.com", "purple-monkey-dinosaur", testUsers);
    const expectedOutput = "userRandomID";
      expect(user).to.equal(expectedOutput);
  });

  it('should return undefined if email is invalid', function() {
    const user = verifyCredentials("invalid@example.com", "purple-monkey-dinosaur", testUsers);
    const expectedOutput = undefined;
      expect(user).to.equal(expectedOutput);
  });

  it('should return undefined if password is invalid', function() {
    const user = verifyCredentials("user@example.com", "invalid-password", testUsers);
    const expectedOutput = undefined;
      expect(user).to.equal(expectedOutput);
  });

});

// --------------------- TEST: appendHttp ------------------------- //

describe('appendHttp', function() {
  
  it('should add http:// to a url that does not include it', function() {
    const url = 'www.example.org';
    const finalURL = appendHttp(url);
    const expectedOutput = 'http://www.example.org';
      expect(finalURL).to.equal(expectedOutput);
  });

  it('should not modify a url already including http://', function() {
    const url = 'http://www.example.org';
    const finalURL = appendHttp(url);
    const expectedOutput = 'http://www.example.org';
      assert.strictEqual(finalURL, expectedOutput)
  });

});


// --------------------- TEST: emailLookup ------------------------- //

describe('emailLookup', function() {

  it('should return true if an email exists in the users database', function() {
    const result = emailLookup("user@example.com", testUsers);
    const expectedOutput = true;
      expect(result).to.equal(expectedOutput);
  });

  it('should return undefined if an email does not exist in the users database', function() {
    const result = emailLookup("false@example.com", testUsers);
    const expectedOutput = undefined;
      expect(result).to.equal(expectedOutput);
  });

});

// --------------------- TEST: urlForUser ------------------------- //

describe('urlForUser', function() {

  it('should filter out urls not created by the user', function() {
    const result = urlForUser("aJ48lW", urlDatabase);
    const expectedOutput = {
      "test1": {
      longURL: "https://www.example.org",
      userID: "aJ48lW"
    },
    "test2": {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
    }
  };
    assert.deepEqual(result, expectedOutput);
  });

});
