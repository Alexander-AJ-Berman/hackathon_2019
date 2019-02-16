const express = require('express');
const app = express();
const path = require('path');
var mongoose = require('mongoose');
var db = mongoose.connection;
const router = express.Router();
var bodyParser = require('body-parser');
var async = require('async');


// Cookie parser set up
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// Express session set up
var session = require('express-session');
app.use(session({
  secret: "Shh, it's a secret!",
  resave: true,
  saveUninitialized: true
}));

// COMMENT

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
let client_id =  "8fdf389a4342424b8c52c8e8456653ae";
let client_secret = "1f1266a1adb248c0b8acbe1577313e90";
let redirect_uri = 'https://synchronizedairpodplayer.herokuapp.com/callback'; // Your redirect uri
// let redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri
var SpotifyWebApi = require('spotify-web-api-node');

var rooms_to_hostAPI = [];
var room_guest_apis = [];


function room_joined(room, user_ID)  {
    console.log('\t=====room joined called');
    refreshAccessToken(user_ID);
  User.findOne({ 'user_ID': user_ID }, function (err, user) {
    if (err) {
      console.log(err);
    } else {
        console.log(user);
      console.log("\tROOM ID: " + room.room_ID);
      var curr_roomID = room.room_ID;
      // console.log(user.access_token);
      // console.log(user.refresh_token);
      // console.log(user.user_ID);
     // var host_id = room_to_host(room);
      // console.log(user.host_id);

      var new_api = new SpotifyWebApi({
          clientId: client_id,
          clientSecret: client_secret
      });

      new_api.setAccessToken(user.access_token);

      // console.log(new_api);
      // console.log(room.room_ID);
      // console.log(rooms_to_hostAPI);

      var found = false;
      rooms_to_hostAPI.forEach(function(r) {
          if (r.room_ID == room.room_ID){
              found = true;
          }
      });

      if (!found) {
          console.log("\tadding new host");

          //rooms_to_hostAPI.curr_roomID = new_api;
          // rooms_to_hostAPI
          var curr_host_data = {
              room_ID: room.room_ID,
              api: new_api
          }
          rooms_to_hostAPI.push(curr_host_data);

          var curr_room = {
              room_ID: room.room_ID,
              api_list: [new_api] // TODO: remove host api from list?
          };
          room_guest_apis.push(curr_room);
          console.log("\t>>ROOM GUEST APIS START");
          console.log("\t" + room_guest_apis);
          console.log("\t>>ROOM GUEST APIS END");



          //rooms_to_guestAPIs.curr_roomID = [100];
      } else{
          // console.log(rooms_to_hostAPI);
          // console.log(room_guest_apis);
          console.log("\t adding new guest");
          room_guest_apis.forEach(function(r) {
              if (r.room_ID == room.room_ID){
                  r.api_list.push(new_api);
                  console.log("\t" + room_guest_apis);
              }
          });
          //
          // console.log("CURR ROOMID: " + curr_roomID);
          // console.log(curr_roomID);
          // rooms_to_guestAPIs.api_list.push(new_api);
      }
  }


});
// function room_to_host(room) {
//   var host_name = room.users[0];
//   User.findOne({ 'name': host_name }, function (err, user) {
//     if (err) {
//       console.log(err);
//     } else {
//       return user.userID;
//     }
//   });
// }


  //user ID
  // USER access
}

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

app.use(express.static(__dirname + '/public'));




function refreshAccessToken(user_ID){
    // get refresh token from user ID
    console.log("=====REFRESHING TOKEN FOR: " + user_ID);

    User.findOne({ 'user_ID': user_ID }, function (err, user) {
      if (err) {
          console.log("\tREFRESHACCESTOKEN: couldn't find user with specified ID");
          console.log(err);
      } else {
          var refresh_token = user.refresh_token;
          var authOptions = {
              url: 'https://accounts.spotify.com/api/token',
              headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
              form: {
                  grant_type: 'refresh_token',
                  refresh_token: refresh_token
                },
                json: true
              };

              request.post(authOptions, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                  var access_token = body.access_token;
                  // console.log(access_token);
                  console.log("\tDATA RECEIVED:" + body);
                  // update mongo DB here

                  user.set({access_token: access_token});
                  user.save();

                  // res.send({
                  //   'access_token': access_token
                  // });


                }
              });
          // console.log(user.refresh_token);
      }
    });



}


