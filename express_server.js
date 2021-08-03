// dependencies & setup

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001; //default port 3001

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));


// Database to store short and long URLs

const urlDatabase = { 
};

// FUNCTION: generate shortURL (random alphanumeric string, 6 chars)
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};


// listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});


// GET request: render urls_new.ejs HTML template for the respective path
app.get('/urls/new', (request, response) => {  
  response.render('urls_new');
}); 


// GET request:   ?????

app.get('/urls/:shortURL', (request, response) => {  
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL] };
  response.render('urls_show', templateVars);
}); 

// GET request: render urls_index.ejs HTML template for the respective path
app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDatabase }; // urls variable is referenced in urls_index.ejs
  response.render('urls_index', templateVars);
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
 //urlDatabase[request.params['shortURL']];

 //console.log(urlDatabase[request.params['shortURL']]);
 

 urlDatabase[request.params['shortURL']] = request.body.update;

 response.redirect('/urls');

  //console.log('AFTER:', urlDatabase[request.params['shortURL']]);

  
 //console.log(longURL);
 //console.log(urlDatabase[request.params['shortURL']]);

 
  //response.redirect('/urls');
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




/////////// UNUSED CODE ////////////

// app.get('/urls_show', (request, response) => {
//   const templateVars = { shortURL: urlDatabase, longURL: urlDatabase };
//   response.render('urls_show', templateVars);
// });


// // HTML in the response
// app.get('/hello', (request, response) => {
//   response.send('<html><body>Hello <b>World</b></body></html>\n')
// });

// getting the urls in JSON format
// app.get('/urls.json', (request, response) => {
//   response.json(urlDatabase);
// });





