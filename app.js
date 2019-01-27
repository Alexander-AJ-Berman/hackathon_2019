const express = require('express');
const app = express();
const path = require('path');
var mongoose = require('mongoose');
var db = mongoose.connection;
const router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
let client_id =  "8fdf389a4342424b8c52c8e8456653ae";
let client_secret = "fb6eb63063074d0bb69844de3a2a03c3";
let redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri
var SpotifyWebApi = require('spotify-web-api-node');

let spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret
});

let chris_api = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret
});


let aj_api = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret
});

let kei_access = '';
let chris_access = '';
let aj_access = '';


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
var stateKey = 'spotify_auth_state';

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  console.log(res.cookie(stateKey));

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: "true"
    }));
});


app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token,
            name = body.name,
            id = body.id;

        // console.log(body);
        kei_access = body.access_token;
        // name = body.uri.split("");

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
<<<<<<< HEAD
          console.log(body);

=======
          //console.log(body);
          var newUser = new User({
            name: body.display_name,
            userID: body.id,
            access_token: access_token,
            refresh_token: refresh_token,
          });
        newUser.save();
>>>>>>> 5d955ff1de47abb61d90b113465fbd54e8bbbbaa
        });



        // we can also pass the token to the browser to make requests from there
        // CREATE USER WITH DATA
        res.redirect('/choice');


      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }

});

app.post('/prompt_name', function(req, res) {
  console.log(req.body.name);
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

router.get('/omt', function(req,res) {
    console.log('onemoretime');
    console.log('kei_access: ' + kei_access);
    spotifyApi.setAccessToken(kei_access);
    chris_api.setAccessToken(chris_access);
    aj_api.setAccessToken(aj_access);

    spotifyApi.play(
      {"context_uri": "spotify:album:7D2NdGvBHIavgLhmcwhluK",  "offset": {
    "position": 1}, "position_ms" : 100000 })
      .then(function(data) {
        console.log('PLAYING ONE MORE TIME ON MAIN ACCT!');
      }, function(err) {
        console.log('Something went wrong!', err);
    });

    aj_api.play(
      {"context_uri": "spotify:album:7D2NdGvBHIavgLhmcwhluK",  "offset": {
    "position": 1} })
      .then(function(data) {
        console.log('__playing one more time!');
      }, function(err) {
        console.log('Something went wrong 4 aj!', err);
    });


    chris_api.play(
      {"context_uri": "spotify:album:7D2NdGvBHIavgLhmcwhluK",  "offset": {
    "position": 1} })
      .then(function(data) {
        console.log('__playing one more time!');
      }, function(err) {
        console.log('Something went wrong 4 aj!', err);
    });

});

// // Handles spotify login and Auth
// function spotify_login() {
//   // TODO; for K
// }

router.get('/',function(req,res){
  // spotify_login();
  res.sendFile(path.join(__dirname+'/views/index.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/spotifyLogin',function(req, res){
  res.sendFile(path.join(__dirname+'/views/spotifyLogin.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/create_room', function(req, res){
  res.sendFile(path.join(__dirname + '/views/create_room.html'));
  // Continued logic for creating a room with database entries
});

<<<<<<< HEAD
router.post('/create_user', function(req, res) {


  var userID = "user ID Placeholder";
  var access_token = "access token placeholder";
  var refresh_token = "refresh token placeholder";


  var newUser = new User({
      name: req.body.name,
      userID: userID,
      access_token: access_token,
      refresh_token: refresh_token,
      song: {
        name: "One More Time",
        artist: "Daft Punk",
        timestamp: "00:00:00"
      }
    });
  newUser.save();
=======
router.get('/choice', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/choice.html'));
});
>>>>>>> 5d955ff1de47abb61d90b113465fbd54e8bbbbaa

router.post('/create_room', function(req, res) {
  var name = req.body.name;
  var pwd = req.body.pwd;
  var room_name = req.body.room_name;
  // MAKEUP
  var roomID = generateRandomString(8);
  var users = [name];

  var newRoom = new Room({
    name: room_name,
    roomID: roomID,
    users: users,
    pwd: pwd
  });
  newRoom.save();

  res.send("Thanks for navigating! Please wait");
});

// Add someone to a room with synchro logic
router.get('/join_room', function(req, res) {
  var room_names = []
  Room.find({}, 'name', function(err, rooms) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < rooms.length; i++) {
        room_names.push(rooms[i].name);
      }
      res.render(__dirname + '/views/join', {room_names: room_names});
    }
  });

});

// POST route handler
router.post('/select_room', function(req, res) {
  var user_IDs = [];
  Room.findOne({ 'name': req.body.name }, function (err, room) {
    if (err) {
      console.log(err);
    } else {
      var users = room.users;
      for (var i = 0; i < users.length; i++) {
        user_IDs.push(users[i].name);
      }
      console.log(users);
      console.log(user_IDs);
    }
  });
});

router.get('/playback', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/webplaybacktest.html'));
  // Continued logic for joining a room, with db entries
});





// set up static routing
app.use(express.static(path.join(__dirname, 'public')));
//add the router
app.use('omt', router);
app.use('/', router);
app.use('/create', router);
app.use('join', router);
app.listen(process.env.port || 3000);

console.log("If you own airpods, I'm listening on 3000...");

db.once('open', function() {
  console.log('Connected to DB...');
});

// Connect mongoose, credentials: USER - sap_user PASS - sap_user1
mongoose.connect(
  'mongodb://sap_user:sap_user1@ds113765.mlab.com:13765/sap',
  { useNewUrlParser: true}
  );

// Creating a user schema
var userSchema = new mongoose.Schema({
  name: String,
  userID: String,
  access_token: String,
  refresh_token: String
});

// Create a room
var roomSchema = new mongoose.Schema({
  name: String,
  roomID: String,
  users: [String],
  pwd: String
});


var User = mongoose.model('User', userSchema);
var Room = mongoose.model('Room', roomSchema);
