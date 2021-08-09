
// ----------------- DEPENDENCIES & SETUP ------------------------- //

const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3001;


// all cookies (id, email, pw) stored under 'session'
app.use(cookieSession({
  name: 'session',
  keys: ['wuyjfx36v47dj','387rb2iuy23k'],
}));


app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

// ------------------ IMPORTS -------------------- //

const { urlForUser, generateRandomString, verifyCredentials, emailLookup, appendHttp } = require('./helper.js');
const { urlDatabase, users } = require('./database.js');

// --------------------- GET ROUTES -------------------------- //

// GET: error 404 page
app.get('/404', (request, response) => {
  response.send("The page you are looking for cannot be found.");
});


// GET: new URL creation page
app.get('/urls/new', (request, response) => {
  
  // if user is not logged in: redirect to login
  if (!request.session.user_id) {
    response.send("you must log in to create a URL.");
  }
  
  const templateVars = {
    user: users[request.session.user_id]
  };

  response.render('urls_new', templateVars);
});


// GET: registration page
app.get('/register', (request, response) => {
  
  const templateVars = {
    user: users[request.session.user_id]
  };

  response.render('registration_form', templateVars);
});


// GET: login
app.get('/login', (request, response) => {
  
  const templateVars = {
    user: users[request.session.user_id]
  };

  response.render('login_form', templateVars);

});


// POST: login page
app.post('/login', (request, response) => {
  
  // login details entered by user denoted as 'test-'
  const testEmail = request.body.email;
  const testPassword = request.body.password;

  // verify credentials (return true or false)
  const user_id = verifyCredentials(testEmail, testPassword, users);

  // incorrect credentials
  if (!user_id) {
    response.status(403).send("Invalid email or password");
  } else {
    // correct credentials
    request.session.user_id = user_id;
    response.redirect('/urls');
  }
  
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
    urls: urlForUser(ID, urlDatabase),
    shortURL: request.params.shortURL
  };

  response.render('urls_index', templateVars);
});


app.get('/urls/:shortURL', (request, response) => {

  if (!request.session.user_id) {
    response.status(403).send("You must be logged in to view this content.");
  }

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


// GET: root path- redirect to login page
app.get('/', (request, response) => {

  // if user is logged in: redirect to /urls
  if (request.session.user_id) {
    response.redirect('/urls');
    return;
  }
  response.redirect('/login');
});

// ---------------------- POST ROUTES -------------------------- //


// POST: user registration page
app.post('/register', (request, response) => {

  // check for blank email/passwords entered by user
  if (request.body.email === '' || request.body.password === '') {
    response.status(400).send("email or password not valid. Please try again");
  }
  
  // retrieve credentials entered by user and hash the password.
  const testEmail = request.body.email;
  const password = request.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (emailLookup(testEmail, users)) {
    response.status(400).send("This email is already registered in our system");
    return;
  }

  // generate random user ID
  const userID = generateRandomString();

  // create session cookies
  request.session.user_id = userID;
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



// POST: logout page
app.post('/logout', (request, response) => {

  // clear all session cookies
  request.session = null;

  response.redirect('/login');
});


// POST: user changing longURL associated with existing shortURL
app.post('/urls/:shortURL', (request, response) => {

  if (!request.session.user_id) {
    response.status(403).send("You must be logged in to view this content.");
  }

  const shortURL = request.params.shortURL;

  // append http:// if not included by user
  const longURL = appendHttp(request.body.update);

  // update longURL in urlDatabase
  urlDatabase[shortURL]['longURL'] = longURL;


  response.redirect(303, `/urls/${request.params.shortURL}`);
});


// POST: when user clicks on delete button
app.post('/urls/:shortURL/delete', (request, response) => {
 
  // delete the specified longURL
  delete urlDatabase[request.params['shortURL']];

  response.redirect('/urls');
});


// POST: post newly generated shortURL to the /urls page
app.post('/urls', (request, response) => {

  if (!request.session.user_id) {
    response.redirect('/login');
    return;
  }
  
  // set shortURL equal to function return value
  const shortURL = generateRandomString();


  // append http:// to the longURL if required
  const finalURL = (appendHttp(request.body.longURL));
  
  // set the value of the new unique shortURL key to the longURL
  urlDatabase[shortURL] = {longURL: finalURL,
    userID: request.session.user_id };
  
  // redirect to the respective shortURL page
  response.redirect(`/urls/${shortURL}`);
});


// ---------------- DO NOT EDIT BELOW ---------------------- //

// listen on the specified port: default 3001

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}`);
});