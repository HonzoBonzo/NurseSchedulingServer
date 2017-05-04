var Promise = require('bluebird');
var bodyParser = require('body-parser');
var _ = require('lodash');

module.exports = {
	parseTxtToJson: parseTxtToJson,
	getFilePath: getFilePath,
	getShiftSignature: getShiftSignature,
	getDayId: getDayId,
	getNursesNames: getNursesNames
}

function parseTxtToJson() {
	console.log('testservice')
}

function getFilePath() {
	return './wyniki/5000/tab.txt';
}

function getShiftSignature(number) {
	var signature = "";
	switch(number%4) {
		case 0: 
			signature = 'E';
			break;
		case 1: 
			signature = 'D';
			break;
		case 2: 
			signature = 'L';
			break;
		case 3: 
			signature = 'N';
			break;
		default:
			signature = "0";
	}
	return signature;
}

function getDayId(number) { // 0 - 34
	return _.floor(number/4);
}

function getNursesNames() {
	return [
		'Nora',
		'Pola',
		'Basia',
		'Kasia',
		'Ania',
		'Kamila',
		'Katarzyna',
		'Beata',
		'Ewa',
		'Blanka',
		'Bożena',
		'Tamara',
		'Teresa',
		'Nina',
		'Natalia',
		'Weronika'
	];
}
