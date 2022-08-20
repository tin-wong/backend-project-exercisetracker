const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

// Use body-parser to Parse POST Requests
app.use(bodyParser.urlencoded({extended: false}));
// This allow parsing JSON data sent in the POST request
app.use(bodyParser.json());

// Install and Set Up Mongoose
const mongoose = require('mongoose');
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
}


// Create an Exercise model
const exerciseSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: String,
    userId: String
})

const exercise = mongoose.model('exercise', exerciseSchema);

// Create an user model
const userSchema = new mongoose.Schema({
  username: String
})

const user = mongoose.model('user', userSchema);

// Create a log model
const logSchema = new mongoose.Schema({
  username: String,
  count :Number,
  log: [{
    description: String,
    duation: Number,
    date: Date
  }]
})

const log = mongoose.model('log', logSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res, next) => {
  const newUser = new user({username: req.body.username});
  newUser.save((err, result) => {
    if (err) return err;
    res.json({username: result.username, _id: result.id})
    next();
  });
}).get('/api/users', async (req, res, next) => {
  const allUsers = await user.find();
  res.json(allUsers);
  next();
})

app.post('/api/users/:_id/exercises', async (req, res, next) => {
  if(req.body.date === ""){
    newDate = new Date()
  } else {
    newDate = new Date(req.body.date)
  }
  const findUser = await user.findById(req.params._id);
  const newExercise = new exercise({
    userId: findUser._id, 
    username: findUser.username, 
    date: newDate.toDateString(),
    duration: req.body.duration,
    description: req.body.description
  });
  newExercise.save((err, result) => {
    if (err) console.log(err);
    res.json({
      _id: result.userId, 
      username: result.username, 
      date: result.date,
      duration: result.duration,
      description: result.description
    });
    next();
  });
});

app.get('/api/users/:_id/logs', async (req, res, next) => {
  const exerciseCount = await exercise.count({userId: req.params._id});
  const exerciseList = await exercise.find({userId: req.params._id});
  //const getUser = await user.find({_id: req.params._id});
  
  let log = [];
  for(let i = 0; i < exerciseList.length; i++) {
    let newExercise = {
      description: exerciseList[i].description,
      duration: exerciseList[i].duration,
      date: exerciseList[i].date
    }
    log.push(newExercise);
  }

  res.json({
    username: exerciseList[0].username,
    count: exerciseCount,
    _id: exerciseList[0].userId,
    log: log
  })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})