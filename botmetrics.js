// Remember to run `npm install --save botmetrics` in your app.
//
// If you are using an Express-based app, parse the request body
// and pass along req.body as an argument to Botmetrics
// for example:
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Botmetrics = require('botmetrics');

app.use(bodyParser.json()); // for parsing application/json

app.post('/webhooks', function(req, res) {
  Botmetrics.track(req.body, {
    apiKey: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMzksImV4cCI6MTc5NDI5MzU4OH0.iYTH5bId_mFr3E2kfcOqzwdjy8shue2EckJomQUd4x0",
    botId: "00fc527b9b4e"
  });
  res.status(200).send("");
});

app.listen(5000, function () {
  console.log('facebook bot listening on port 5000!');
});