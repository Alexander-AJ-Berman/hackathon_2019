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
// let aj_access = 'BQBSyywnCKzATbX97N6Jx3xfz2WZEt30gSjoNnd9CG9Q8v58e2oI8zKh0scVotxpv5PcT2u0hpLN9172mJBBye85hV3R9rrlS74Lb_7oInSVAsCUTC5xrRMQkZYomzDitJisapvbH4Tn7yiMSd97nlFm4QTTctHPcK7O';
let chris_access = 'BQDPCVlEFHh75lokgjb_ObyvH1ZHvDrvgR6lwFeKbnVORo_0w1pozDvjgclc_zn-2BOimXsGUNC9FY-PWlxGADP4--AT0MlGOL8Gq-N55PcSth_PIRujKMdE9JqsBI94NzGzK7g1G9Z6UA5pKcvcpkhY2CQ';

let aj_access = 'BQCFCKUuayrWy3B1acGtvCpKOv0dxvO8uGrExoaw0Xak6pyqj-m1MlAIku9Cdftycl0qIHL6Oxt8lZWj45wfqWSHC5Ymn35sqwHln86I_xHzdkX7ZTmo5LhC5CFsRvMUbv-8TWgri7cG-abeGm1bb5j027qP4ray6GQ7SU9lBQ';
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
            refresh_token = body.refresh_token;

        kei_access = body.access_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
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
    "position": 1} })
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

router.get('/create', function(req, res){
  res.sendFile(path.join(__dirname + '/views/create.html'));
  // Continued logic for creating a room with database entries
});

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

  var pwd = req.body.pwd;
  var room_name = req.body.room_name;
  var roomID = "room ID placeholder";
  var users = ["AJ", "Kei", "Ali", "Dim", "C"];

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
router.get('/join', function(req, res) {
  var room_names = []
  Room.find({}, 'name', function(err, rooms) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < rooms.length; i++) {
        room_names.push(rooms[i].name);
      }
      console.log(room_names);
      res.render(__dirname + '/views/join', {room_names: room_names});
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
  refresh_token: String,
  song: {
    name: String,
    artist: String,
    timestamp: String
  }
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
