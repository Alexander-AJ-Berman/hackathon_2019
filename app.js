const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/views/index.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/create', function(req, res){
  res.sendFile(path.join(__dirname + '/views/create.html'));
  // Continued logic for creating a room with database entries
});

// Add someone to a room with synchro logic
router.get('/join', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/join.html'));
  // Continued logic for joining a room, with db entries
});

//add the router
app.use('/', router);
app.listen(process.env.port || 3000);

console.log("If you own airpods, I'm listening on 3000...");