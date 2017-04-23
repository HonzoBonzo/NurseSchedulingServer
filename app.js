var express = require('express');
var expressSession = require('express-session');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var scheduleManagerRouter = require('./modules/scheduleManager/scheduleRouter');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", 'POST, GET, PUT, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Credentials", true);

    next();
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({
	secret: 'secret',
	resave: false,
	saveUninitialized: true,
	maxAge: 10000000000000
}));

process.on('unhandledRejection', function(reason, p){
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging here
});

app.get('/', function (req, res) {
  res.send('NurseSchedulingServer!')
})

app.use(scheduleManagerRouter);

app.listen(3000, function () {
  console.log('NurseSchedulingServer is listening on port 3000!');
});