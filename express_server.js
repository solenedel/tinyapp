// Q WHAT DOES TEMPLATEVARS ACTUALLY DO?
// WHY NO JSON???


/////////// DEPENDENCIES & SETUP ///////////////////

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { signedCookies } = require('cookie-parser');
const app = express();
const PORT = 3001; //default port 3001

app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));


////////////// DATA ///////////////////

// stores URLs
const urlDatabase = {
};

// stores user data
const users = {

};

// FUNCTION: generate shortURL (random alphanumeric string, 6 chars)
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

//////////////// ENDPOINTS //////////////////////////

// GET request: render urls_new.ejs HTML template for the respective path
app.get('/urls/new', (request, response) => {
  const templateVars = {
    username: request.cookies['username']
  };

  response.render('urls_new', templateVars);
});


app.get('/register', (request, response) => {
  
  const templateVars = {
    username: request.cookies['username']
  };

  response.render('registration_form', templateVars);
});



// POST request: user login
app.post('/login', (request, response) => {
  
  response.cookie('username', (request.body.username));

  response.redirect('/urls');

});

// POST request: user registration
app.post('/register', (request, response) => {

  
  // generate random user ID
  const userID = generateRandomString();


  response.cookie('user_id', userID);
  response.cookie('email', request.body.email); 
  response.cookie('password', request.body.password);

  // create new user in users object
  users[userID]  = {
    id: userID,
    email: (request.cookies.email),
    password: (request.cookies.password)
  };
  
  console.log(users);
  
  response.redirect('/urls');
});


// POST request: LOGOUT and clear cookie
app.post('/logout', (request, response) => {
  response.clearCookie('username', (request.body.username));
  response.redirect('/urls');
});

// GET request: render urls_index.ejs HTML template for the respective path
app.get('/urls', (request, response) => {


  const templateVars = {
    username: request.cookies['username'],
    urls: urlDatabase
  };


  response.render('urls_index', templateVars);
});



// GET request:   ?????
app.get('/urls/:shortURL', (request, response) => {
  const templateVars = { shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    username: request.cookies['username']
  };
  response.render('urls_show', templateVars);
});


// GET request: redirection of the shortURL into the longURL (ex. S152tx --> www.example.org )
app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params['shortURL']];

  if (!longURL) {
    response.send("This short URL is not valid.");
  } else {
    response.redirect(longURL);
  }
  
});

// POST request: when user clicks on delete button
app.post('/urls/:shortURL/delete', (request, response) => {
 
  // delete the specified longURL
  delete urlDatabase[request.params['shortURL']];

  response.redirect('/urls');
});

// POST request: user changes associated longURL
app.post('/urls/:shortURL', (request, response) => {

  urlDatabase[request.params['shortURL']] = request.body.update;

  response.redirect('/urls');

});






// POST request: post newly generated shortURL to the /urls page
app.post('/urls', (request, response) => {
  
  const shortURL = generateRandomString(); // set shortURL equal to function return value


  // if user has not included http(://) in the longURL, add it to the longURL
  if (!(request.body.longURL).includes('http')) {
    request.body.longURL = 'http://' + request.body.longURL;
  }

  // set the value of the new unique shortURL key to the longURL
  urlDatabase[shortURL] = request.body.longURL;
  
  // after longURL is entered in the input field, redirect to the respective shortURL page
  response.redirect(`/urls/${shortURL}`);

});






// handles the root path (localhost: 3001)
app.get('/', (request, response) => {
  response.send('Welcome to TinyApp');
});


// listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});