// function get_host_playback(host) {
//     console.log('get_host_playback');
//     // get host's spotify API data
//
//     //placeholder.
//     spotifyApi.getMyCurrentPlaybackState({
//       })
//       .then(function(data) {
//         // Output items
//         console.log("track num: ",data.body.item.track_number);
//         console.log("track uri: ",data.body.item.album.uri);
//         console.log("track progress: ",data.body.progress_ms);
//         console.log("timestamp: ",data.body.timestamp);
//
//         playback_data = {
//             'track_num': data.body.item.track_number,
//             'uri' : data.body.item.album.uri,
//             'progress' : data.body.progress_ms,
//             'unix_time' : data.body.timestamp
//         }
//
//         return playback_data;
//
//
//       }, function(err) {
//         console.log('Something went wrong in get_host_playback', err);
//       });
//
// }

function sync_one_user(user_ID) {
    console.log("=====synchronizing user: " + user_ID);
    // check what group the user is currently in
    // get group ID
    // get host of that group
    // get playback details of host
    // use host
}

async function sync_songs(room_ID) {
    // get host
    // get room
    // console.log("rooms_to_hostAPI:");
    // console.log(rooms_to_hostAPI);
    console.log("=====synchronizing songs");

    var host_api;
    rooms_to_hostAPI.forEach(function(r) {
        if (r.room_ID == room_ID){
            host_api = r.api;
            console.log("\tfound host API");
            console.log(host_api);
        }
    });

    console.log("\tROOM ID: " + room_ID);
    var room_guests_api_list;

    // get list of guests
    room_guest_apis.forEach(function(r) {
        if (r.room_ID == room_ID){
            room_guests_api_list = r.api_list;
            console.log("\tfound other APIs");
        }
    });

    var host_uri = '';
    var host_track_num = '';
    var host_track_progress = '';
    var host_timestamp = '';

    // console.log(host_api);
    host_api.getMyCurrentPlaybackState({
      })
      .then(async function(data) {
        // Output items
        console.log("\t>>>track num: ",data.body.item.track_number);
        console.log("\t>>>track uri: ",data.body.item.album.uri);
        console.log("\t>>>track progress: ",data.body.progress_ms);
        console.log("\t>>>timestamp: ",data.body.timestamp);
        console.log("\t>>>MAC UNIX: " + Date.now());

        host_track_num = data.body.item.track_number;
        host_uri = data.body.item.album.uri;
        host_track_progress = data.body.progress_ms;
        host_timestamp = data.body.timestamp;

        const promises = room_guests_api_list.map(async room_guests => {
            // console.log(room_guests);
            // request details from GitHub’s API with Axios
            room_guests.play(
              {"context_uri": host_uri,  "offset" : {
            "position": host_track_num-1}, "position_ms" : (Date.now()-host_timestamp)/10 + host_track_progress})
              .then(function(data) {
                console.log('\tPLAYING ONE MORE TIME ON MAIN ACCT!');
              }, function(err) {
                console.log('\tSomething went wrong when calling room guest APIs', err);
            });
          })

          // wait until all promises resolve
        const results = await Promise.all(promises)
        console.log("\tSYNCHRONIZED ASYNCHRONOUSLY");

      }, function(err) {
        console.log('\tSomething went wrong in get current playback state', err);
      });
    // console.log("NEW host uri: " + host_uri);
}

// Renders index.html, initial landing page
router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/views/index.html'));
});

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  // console.log(res.cookie(stateKey));

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state';
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
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
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

          console.log("\tID: " + body.id);
          req.session.user_ID = body.id;
          //console.log(body);
          var newUser = new User({
            name: body.display_name,
            user_ID: body.id,
            access_token: access_token,
            refresh_token: refresh_token,
            room_ID: ""
          });
        newUser.save();

        // we can also pass the token to the browser to make requests from there
        // CREATE USER WITH DATA
        res.redirect('/choice');
        });
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }

});


