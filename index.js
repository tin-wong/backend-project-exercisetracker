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
    date: Date,
    userId: String
})

const Exercise = mongoose.model('exercise', exerciseSchema);

// Create an user model
const userSchema = new mongoose.Schema({
  username: String
})

const User = mongoose.model('user', userSchema);

// // Create a log model
// const logSchema = new mongoose.Schema({
//   username: String,
//   count :Number,
//   log: [{
//     description: String,
//     duation: Number,
//     date: Date
//   }]
// })

// const log = mongoose.model('log', logSchema);

// Delete all exisiting documents in the database. Then initialize it with a document. 
User.deleteMany({}, (error, mongooseDeleteResult) => {
  if(error) return console.error(error);
  console.log(mongooseDeleteResult);
  let newUser = new User({username: 'Test User 1'});
  newUser.save((err) => {
      if(err) return console.error(err);
  })
});

Exercise.deleteMany({}, (error, mongooseDeleteResult) => {
  if(error) return console.error(error);
  console.log(mongooseDeleteResult);
  let newUser = User.find({username: 'Test User 1'})
  let newExercise = new Exercise({
    username: newUser.username,
    description: "Test Exercise 1",
    duration: 10,
    date: new Date(),
    userId: newUser._id
  });
  newExercise.save((err) => {
      if(err) return console.error(err);
  })
});

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res, next) => {
  const newUser = new User({username: req.body.username});
  newUser.save((err, result) => {
    if (err) return err;
    res.json({username: result.username, _id: result.id})
    next();
  });
}).get('/api/users', async (req, res, next) => {
  const allUsers = await User.find();
  res.json(allUsers);
  next();
})

app.post('/api/users/:_id/exercises', async (req, res, next) => {
  if(req.body.date === "" || req.body.date === undefined){
    newDate = new Date()
  } else {
    newDate = new Date(req.body.date)
  }
  const findUser = await User.findById(req.params._id);
  const newExercise = new Exercise({
    userId: findUser._id, 
    username: findUser.username, 
    date: newDate,
    duration: req.body.duration,
    description: req.body.description
  });
  newExercise.save((err, result) => {
    if (err) console.log(err);
    res.json({
      _id: result.userId, 
      username: result.username, 
      date: result.date.toDateString(),
      duration: result.duration,
      description: result.description
    });
    next();
  });
});

app.get('/api/users/:_id/logs', async (req, res, next) => {
  //
  if (req.query.from === undefined){
    from = new Date(1970-01-01)
  } else {
    from = req.query.from;
  }
  
  if (req.query.to === undefined){
    to = new Date()
  } else {
    to = req.query.to;
  }

  if (req.query.limit === undefined){
    limit = 0
  } else {
    limit = req.query.limit;
  }

  const exerciseCount = await Exercise.count({userId: req.params._id});
  const exerciseList = await Exercise.find({userId: req.params._id, date: {$gte: from, $lte: to}}).limit(limit);
  console.log(exerciseList)

  let log = [];
  for(let i = 0; i < exerciseList.length; i++) {
    let newExercise = {
      description: exerciseList[i].description,
      duration: exerciseList[i].duration,
      date: exerciseList[i].date.toDateString()
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

app.get('/api/users/:_id/logs/')

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})