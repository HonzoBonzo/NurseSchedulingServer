var express = require('express');
var _ = require('lodash');
var scheduleService = require('./scheduleService');
var fs = require('fs');
var nurseShifts = getShifts();

var temp = {
  0: {0: 3,
      1: 3,
      2: 3,
      3: 1,},

  1: {0: 3,
      1: 3,
      2: 3,
      3: 1,},

  2: {0: 3,
      1: 3,
      2: 3,
      3: 1,},

  3: {0: 3,
      1: 3,
      2: 3,
      3: 1,},

  4: {0: 3,
      1: 3,
      2: 3,
      3: 1,},

  5: {0: 2,
      1: 2,
      2: 2,
      3: 1,},
      
  6: {0: 2,
      1: 2,
      2: 2,
      3: 1,}
};

module.exports = {
	getConstraints: getConstraints,
  checkHardConsNine: checkHardConsFive,
}

function getConstraints(req, res, next) {
  const mockConstraints = [
    { 
      failedHardSum: 1,
      failedHards: [
        checkHardConsOne(),
        checkHardConsTwo(),
        checkHardConsThree(),
        checkHardConsFour(),
        checkHardConsFive(),
        checkHardConsSix(),
        7,
        8,
        checkHardConsNine(),
        checkHardConsTen()
      ]
    },
    {
      failedSoftSum: 123,
      failedSofts: [
        934,
        2567,
        123,
        1137,
        456,
        235
      ]
    }
  ];
  
  res.send(mockConstraints);
}

function getShifts(){
  const filePath = './wyniki/good/tab.txt';
  let digitRows = [];

  let test = fs.readFile(filePath, 'utf8', function(err, data) {
		if (err) {throw err;}
    var rows = data.split("\n", 2000);    

    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      let oneRow = rows[rowIndex].split(" ", 200);
      digitRows[rowIndex] = [];

      for(var colIndex = 0; colIndex < oneRow.length - 1; colIndex++){
        digitRows[rowIndex][colIndex] = parseInt(oneRow[colIndex]);        
      }
    }
	});
  return digitRows
}

function checkHardConsOne() {
  var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;  
  let consFailed = 0;
  let day = 0;

  for(var oneShift = 0; oneShift < shifts; oneShift++){
    let nursePerShift = 0;
    if ((oneShift % 4 == 0) && (oneShift != 0)){
      day++;
    }

    for(var oneNurse = 0; oneNurse < nurses ; oneNurse++){
      if (nurseShifts[oneNurse][oneShift] == 1){
        nursePerShift++;
      }
    }
    
    if (temp[day % 7][oneShift % 4] != nursePerShift){
      consFailed++;
    }
  }
  return consFailed;
}

function checkHardConsTwo() {
  var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;
  let consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    let shiftsPerDay = 0; 

    for(var oneShift = 0; oneShift < shifts; oneShift++){
      if ((oneShift % 4 == 0) && (oneShift != 0)){
        if (shiftsPerDay > 1){
          consFailed++;
        }
        shiftsPerDay = 0;
      }

      if (nurseShifts[oneNurse][oneShift] == 1){
        shiftsPerDay++;
      }      
    }
  }
  return consFailed;
}

function checkHardConsThree() {
  /* Within a scheduling period a nurse is allowed to exceed the number of hours 
  for which they are available for their department by at most 4 hours. */
  var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;  
  let consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){

    if (_getHoursFromTable(oneNurse, 0, shifts - 28) > _getAllowedHours(oneNurse)){
      consFailed++;
    }
    if (_getHoursFromTable(oneNurse, 27, shifts) > _getAllowedHours(oneNurse)){
      consFailed++;
    }
  }
  return consFailed;
}

function _getHoursFromTable(nurse, from, to){
  let nurseHours = 0;
  let consFailed = 0;

  for(var oneShift = from; oneShift < to; oneShift++){
    if (nurseShifts[nurse][oneShift] == 1){
      nurseHours += 8;
    }
  }

  return nurseHours;
}

function _getAllowedHours(nurse){
  let nurseHours = 0;
    
    switch (nurse){
      case 0: case 1: case 2: case 3: case 4: case 5: 
      case 6: case 7: case 8: case 9: case 10: case 11:
        return 184;
      case 12:
        return 164;
      case 13: case 14: case 15:
        return 104;
      default:
        throw err;
    }
}

