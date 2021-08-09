
// ----------------- DEPENDENCIES & SETUP ------------------------- //

const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3001;


// All cookies (id, email, password) are stored in 'session'
app.use(cookieSession({
  name: 'session',
  keys: ['wuyjfx36v47dj','387rb2iuy23k'],
}));


app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

// ---------------------- IMPORTS ------------------------- //

const { urlForUser, generateRandomString, verifyCredentials, emailLookup, appendHttp } = require('./helper.js');
const { urlDatabase, users } = require('./database.js');

// --------------------- GET ROUTES -------------------------- //

// GET: error 404 page.
// Shown when the user requests a URL that does not exist.
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


// GET: registration page. User creates a new profile.
app.get('/register', (request, response) => {
  
  const templateVars = {
    user: users[request.session.user_id]
  };

  response.render('registration_form', templateVars);
});


// GET: login to user profile
app.get('/login', (request, response) => {
  
  const templateVars = {
    user: users[request.session.user_id]
  };

  response.render('login_form', templateVars);

});


// POST: login page. Verifies credentials entered by user.
app.post('/login', (request, response) => {
  
  // login details entered by user denoted as 'test-'
  const testEmail = request.body.email;
  const testPassword = request.body.password;

  // verify credentials (return true or false)
  const user_id = verifyCredentials(testEmail, testPassword, users);

  // if credentials are incorrect
  if (!user_id) {
    response.status(403).send("Invalid email or password");
  } else {
    // if credentials are correct
    request.session.user_id = user_id;
    response.redirect('/urls');
  }
  
});


// GET: page that lists the logged in user's created URLs.
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


// GET: this page displays a newly created URL.
app.get('/urls/:shortURL', (request, response) => {

  // If a user requests this page without having access to the resource
  // Send a 403 error (forbidden resource)
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

  // if the shortURL does not exist, redirect to error 404 page.
  if (!url) {
    response.status(404);
    response.redirect('/404');
    return;
  }

  // if shortURL is valid, add to urlDatabase object.
  const longURL = urlDatabase[request.params['shortURL']].longURL;
  
  if (!longURL) {
    // if longURL is not valid
    response.send("This short URL is not valid.");
  } else {
    // if the longURL is valid
    response.redirect(longURL);
  }
});


// GET: root path- redirect to login page
app.get('/', (request, response) => {

  // if user is logged in, redirect to /urls
  if (request.session.user_id) {
    response.redirect('/urls');
    return;
  }

  // if user is not logged in, redirect to login
  response.redirect('/login');
});

// ---------------------- POST ROUTES -------------------------- //


// POST: user enters email and password in registration form.
app.post('/register', (request, response) => {

  // check for blank email or password entered by user, which are not accepted.
  if (request.body.email === '' || request.body.password === '') {
    response.status(400).send("email or password not valid. Please try again");
  }
  
  // retrieve credentials entered by user and hash the password.
  const testEmail = request.body.email;
  const password = request.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // check if email already belongs to an existing user.
  if (emailLookup(testEmail, users)) {
    response.status(400).send("This email is already registered in our system");
    return;
  }

  // if credentials pass the checks, generate random user ID.
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


// POST: user changes longURL associated with existing shortURL
app.post('/urls/:shortURL', (request, response) => {

  // this page is only accessible to user who created the URL.
  if (!request.session.user_id) {
    response.status(403).send("You must be logged in to view this content.");
  }

  const shortURL = request.params.shortURL;

  // append http:// if not included by user
  const longURL = appendHttp(request.body.update);

  // update longURL in urlDatabase
  urlDatabase[shortURL]['longURL'] = longURL;

  // redirect to the newly changed URL page.
  response.redirect(303, `/urls/${request.params.shortURL}`);
});


// POST: when a user clicks on delete button in the list of created URLs.
app.post('/urls/:shortURL/delete', (request, response) => {
 
  // delete the specified longURL.
  delete urlDatabase[request.params['shortURL']];

  response.redirect('/urls');
});


// POST: add newly generated shortURL to the /urls page
app.post('/urls', (request, response) => {

  // If user is not logged in, redirect to login page
  if (!request.session.user_id) {
    response.redirect('/login');
    return;
  }
  
  // set shortURL equal to the randomly generated string
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