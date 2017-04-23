var Promise = require('bluebird');
var bodyParser = require('body-parser');

module.exports = {
	parseTxtToJson: parseTxtToJson,
	getFilePath: getFilePath
}

function parseTxtToJson() {
	console.log('testservice')
}

function getFilePath() {
	return './wyniki/5000/tab.txt';
}