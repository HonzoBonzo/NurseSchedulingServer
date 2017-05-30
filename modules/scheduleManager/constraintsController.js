var express = require('express');
var _ = require('lodash');
var scheduleService = require('./scheduleService');
var fs = require('fs');
var nurseShifts = getShifts();

const shiftDemandsPerDay = {
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
}

function getConstraints(req, res, next) {
  const mockConstraints = [
    { 
      failedHardSum: checkHardConsOne() + checkHardConsTwo() + checkHardConsThree() +
      checkHardConsFour() +  checkHardConsFive() + checkHardConsSix() + checkHardConsSeven() +
      checkHardConsEight() + checkHardConsNine() + checkHardConsNine(),
      failedHards: [
        checkHardConsOne(),
        checkHardConsTwo(),
        checkHardConsThree(),
        checkHardConsFour(),
        checkHardConsFive(),
        checkHardConsSix(),
        checkHardConsSeven(),
        checkHardConsEight(),
        checkHardConsNine(),
        checkHardConsNine()
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

module.exports = {
	getConstraints: getConstraints,
  checkHardConsNine: checkHardConsEight,
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
        checkHardConsSeven(),
        checkHardConsEight(),
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
  const filePath = './wyniki/good/tab.txt'

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
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;  
  let consFailed = 0;
  let day = 0;

  for(var oneShift = 0; oneShift < shifts; oneShift++){
    let nursePerShift = 0;
    if ((oneShift % 4 === 0) && (oneShift !== 0)){
      day++;
    }

    for(var oneNurse = 0; oneNurse < nurses ; oneNurse++){
      if (nurseShifts[oneNurse][oneShift] === 1){
        nursePerShift++;
      }
    }
    

    if (shiftDemandsPerDay[day % 7][oneShift % 4] != nursePerShift){
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
      if ((oneShift % 4 === 0) && (oneShift !== 0)){
        if (shiftsPerDay > 1){
          consFailed++;
        }
        shiftsPerDay = 0;
      }

      if (nurseShifts[oneNurse][oneShift] === 1){
        shiftsPerDay++;
      }      
    }
  }
  return consFailed;
}

function checkHardConsThree() {
  /* Within a scheduling period a nurse is allowed to exceed the number of hours 
  for which they are available for their department by at most 4 hours. */
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;  
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

function checkHardConsFour() {
  //The maximum number of night shifts is 3 per period of 5 consecutive weeks.
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;
  let consFailed = 0;
  
  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    if(_getNumberOfNightShifts(oneNurse,0,shifts - 28) > 3){
      //res.send(String(oneNurse));
      consFailed++;
    }
    if(_getNumberOfNightShifts(oneNurse,27,shifts) > 3){
      consFailed++;
      //res.send(String(oneNurse));
    }
  }
  //res.send(String(consFailed));
  return consFailed;
}

function _getNumberOfNightShifts(nurse, from, to){
  let nightShifts = 0;

  for(var oneShift = from; oneShift < to; oneShift++){
    if ((oneShift % 4 === 3) && (nurseShifts[nurse][oneShift] === 1)){
      nightShifts++;
    }
  }
  return nightShifts;
}

function checkHardConsFive() {
  /*    A nurse must receive at least 2 weekends off duty per 5 week period. A weekend
        off duty lasts 60 hours including Saturday 00:00 to Monday 04:00.           */
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;
  let consFailed = 0;
  

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    if(_getCountWeeksOfDuty(oneNurse,28,shifts) < 2){
      //res.send(String(oneNurse))
      consFailed++;
    }

    if(_getCountWeeksOfDuty(oneNurse,0,shifts-27) < 2){
      consFailed++;
      //res.send(String(oneNurse))
    }
  }
  return consFailed;
}

function checkHardConsSix() {
  // Following a series of at least 2 consecutive night shifts a 42 hours rest is required.
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;
  let consFailed = 0;
  
  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    let consecutiveNightShifts = 0;
    let consecutiveRestShifts = 0;
    let isRestPeriod = false;

    for(var oneShift = 0; oneShift < shifts; oneShift++){
      if (isRestPeriod){
        if (nurseShifts[oneNurse][oneShift] === 0){
          consecutiveRestShifts++;
        }else{
          if(consecutiveRestShifts < 8){
            consFailed++;
          }
          isRestPeriod = false;         
        }
      }
      
      if (oneShift % 4 === 3){
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

function checkHardConsSeven() {
  //During any period of 24 consecutive hours, at least 11 hours of rest is required.
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;
  let consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    for(var oneShift = 0; oneShift < shifts - 3; oneShift++){
      if(_getRestShiftsDuring24(oneNurse,oneShift) < 2){
        consFailed++;
      }
    }
  }

  return consFailed;
}

function checkHardConsEight(){
// A night shift has to be followed by at least 14 hours rest. An exception is that once in a
// period of 21 days for 24 consecutive hours, the resting time may be reduced to 8 hours.
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;
  var day = 0;
  let consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    let isExcepAvaible = true;
    let dayOfException = 0;

    for(var oneShift = 3; oneShift < shifts - 4; oneShift+=4, day++){
      if ((dayOfException !== 0) && (day-dayOfException > 21)){
        isExcepAvaible = true;
        dayOfException = 0;
      }

      if(nurseShifts[oneNurse][oneShift] === 1){
        if((nurseShifts[oneNurse][oneShift - 1] === 1) && (nurseShifts[oneNurse][oneShift - 2] === 1)){
          consFailed++;
        }else if((nurseShifts[oneNurse][oneShift - 1] === 1) && (nurseShifts[oneNurse][oneShift - 3] === 1)){
          consFailed++;
        }else if(nurseShifts[oneNurse][oneShift - 1] === 1){
          if (isExcepAvaible){
            isExcepAvaible = false;
            dayOfException = day;
          }else{
            consFailed++;
          }          
        }
      }
    }
  }
  return consFailed;
}

function checkHardConsNine() {
  //The number of consecutive nightshifts is at most 3.
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;
  let consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    let consecutiveNightShifts = 0;
    for(var oneShift = 0; oneShift < shifts; oneShift++){ 
      if (oneShift % 4 === 3){
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
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;
  let consFailed = 0;  

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    let hasDayShift = false;
    let consecutiveDays = 0;

    for(var oneShift = 0; oneShift < shifts; oneShift++){ 

      if ((oneShift % 4 === 0) && (oneShift !== 0)){

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

      if (nurseShifts[oneNurse][oneShift] === 1){
        hasDayShift = true;
      }
    }
  }
  return consFailed;
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

function _getHoursFromTable(nurse, from, to){
  let nurseHours = 0;

  for(var oneShift = from; oneShift < to; oneShift++){
    if (nurseShifts[nurse][oneShift] === 1){
      nurseHours += 8;
    }
  }

  return nurseHours;
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
    if(nurseShifts[nurse][oneShift] !== 0){
      return false;
    }
  }
  return true;
}

function _getRestShiftsDuring24(nurse, startShift){
  let restShifts = 0;
  for(var oneShift = startShift; oneShift < startShift + 4; oneShift++){
    if (nurseShifts[nurse][oneShift] === 0){
      restShifts++;
    }
  }
  return restShifts;
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

function checkHardConsSeven() {
  //During any period of 24 consecutive hours, at least 11 hours of rest is required.
  var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;
  let consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    for(var oneShift = 0; oneShift < shifts - 3; oneShift++){
      if(_getRestShiftsDuring24(oneNurse,oneShift) < 2){
        consFailed++;
      }
    }
  }

  return consFailed;
}

function _getRestShiftsDuring24(nurse, startShift){
  let restShifts = 0;
  for(var oneShift = startShift; oneShift < startShift + 4; oneShift++){
    if (nurseShifts[nurse][oneShift] == 0){
      restShifts++;
    }
  }
  return restShifts;
}

function checkHardConsEight(){
// A night shift has to be followed by at least 14 hours rest. An exception is that once in a
// period of 21 days for 24 consecutive hours, the resting time may be reduced to 8 hours.
var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;
  var day = 0;
  let consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    let isExcepAvaible = true;
    let dayOfException = 0;

    for(var oneShift = 3; oneShift < shifts - 4; oneShift+=4, day++){
      if ((dayOfException != 0) && (day-dayOfException > 21)){
        isExcepAvaible = true;
        dayOfException = 0;
      }

      if(nurseShifts[oneNurse][oneShift] == 1){
        var restShifts = _getRestShifts(oneNurse, oneShift);
        if(restShifts < 2){
          if (isExcepAvaible){
            if(restShifts < 1){
              consFailed++;
            }
            isExcepAvaible = false;
            dayOfException = day;
          }else{
            consFailed++;
          }
        }
      }
    }
  }
  return consFailed;
}

function _getRestShifts(nurse, startShift){
  let restShifts = 0;
  for(var oneShift = startShift + 1; oneShift < startShift + 4; oneShift++){
    if (nurseShifts[nurse][oneShift] == 0){
      restShifts++;
    }else{
      break;
    }
  }
  return restShifts;
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

/*
 * Arkadiusz Bontur
 *
 * Dla każdej kolejnej funkcji zmiennne pomocnicze wyglądają tak samo:
 *  @shifts - ogólna ilość zmian 
 *  @nurses - ogólna ilosć pielęgniarek
 *  @numberOfBrokenConstraints - liczba złamanych ograniceń
 *
 *  Iteratory dla pętli for:
 *  @nurse - aktualna pielęgniarka
 *  @shift - aktualna zmiana
 * "1.For the period of Friday 22:00 to Monday 0:00 a nurse should have either no shifts or at least 2 shifts (‘Complete Weekend’)."
 */
function checkSoftConstOne()
{
    const shifts = nurseShifts[0].lenght;
    const nurses = nurseShifts.lenght;
    var numberOfBrokenConstraints = 0;

    for(let nurse = 0; nurse < nurses; nurse++)
    {
        //Zaczynam od zmiany "późnej" ponieważ kończy się o 23
        for(let shift = 18; shift < shifts; shift += 28)
        {
            let sum = 0;
            //sprawdzam czy w okresie od zmiany "późnej" w piątek do nocnej w niedziele ta konkretna pielęgniarka pracuje 
            for(let i = 0; i < 10; i++) sum += nurseShifts[nurse][shift];
            //Jeśli liczba jej zmian jest różna od 0(zera) i mniejsza od 2 to ograniczenie zostaje złamane
            if((sum != 0) && sum < 2)) numberOfBrokenConstraints += 1;
        }
    }
    return numberOfBrokenConstraints;
}
/*
 * "3.For employees with availability of 30--‐48 hours per week, within one week the number of shifts is within the range 4--‐5."
 *
 */
function checkSoftConstThree()
{
    const shifts = nurseShifts[0].lenght;
    const nurses = nurseShifts.lenght;
    var numberOfBrokenConstraints = 0;
    
    for(let nurse = 0; nurse < nurses; nurse++)
    {
        let subSum = 0;
        for(let shift = 2; shift < shifts; shift += 28)
        {
            var begin = shift;
            for(var i = shift; i < begin + 28; i += 4)
            {
                if(nurseShifts[nurse][i] === 1)
                {
                    sum += nurseShifts[nurse][i];
                }
                else sum = 0;
            }
            if(((sum < 4) || (sum > 5)) && (nurseShifts[nurse][i] === nurseShifts[nurse][i + 4] === 1)) numberOfBrokenConstraints++;
        }
    }


    return numberOfBrokenConstraints;
}
/*
 *
 * "4. For employees with availability of 30--‐48 hours per week, the length of a series of shifts should be within the range of 4--‐6."
 *
 */
function checkSoftConstFor()
{
    const shifts = nurseShifts[0].lenght;
    const nurses = nurseShifts.lenght;
    var numberOfBrokenConstraints = 0;
    var sum = 0;
    
    //ta pętla porusza się po pielęgniarkach
    for(let nurse = 0; nurse < nurses; nurse++)
    {
        //Ta natomiast po zmianach tych pielęgniarek
        //2 - oznacza zmianę poźną
        //shift += 28 oznacza ten sam dzień i zmianę ale tydzień później
        for(let shift = 2; shift < shifts; shift += 28)
        {
            var begin = shift;
            //Tutaj przemierzam cały tydzień i zliczam zmiany późne
            for(var i = shift; i < begin + 28; i += 4)
            {
                if(nurseShifts[nurse][i] === 1)
                {
                    sum += nurseShifts[nurse][i];
                }
                else sum = 0;
            }
            //Jeśli zmian jest mniej niż 4 lub wiecej jak 6 i pielęgniarka ma zmianę w niedzielę oraz w poniedziałek to to ograniczenie zostaje złamane  
            if(((sum < 4) || (sum > 6)) && (nurseShifts[nurse][i] === nurseShifts[nurse][i + 4] === 1)) numberOfBrokenConstraints++;
        }
    }
}
/*
 *
 * "5. For all employees the length of a series of late shifts should be within the range of 2--‐3. It could be within another series."
 */
function checkSoftConstFive()
{
    const shifts = nurseShifts[0].lenght;
    const nurses = nurseShifts.lenght;
    var numberOfBrokenConstraints = 0;
    var sum = 0;
    for(let nurse = 0; nurse < nurses; nurse++)
    {
        //Zaczynam od zmiany późnej i kieruję się 3 kolejne dni na przód żeby sprawdzić ile razy pielęgniarka ma zmianę późną
        for(let shift = 2; shift < shifts; shift += 12)
        {
            //Ta seria może wystąpić bespośrednio przed następną więc resetujemy sumę.
            sum = 0;
            //Tutaj sprawdzam każdą zmianę wieczorną z kolei
            for(let i = shift; i <= (shift + 12); i += 4)
            {
                //Jeśli pielęgniarka ma zmianę późną to inkrementuje sum
                if(nurseShifts[nurse][i] === 1) sum++;
                //Natomiast jeśli nie to seria zostaje przerwana
                else sum = 0;
            }
            if((sum < 2 ) && (sum > 3)) numberOfBrokenConstraints++;
        }       
    }

    return numberOfBrokenConstraints;
}
/*
 *
 * 6.An early shift after a day shift schould be avoided.
 *
 */
function checkSoftConstSix()
{
    const nurses = nurseShifts.lenght;
    const shifts = nurseShifts[0].lenght;
    var numberOfBrokenConstraints = 0;
        
    for(var nurse = 0; nurse < nurses; nurse++)
    {
        for(var shift = 0; shift < shifts; shift += 4)
        {
            //Jeśli zmiana dzienna jest zajeta i zmiana poranna dnia następnego przez tę samą pielęgniarke to ograniczenie zostaje złamane.
            if((nurseShifts[nurse][shift] == 1) && (nurseShifts[nurse][shift + 5] == 1)) numberOfBrokenConstraints++;
        }
 
    }
    return numberOfBrokenConstraints;
}



