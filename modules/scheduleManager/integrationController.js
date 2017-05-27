var express = require('express');
var _ = require('lodash');
var exec = require('child_process').exec;

module.exports = {
	runAll: runAll
}

function runAll(req, res, next) {
    var msg = {};
    exec('java -jar ./nsp.jar');
    msg = {code: 200, status: "OK"};
    res.send(msg);
}