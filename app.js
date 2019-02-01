const express = require('express');
const app = express();
const path = require('path');
var mongoose = require('mongoose');
var db = mongoose.connection;
const router = express.Router();
var bodyParser = require('body-parser');
var async = require('async');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
let client_id =  "8fdf389a4342424b8c52c8e8456653ae";
let client_secret = "e69eecc6c2284e549524b8083c8e18da";
let redirect_uri = 'https://synchronizedsap.herokuapp.com/callback'; // Your redirect uri
var SpotifyWebApi = require('spotify-web-api-node');

var rooms_to_hostAPI = [];
var room_guest_apis = [];


function room_joined(room, new_user) {
    console.log('room joined');
  User.findOne({ 'name': new_user }, function (err, user) {
    if (err) {
      console.log(err);
    } else {
        console.log(user);
      console.log("ROOM ID: " + room.roomID);
      var curr_roomID = room.roomID;
      console.log(user.access_token);
      console.log(user.refresh_token);
      console.log(user.userID);
     // var host_id = room_to_host(room);
      // console.log(user.host_id);

      var new_api = new SpotifyWebApi({
          clientId: client_id,
          clientSecret: client_secret
      });

      new_api.setAccessToken(user.access_token);
      console.log("_____________");
      console.log(new_api);
      console.log(room.roomID);
      console.log(rooms_to_hostAPI);

      var found = false;
      rooms_to_hostAPI.forEach(function(r) {
          if (r.roomID == room.roomID){
              found = true;
          }
      });

      if (!found) {
          console.log("adding new host");

          //rooms_to_hostAPI.curr_roomID = new_api;
          // rooms_to_hostAPI
          var curr_host_data = {
              roomID: room.roomID,
              api: new_api
          }
          rooms_to_hostAPI.push(curr_host_data);

          var curr_room = {
              roomID: room.roomID,
              api_list: [new_api] // TODO: remove host api from list?
          };
          room_guest_apis.push(curr_room);
          console.log(">>ROOM GUEST APIS START");
          console.log(room_guest_apis);
          console.log(">>ROOM GUEST APIS END");



          //rooms_to_guestAPIs.curr_roomID = [100];
      } else{
          console.log(rooms_to_hostAPI);
          console.log(room_guest_apis);
          console.log("adding new guest");
          room_guest_apis.forEach(function(r) {
              if (r.roomID == room.roomID){
                  r.api_list.push(new_api);
                  console.log(room_guest_apis);
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

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

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
          //console.log(body);
          var newUser = new User({
            name: body.display_name,
            userID: body.id,
            access_token: access_token,
            refresh_token: refresh_token,
            roomID: ""
          });
        newUser.save();

        // we can also pass the token to the browser to make requests from there
        // CREATE USER WITH DATA
        res.redirect('/choice?name=' + body.display_name);
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

async function sync_songs(roomID) {
    // get host
    // get room
    console.log("rooms_to_hostAPI:");
    console.log(rooms_to_hostAPI);


    var host_api;
    rooms_to_hostAPI.forEach(function(r) {
        if (r.roomID == roomID){
            host_api = r.api;
            console.log("found host API");
            console.log(host_api);
        }
    });

    console.log("\tROOM ID: " + roomID);
    var room_guests_api_list;

    // get list of guests
    room_guest_apis.forEach(function(r) {
        if (r.roomID == roomID){
            room_guests_api_list = r.api_list;
            console.log("found other APIs");
        }
    });

    var host_uri = '';
    var host_track_num = '';
    var host_track_progress = '';
    var host_timestamp = '';

    console.log(host_api);
    host_api.getMyCurrentPlaybackState({
      })
      .then(async function(data) {
        // Output items
        console.log("track num: ",data.body.item.track_number);
        console.log("track uri: ",data.body.item.album.uri);
        console.log("track progress: ",data.body.progress_ms);
        console.log("timestamp: ",data.body.timestamp);
        console.log("MAC UNIX: " + Date.now());

        host_track_num = data.body.item.track_number;
        host_uri = data.body.item.album.uri;
        host_track_progress = data.body.progress_ms;
        host_timestamp = data.body.timestamp;

        const promises = room_guests_api_list.map(async room_guests => {
            console.log(room_guests);
            // request details from GitHub’s API with Axios
            room_guests.play(
              {"context_uri": host_uri,  "offset" : {
            "position": host_track_num-1}, "position_ms" : (Date.now()-host_timestamp)/10 + host_track_progress})
              .then(function(data) {
                console.log('PLAYING ONE MORE TIME ON MAIN ACCT!');
              }, function(err) {
                console.log('Something went wrong!', err);
            });
          })

          // wait until all promises resolve
        const results = await Promise.all(promises)
        console.log("SYNCHRONIZED ASYNCHRONOUSLY");

      }, function(err) {
        console.log('Something went wrong in get current playback state', err);
      });

    // console.log("NEW host uri: " + host_uri);

}

router.post('/sync', function(req,res){
    console.log('======Syncing room ' +req.body.roomID);
    console.log(rooms_to_hostAPI);
    sync_songs(req.body.roomID);
});


//TESTING CHRIS COMMITS
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

router.get('/choice', function(req, res) {
  //req.query.name
  res.sendFile(path.join(__dirname + '/views/choice.html'));
});

router.post('/create_room', function(req, res) {
  var name = req.body.name;
  var pwd = req.body.pwd;
  var room_name = req.body.room_name;
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
  Room.findOne({ 'name': req.body.name }, function (err, room) {
    if (err) {
      console.log(err);
    } else {
      var users = room.users;
      var roomID = room.roomID;
      users.push(req.body.display_name);
      room.set({ users: users});
      room_joined(room, req.body.display_name);

      User.findOne({ 'name': req.body.display_name }, function(err, user) {
        if (err) {
          console.log(err);
        } else {
          user.roomID = room.roomID;
        }
      });
      res.render(__dirname + '/views/display_room', {users: users, roomID: roomID});
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
app.listen(process.env.PORT || 3000);

console.log("If you own airpods, I'm listening...");

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
  roomID: String
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
