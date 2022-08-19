const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Use body-parser to Parse POST Requests
app.use(bodyParser.urlencoded({extended: false}));
// This allow parsing JSON data sent in the POST request
app.use(bodyParser.json());

// Install and Set Up Mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

// Create a Model
const exerciseSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: String,
    _id: String
})

const exercise = mongoose.model('exercise', exerciseSchema);

const userSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  _id: String
})

const user = mongoose.model('user', userSchema);

const logSchema = new mongoose.Schema({
  username: String,
  count :Number,
  _id: String,
  log: [{
    description: String,
    duation: Number,
    date: String
  }]
})

const log = mongoose.model('log', logSchema);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})