var fs = require('fs');
var _ = require('lodash');

function readFile() {
    return fs.readFileSync('bargielaFormat.txt', 'utf8');
}

function writeFile(string) {
    fs.writeFileSync('firstWeek.txt', string, 'utf8');
}

function parseFile(string) {
    var res = string;
    res = _.replace(res, /1/g, '1 0 0 0');
    res = _.replace(res, /2/g, '0 1 0 0');
    res = _.replace(res, /3/g, '0 0 1 0');
    res = _.replace(res, /4/g, '0 0 0 1');
    res = _.replace(res, /5/g, '0 0 0 0');
    return res;
}

console.log('parsing...');
writeFile(parseFile(readFile()));
