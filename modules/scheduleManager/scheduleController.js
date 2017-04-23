var express = require('express');
var fs = require('fs');
var scheduleService = require('./scheduleService');
var _ = require('lodash');

module.exports = {
	getResultJson: getResultJson
}

function getResultJson(req, res, next) {
	const filePath = scheduleService.getFilePath();

	fs.readFile(filePath, 'utf8', function(err, data) {
		if (err) {throw err;}
		console.log("loaded file: ", filePath);

		//parse
		var rows = _.split(data, '\r\n', 2240);
		rows = _.map(rows, row => {
			return _.split(row, ' ', 140);
		});
		
		rows = _.map(rows,  row => {
			var tab = [];

			for (var i = 0; i < 140; i++) {
				if( row[i] === '1' ) {
					tab.push( makeDay(i) );
				} else if( i % 4  === 3 && tab[scheduleService.getDayId(i)] === undefined) {
					tab.push( makeBlankDay(i) );
				}
			}

			return tab
		})

		var i = -1;
		var resultJson = _.map(rows, row => {
			i = i + 1;
			return {
				nurseId: i,
				name: 'Baśka'+i,
				days: row 
			}
		})

		res.send(resultJson);
	})
}

function makeDay(i) {
	var day = {
		dayId: scheduleService.getDayId(i),
		signature: scheduleService.getShiftSignature(i)
	}
	return day;
}

function makeBlankDay(i) {
	var day = {
		dayId: scheduleService.getDayId(i),
		signature: "0"
	}
	return day;
}