// User chooses to create a room or join a room
router.get('/choice', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/choice.html'));
  console.log("=====choice SESSION ID: " + req.session.user_ID);
});

// User is creating a room
router.get('/create_room', function(req, res){
  res.sendFile(path.join(__dirname + '/views/create_room.html'));
  // Continued logic for creating a room with database entries
});

// User has submitted room name
router.post('/create_room', function(req, res) {
  var room_name = req.body.room_name;
  var room_ID = generateRandomString(8);
  var user_IDs = [req.session.user_ID];


  var newRoom = new Room({
    name: room_name,
    room_ID: room_ID,
    user_IDs: user_IDs,
    host_ID: req.session.user_ID
  });
  newRoom.save();
  room_joined(newRoom, req.session.user_ID);

  // Add additional create room redirect
  res.render(__dirname + '/views/display_room', {user_IDs: user_IDs, room_ID: room_ID});
});

// Add someone to a room with synchro logic
router.get('/join_room', function(req, res) {
    console.log("=====JOIN ROOM USER ID: " + req.session.user_ID);
    // refresh user access token
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
    console.log("=====select room")
  Room.findOne({ 'name': req.body.name }, function (err, room) {
    if (err) {
      console.log(err);
    } else {
      var user_IDs = room.user_IDs;
      var room_ID = room.room_ID;
      // Adds user to room list
      if (req.session.user_ID != "Null") {
        user_IDs.push(req.session.user_ID);
        console.log("Adding this to user_IDS: " + user_IDs);
      }

      room.set({ user_IDs: user_IDs });
      room.save();
      // Call room_joined function
      room_joined(room, req.session.user_ID);

      User.findOne({ 'user_ID': req.session.user_ID }, function(err, user) {
        if (err) {
          console.log(err);
        } else {

          // Assigns a user to a room
          user.room_ID = room.room_ID;
        }
      });
      res.render(__dirname + '/views/display_room', {user_IDs: user_IDs, room_ID: room_ID});
    }
  });
});

router.post('/sync', function(req,res){
  console.log('======Syncing room ' +req.body.room_ID);
  console.log(rooms_to_hostAPI);
  sync_songs(req.body.room_ID);
});



// router.get('/spotifyLogin',function(req, res){
//   res.sendFile(path.join(__dirname+'/views/spotifyLogin.html'));
//   //__dirname : It will resolve to your project folder.
// });


// router.get('/playback', function(req, res) {
//   res.sendFile(path.join(__dirname + '/views/webplaybacktest.html'));
//   // Continued logic for joining a room, with db entries
// });

// app.post('/prompt_name', function(req, res) {
//   console.log(req.body.name);
// });


// set up static routing
app.use(express.static(path.join(__dirname, 'public')));
//add the router
app.use('omt', router);
app.use('/', router);
app.use('/create', router);
app.use('join', router);
app.listen(process.env.PORT || 3000);

console.log("If you own airpods, I'm listening...");

db.once('open', function() {
  console.log('Connected to DB...');
});

// Connect mongoose, credentials: USER - sap_user PASS - sap_user1
mongoose.connect(
  'mongodb://SapUser1:Synchronizedsap1@ds247690.mlab.com:47690/sap',
  { useNewUrlParser: true }
  );

// Creating a user schema
var userSchema = new mongoose.Schema({
  name: String,
  user_ID: String,
  access_token: String,
  refresh_token: String,
  room_ID: String
});

// Create a room
var roomSchema = new mongoose.Schema({
  name: String,
  room_ID: String,
  user_IDs: [String],
  host_ID: String
});


var User = mongoose.model('User', userSchema);
var Room = mongoose.model('Room', roomSchema);

// Dynamically update people in room
// Removing people when they close app (logout button)
// tODO dynamically update kei access token
// do localhost OR heroku
