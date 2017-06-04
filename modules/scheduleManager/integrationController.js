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
    const week = req.body.week 
    fs.writeFile('firstWeek.txt', week, 'utf8', function(err) {});
    res.send(req.body);
}

function runAll(req, res, next) {
    console.log('running jar...');
    var msg = {};
    exec('java -jar ./nsp_2.0.jar');
    msg = {code: 200, status: "OK"};
    res.send(msg);
}