function checkHardConsFour() {
  //The maximum number of night shifts is 3 per period of 5 consecutive weeks.
  var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;
  let consFailed = 0;
  
  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    if(_getNumberOfNightShifts(oneNurse,0,shifts - 28) > 3){
      consFailed++;
    }
    if(_getNumberOfNightShifts(oneNurse,27,shifts) > 3){
      consFailed++;
    }
  }
  return consFailed;
}

function _getNumberOfNightShifts(nurse, from, to){
  let nightShifts = 0;

  for(var oneShift = from; oneShift < to; oneShift++){
    if ((oneShift % 4 == 3) && (nurseShifts[nurse][oneShift] == 1)){
      nightShifts++;
    }
  }
  return nightShifts;
}

function checkHardConsFive() {
  /*    A nurse must receive at least 2 weekends off duty per 5 week period. A weekend
        off duty lasts 60 hours including Saturday 00:00 to Monday 04:00.           */
  var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;
  let consFailed = 0;
  

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    if(_getCountWeeksOfDuty(oneNurse,28,shifts) < 2){
      consFailed++;
    }

    if(_getCountWeeksOfDuty(oneNurse,0,shifts-27) < 2){
      consFailed++;
    }
  }
  return consFailed;
}

function _getCountWeeksOfDuty(nurse, from, to){
  let weeksOfDuty = 0;
    for(var oneShift = 19 + from; oneShift < to; oneShift += 28){
      if(_isWeekOfDuty(nurse, oneShift)){
        weeksOfDuty++
      }
    }
    return weeksOfDuty;
}

function _isWeekOfDuty(nurse, startShift){
  for(var oneShift = startShift; oneShift < startShift + 9; oneShift++){
    if(nurseShifts[nurse][oneShift] != 0){
      return false;
    }
  }
  return true;
}

function checkHardConsSix() {
  // Following a series of at least 2 consecutive night shifts a 42 hours rest is required.
  var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;
  let consFailed = 0;
  let isRestPeriod = false;
  
  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    let consecutiveNightShifts = 0;
    let consecutiveRestShifts = 0;

    for(var oneShift = 0; oneShift < shifts; oneShift++){
      if (isRestPeriod){
        if (nurseShifts[oneNurse][oneShift] == 0){
          consecutiveRestShifts++;
        }else{
          if(consecutiveRestShifts < 8){
            consFailed++;
          }
          isRestPeriod = false;         
        }
      }
      
      if (oneShift % 4 == 3){
        if (nurseShifts[oneNurse][oneShift] === 1){
          consecutiveNightShifts++;
        }else{
          if(consecutiveNightShifts > 1){
            isRestPeriod = true;
            oneShift -= 4;
          }
          consecutiveNightShifts = 0;
        }        
      }
    }
    
  }
  return consFailed;
}
function checkHardConsNine() {
  //The number of consecutive nightshifts is at most 3.
  var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;
  let consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    let consecutiveNightShifts = 0;
    for(var oneShift = 0; oneShift < shifts; oneShift++){ 
      if (oneShift % 4 == 3){
        if (nurseShifts[oneNurse][oneShift] === 1){
          consecutiveNightShifts++;          
        }else{
          if (consecutiveNightShifts > 3){
            consFailed++;
          }
          consecutiveNightShifts = 0;
        } 
      }
    }
  }
  return consFailed;
}

function checkHardConsTen() {
  //The number of consecutive shifts (workdays) is at most 6
  var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;
  let consFailed = 0;  

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    let hasDayShift = false;
    let consecutiveDays = 0;

    for(var oneShift = 0; oneShift < shifts; oneShift++){ 

      if ((oneShift % 4 == 0) && (oneShift != 0)){

        if (hasDayShift){
          consecutiveDays++;
          hasDayShift = false;
        }else{

          if(consecutiveDays > 6){
            consFailed++;
          }
          consecutiveDays = 0;
        }
      }

      if (nurseShifts[oneNurse][oneShift] == 1){
        hasDayShift = true;
      }
    }
  }
  return consFailed;
}