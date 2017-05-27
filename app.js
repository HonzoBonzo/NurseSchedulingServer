var express = require('express');
var app = express();
var scheduleManagerRouter = require('./modules/scheduleManager/scheduleRouter');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", 'POST, GET, PUT, DELETE, OPTIONS');
    next();
});

app.get('/', function (req, res) {
  res.send('NurseSchedulingServer!')
})

app.use(scheduleManagerRouter);

app.listen(3000, function () {
  console.log('NurseSchedulingServer is listening on port 3000!');
});