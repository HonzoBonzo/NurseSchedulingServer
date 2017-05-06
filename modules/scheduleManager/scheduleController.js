var express = require('express');
var fs = require('fs');
var _ = require('lodash');
var scheduleService = require('./scheduleService');

module.exports = {
	getResultJson: getResultJson,
	getNurses: getNurses,
	getDaysJson: getDaysJson
}

function getNurses(req, res, next) {
	var i = 0;
	const nursesNames = scheduleService.getNursesNames();

	var nurses = nursesNames.map(name => {
		return {
			name: name,
			nurseId: i++
		}
	})

	res.send(nurses);
}

function getDaysJson(req, res, next) {
	var data =_readFromFile();
	data = _stringToTable(data);
	data = _tableToDaysWithSignatures(data);
	data = _tableToDaysJson(data);
	data = _sortByShiftSignatures(data);
	// console.log(data)
	res.send(data);
}

function _sortByShiftSignatures(data) {
	return _.map(data, day => {
		return {
			dayId: day.dayId,
			shifts: _.sortBy(day.shifts, shift => shift.signature)
		}
	})	
}

function getResultJson(req, res, next) {
	const filePath = scheduleService.getFilePath();

	fs.readFile(filePath, 'utf8', function(err, data) {
		if (err) {throw err;}
		console.log("loaded file: ", filePath);

		//parse
		var rows = _stringToTable(data)
		rows = _tableToDaysWithSignatures(rows)

		var i = -1;
		var resultJson = _.map(rows, row => {
			++i;
			return {
				nurseId: i,
				name: scheduleService.getNurseNameById(i),
				days: row 
			}
		})

		res.send(resultJson);
	})
}

function _tableToDaysWithSignatures(tab) {
	return _.map(tab,  row => {
		var result = [];
		for (var i = 0; i < 140; i++) {
			if( row[i] === '1' ) {
				result.push( _makeDay(i) );
			} else if( i % 4  === 3 && result[scheduleService.getDayId(i)] === undefined) {
				result.push( _makeBlankDay(i) );
			}
		}
		return result
	})
}

function _tableToDaysJson(tab) {
	var daysJson = [];
	for(var i = 0; i < 35; i++) {
		daysJson.push(_makeFullDay(i, tab));
	}
	return daysJson;
}

function _makeFullDay(dayId, tab) {
	var day = {
		dayId: dayId,
		shifts: []
	};

	var tabForThisDay = tab.map(row => {
		return row.filter(day => {
			return day.dayId === dayId
		})
	})

	var k = 0;	
	var tabForThisDay = tabForThisDay.map(nurse => {
		return {
			nurseName: scheduleService.getNurseNameById(k),
			nurseId: k++,
			signature: nurse[0].signature
		}
	})

	for(var i = 0; i < 16; ++i) {
		if (tabForThisDay[i].signature !== '0') {
			day.shifts.push(tabForThisDay[i]);
		}
	}

	return day;
}

function _stringToTable(string) {
	var rows = _.split(string, '\r\n', 2240);
	rows = _.map(rows, row => {
		return _.split(row, ' ', 140);
	});
	return rows;
}

function _readFromFile() {
	const filePath = scheduleService.getFilePath();
	return fs.readFileSync(filePath, 'utf8')
}

function _makeDay(i) {
	var day = {
		dayId: scheduleService.getDayId(i),
		signature: scheduleService.getShiftSignature(i)
	}
	return day;
}

function _makeBlankDay(i) {
	var day = {
		dayId: scheduleService.getDayId(i),
		signature: "0"
	}
	return day;
}