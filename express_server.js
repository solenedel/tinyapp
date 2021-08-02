const express = require('express');
const app = express();
const PORT = 3001; //default port 3001

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// handles the root path
app.get('/', (request, response) => {
  response.send('Hello!');
});


app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});

// getting the urls in JSON format
app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

// HTML in the response
app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n')
});



