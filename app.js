const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/views/index.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/about.html'));
});

router.get('/sitemap',function(req,res){
  res.sendFile(path.join(__dirname+'/sitemap.html'));
});

// Add someone to a room with synchro logic
router.get('/join', function(req, res) {
  // LOGIC
}

//add the router
app.use('/', router);
app.listen(process.env.port || 3000);

console.log("If you own airpods, I'm listening on 3000...");