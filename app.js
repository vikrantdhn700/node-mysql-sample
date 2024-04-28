const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors')
const bodyParser = require('body-parser');

const app = express();
app.use(cors())

// Create Server
const port = process.env.PORT || 3000;

// Default middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve('./public')));
app.set('view engine', 'ejs');

// include routers
// API
const task = require('./routes/task');
// API ROUTES
app.use('/api/task', task);

// Web
const webTask = require('./routes/web/task');
// WEB ROUTES
app.use('/web/tasks', webTask);

app.get('/', (req, res) => {
  return res.redirect(`${process.env.SITE_URL}/web/tasks`)
  //return res.send("Hello World!");
});

// APP Listing
app.listen(port, function() {
  console.log("Listing to port: ",port)
});


