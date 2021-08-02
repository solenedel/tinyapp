const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 3001; //default port 3001

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});

// handles the root path
app.get('/', (request, response) => {
  response.send('Hello!');
});

// getting the urls in JSON format
app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

// HTML in the response
app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n')
});


app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDatabase };
  response.render('urls_index', templateVars);
});

app.get('/urls_show', (request, response) => {
  const templateVars = { shortURL: urlDatabase, longURL: urlDatabase };
  response.render('urls_show', templateVars);
});

app.get('/urls/:shortURL', (request, response) => {
  const templateVars = { shortURL: request.params.shortURL, longURL: request.params.longURL };
  response.render('urls_show', templateVars);
});



