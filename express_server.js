// NOTES
// there is still a username cookie for some reason

/////////// DEPENDENCIES & SETUP ///////////////////

const express = require('express');
const cookieParser = require('cookie-parser');
//const bodyParser = require('body-parser');
//const { signedCookies } = require('cookie-parser');
const app = express();
const PORT = 3001; //default port 3001


app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));


////////////// DATA ///////////////////

// stores URLs
const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};


// stores user data
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

// FUNCTION: generate shortURL (random alphanumeric string, 6 chars)
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};


//////////////// ENDPOINTS //////////////////////////

// GET request: render urls_new.ejs HTML template for the respective path
app.get('/urls/new', (request, response) => {
  
  // if user is not logged in: redirect to login
  if (!request.cookies.user_id) {
    response.redirect('/login');
  }
  
  const templateVars = {
    user: users[request.cookies.user_id]
  };

  response.render('urls_new', templateVars);
});



app.get('/register', (request, response) => {
  

  const templateVars = {
    user: users[request.cookies.user_id]
  };

  response.render('registration_form', templateVars);
});



// POST request: user login
app.post('/login', (request, response) => {
  
  let userID;
  
  //check if the email and password exists in users
  for (const user in users) {
    if (users[user]['email'] === request.body.email) {
      if (users[user]['password'] === request.body.password) {
        userID = users[user]['id'];
        response.cookie('user_id', userID);
        response.redirect('/urls');
        return;
      }
    }
  }
  // invalid password or email
  response.status(403).send("Invalid email or password");
});



// GET request: user login
app.get('/login', (request, response) => {
  
  const templateVars = {
    users,
    user: users[request.cookies.user_id]
  };

  response.render('login_form', templateVars);

});



// POST request: user registration
app.post('/register', (request, response) => {

  // check for blank email/passwords entered by user
  if (request.body.email === '' || request.body.password === '') {
    response.status(400).send("email or password not valid. Please try again");
  }
  
  const email = request.body.email;
  const password = request.body.password;

  //email lookup
  for (const user in users) {
    if (users[user]['email'] === email) {
      response.status(400).send("This email is already registered in our system");
    }
  }

  // generate random user ID
  const userID = generateRandomString();

  response.cookie('user_id', userID);
  response.cookie('email', email);
  response.cookie('password', password);
  

  // create new user in users object
  users[userID]  = {
    id: userID,
    email: email,
    password: password
  };

  //console.log(users);

  response.redirect('/urls');
});



// POST request: LOGOUT and clear cookie
app.post('/logout', (request, response) => {
  //console.log(request.cookies);

  response.clearCookie('user_id');
  response.clearCookie('email');
  response.clearCookie('password');
  response.clearCookie('username'); ////????
  response.redirect('/login');
});

// GET request: render urls_index.ejs HTML template for the respective path
app.get('/urls', (request, response) => {

  const templateVars = {
    user: users[request.cookies.user_id],
    urls: urlDatabase
  };

  response.render('urls_index', templateVars);
});



// GET request:
app.get('/urls/:shortURL', (request, response) => {

  const templateVars = { shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    user: users[request.cookies.user_id]
  };

  console.log(urlDatabase[request.params.shortURL].longURL);

  //console.log(urlDatabase['b6UTxQ'].longURL);
  //longURL: urlDatabase[shortURL]['longURL']

  //console.log(urlDatabase[request.params.shortURL]);

  response.render('urls_show', templateVars);
});

// urlDatabase[shortURL] = {longURL: request.body.longURL,
//   userID: request.cookies.user_id };



// GET request: redirection of the shortURL into the longURL (ex. S152tx --> www.example.org )
app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params['shortURL']].longURL;

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
  
  // set shortURL equal to function return value
  const shortURL = generateRandomString(); 

  // if user has not included http(://) in the longURL, add it to the longURL
  if (!(request.body.longURL).includes('http')) {
    request.body.longURL = 'http://' + request.body.longURL;
  }

  // set the value of the new unique shortURL key to the longURL
  urlDatabase[shortURL] = {longURL: request.body.longURL,
                           userID: request.cookies.user_id };
  
  console.log(urlDatabase);

  // redirect to the respective shortURL page
  response.redirect(`/urls/${shortURL}`);

});






// handles the root path (localhost: 3001)
app.get('/', (request, response) => {
  response.redirect('/login');
});


/////////////// DO NOT EDIT BELOW ////////////////////////


// listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});

