var express = require('express');
var _ = require('lodash');
var exec = require('child_process').exec;
var fs = require('fs');

module.exports = {
	runAll: runAll,
    saveFirstWeek: saveFirstWeek
}

function saveFirstWeek(req, res, next) {
    console.log('saving file...');
    var week = req.body.week.slice(1, -1);
    week = _.replace(week, /\\r\\n/g, '\r\n');

    fs.writeFile('firstWeek.txt', week, 'utf8', function(err) {
        res.send(req.body);
    });
}

function runAll(req, res, next) {
    console.log('running jar...');
    // var callback = (error, stdout, stderr) => {
    //     var msg = {};
    //     msg = {code: 200, status: "OK"};
    //     if(!!!error) res.send(msg);
    // };
    exec('java -jar ./nsp_3.0.jar', (error, stdout, stderr) => {
        var msg = {};
        msg = {code: 200, status: "OK"};
        res.send(msg);
    });
}
