var express = require('express');
var _ = require('lodash');
var exec = require('child_process').exec;
var fs = require('fs');

module.exports = {
	runAll: runAll,
    saveFirstWeek: saveFirstWeek,
    runJarAndExe: runJarAndExe,
    getStats: getStats
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
    exec('java -jar ./nsp_3.0.jar', (error, stdout, stderr) => {
        var msg = {};
        msg = {code: 200, status: "OK"};
        res.send(msg);
    });
}

function runJarAndExe(req, res, next) {
    console.log('running jar...');
    exec('java -jar ./nsp_3.0.jar', (error, stdout, stderr) => {
        console.log('running exe...');
        exec('ACO.exe', (error, stdout, stderr) => {
            var msg = {};
            msg = {code: 200, status: "OK"};
            res.send(msg);
        })
    });
}

function getStats(req, res, next) {
    console.log('getting stats...');
    fs.readFile('statistics.json', 'utf8', (err, data) => {
        res.send(data);
    })
}
