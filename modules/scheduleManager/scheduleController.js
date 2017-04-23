var express = require('express');
var fs = require('fs');
var scheduleService = require('./scheduleService');

module.exports = {
	getResultJson: getResultJson
}

function getResultJson(req, res, next) {
	const filePath = scheduleService.getFilePath();

	fs.readFile(filePath, 'utf8', function(err, data) {
		if (err) {throw err;}
		console.log("wczytalem plik");
		res.send(data);
	})
	
	// res.send("nothing here");
}