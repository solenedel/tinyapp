// ------------------ NOTES & TO-DO LIST ------------------------ //

// created URLs are no longer shown in a user's page??
//request.session.user_id is undefined in helper.js

// morgan
// cannot set headers after they are set
// improve UI with bootstrap (stylesheet?)
// reorder get and post requests to separate them
// GET routes
// error pages 404, 403, 400


// ----------------- DEPENDENCIES & SETUP ------------------------- //

const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const { request } = require('express');  // ??
const PORT = 3001;


// all cookies (id, email, pw) stored under 'session'
app.use(cookieSession({
  name: 'session',
  keys: ['key0','key1'],
}));


app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

// ------------------ IMPORTED FUNCTIONS -------------------- //

const { urlForUser, generateRandomString, getUserByEmail, emailLookup } = require('./helper.js');



// ---------------------- DATA ------------------------- //

// stores URLs (test data below)
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  i4BoGr: {
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
    password: "dishwasher-funk"
  }
};


// ------------------ EXPORTED -------------------- //

module.exports = { urlDatabase, users };



// ------------------- ENDPOINTS & ROUTES -------------------------- //

// GET request: render urls_new.ejs HTML template for the respective path
app.get('/urls/new', (request, response) => {
  
  // if user is not logged in: redirect to login
  if (!request.session.user_id) {
    response.redirect('/login');
  }
  
  const templateVars = {
    user: users[request.session.user_id]
  };

  response.render('urls_new', templateVars);
});



app.get('/register', (request, response) => {
  
  const templateVars = {
    user: users[request.session.user_id]
  };

  response.render('registration_form', templateVars);
});



// POST request: user login
app.post('/login', (request, response) => {
  
  // login details entered by user denoted as 'test-'
  const testEmail = request.body.email;
  const testPassword = request.body.password;

  // if email/password is invalid
  if (!getUserByEmail(testEmail, testPassword, users)) {
    response.status(403).send("Invalid email or password");
  } else {
    response.redirect('/urls');
  }
});



// GET request: user login
app.get('/login', (request, response) => {
  
  const templateVars = {
    user: users[request.session.user_id]
  };

  response.render('login_form', templateVars);

});



// POST: user registration
app.post('/register', (request, response) => {

  // check for blank email/passwords entered by user
  if (request.body.email === '' || request.body.password === '') {
    response.status(400).send("email or password not valid. Please try again");
  }
  
  const testEmail = request.body.email;
  const password = request.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);


  emailLookup(testEmail, users);

  // generate random user ID
  const userID = generateRandomString();

  request.session.user_id = userID; ////?
  request.session.email = testEmail;
  request.session.password = hashedPassword;
  

  // create new user in users object
  users[userID]  = {
    id: userID,
    email: testEmail,
    password: hashedPassword
  };

  response.redirect('/urls');
});



// POST: logout
app.post('/logout', (request, response) => {

  // clear all session cookies
  request.session = null;

  response.redirect('/login');
});



// GET: "my URLs" page
app.get('/urls', (request, response) => {

  // if user is not logged in: redirect to login
  if (!request.session.user_id) {
    response.send('You must be logged in to see the URLs.');
    response.redirect('/login');
  }

  const ID = request.session.user_id;

  const templateVars = {
    user: users[request.session.user_id],
    urls: urlForUser(ID),
    shortURL: request.params.shortURL
  };

 
  // filter urlDatabase for urls related to the specific userID
  
  // console.log('filtered object:', urlForUser(ID));


  response.render('urls_index', templateVars);
});



// GET: ???
app.get('/urls/:shortURL', (request, response) => {

  const templateVars = { shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    user: users[request.session.user_id]
  };

  response.render('urls_show', templateVars);
});



// GET: redirection of the shortURL into the longURL (ex. S152tx --> www.example.org )
app.get('/u/:shortURL', (request, response) => {

  const url = urlDatabase[request.params.shortURL];

  // if shortURL does not exist
  if (!url) {
    response.status(404);
    response.redirect('/404');
    return;
  }
 
  // if shortURL is valid
  const longURL = urlDatabase[request.params['shortURL']].longURL;

  if (!longURL) {
    // if longURL is not valid
    response.send("This short URL is not valid.");
  } else {
    response.redirect(longURL);
  }
  
});



// POST: when user clicks on delete button
app.post('/urls/:shortURL/delete', (request, response) => {
 
  // delete the specified longURL
  delete urlDatabase[request.params['shortURL']];

  response.redirect('/urls');
});



// POST: user changes associated longURL
app.post('/urls/:shortURL', (request, response) => {

  urlDatabase[request.params['shortURL']] = request.body.update;

  response.redirect('/urls');

});




// POST: post newly generated shortURL to the /urls page
app.post('/urls', (request, response) => {
  
  // set shortURL equal to function return value
  const shortURL = generateRandomString();

  // add http(://) to the longURL if user did not include it
  if (!(request.body.longURL).includes('http')) {
    request.body.longURL = 'http://' + request.body.longURL;
  }

  // set the value of the new unique shortURL key to the longURL
  urlDatabase[shortURL] = {longURL: request.body.longURL,
    userID: request.session.user_id };
  
  // redirect to the respective shortURL page
  response.redirect(`/urls/${shortURL}`);
});

// GET: root path- redirect to login page
app.get('/', (request, response) => {
  response.redirect('/login');
});

// -------------------- ERROR PAGES ---------------------- //

app.get('/404', (request, response) => {
  response.send("The page you are looking for cannot be found.");
});




// ---------------- DO NOT EDIT BELOW ---------------------- //


// listen on the specified port: default 3001

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}`);
});

