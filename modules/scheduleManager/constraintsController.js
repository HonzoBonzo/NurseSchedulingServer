var express = require('express');
var _ = require('lodash');
var scheduleService = require('./scheduleService');
var fs = require('fs');
var nurseShifts = getShifts();

var shiftDemandsPerDay = {
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
      checkHardConsFour() +  checkHardConsFive() + checkHardConsSeven() +
      checkHardConsEight() + checkHardConsNine() + checkHardConsTen(),
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
      failedSoftSum: 
        checkSoftConstOne() +
        checkSoftConstTwo() +
        checkSoftConstThree() +
        checkSoftConstFor() +
        checkSoftConstFive() +
        checkSoftConstSix(),
      failedSofts: [
        checkSoftConstOne(),
        checkSoftConstTwo(),
        checkSoftConstThree(),
        checkSoftConstFor(),
        checkSoftConstFive(),
        checkSoftConstSix()
      ]
    }
  ];
  
  res.send(mockConstraints);
}

function getShifts(){
  const filePath = 'tab.txt'
  var digitRows = [];

  var test = fs.readFile(filePath, 'utf8', function(err, data) {
		if (err) {throw err;}
    var rows = data.split("\n", 2000);    

    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      var oneRow = rows[rowIndex].split(" ", 200);
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
  var consFailed = 0;
  var day = 0;

  for(var oneShift = 0; oneShift < shifts; oneShift++){
    var nursePerShift = 0;
    if ((oneShift % 4 === 0) && (oneShift !== 0)){
      day++;
    }

    for(var oneNurse = 0; oneNurse < nurses ; oneNurse++){
      if (nurseShifts[oneNurse][oneShift] === 1){
        nursePerShift++;
      }
    }
    
    if (shiftDemandsPerDay[day % 7][oneShift % 4] !== nursePerShift){
      consFailed++;
    }
  }
  return consFailed;
}

function checkHardConsTwo() {
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;
  var consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    var shiftsPerDay = 0; 

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
  var consFailed = 0;

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
  var consFailed = 0;
  
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

function checkHardConsFive() {
  /*    A nurse must receive at least 2 weekends off duty per 5 week period. A weekend
        off duty lasts 60 hours including Saturday 00:00 to Monday 04:00.           */
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;
  var consFailed = 0;
  

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
  var consFailed = 0;
  
  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    var consecutiveNightShifts = 0;
    var consecutiveRestShifts = 0;
    var isRestPeriod = false;

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
  var consFailed = 0;

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
  var consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    var isExcepAvaible = true;
    var dayOfException = 0;

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
  var consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    var consecutiveNightShifts = 0;
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
  var consFailed = 0;  

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    var hasDayShift = false;
    var consecutiveDays = 0;

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
  var nurseHours = 0;
    
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
  var nurseHours = 0;

  for(var oneShift = from; oneShift < to; oneShift++){
    if (nurseShifts[nurse][oneShift] === 1){
      nurseHours += 8;
    }
  }

  return nurseHours;
}

function _getCountWeeksOfDuty(nurse, from, to){
  var weeksOfDuty = 0;
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
  var restShifts = 0;
  for(var oneShift = startShift; oneShift < startShift + 4; oneShift++){
    if (nurseShifts[nurse][oneShift] === 0){
      restShifts++;
    }
  }
  return restShifts;
}

function _getNumberOfNightShifts(nurse, from, to){
  var nightShifts = 0;

  for(var oneShift = from; oneShift < to; oneShift++){
    if ((oneShift % 4 === 3) && (nurseShifts[nurse][oneShift] === 1)){
      nightShifts++;
    }
  }
  return nightShifts;
}

/*
 * Arkadiusz Bontur
 *
 * Dla każdej kolejnej funkcji zmiennne pomocnicze wyglądają tak samo:
 *  @shifts - ogólna ilość zmian 
 *  @nurses - ogólna ilosć pielęgniarek
 *  @numberOfBrokenConstraints - liczba złamanych ograniceń
 *
 *  Iteratory dla pętli for:
 *  @nurse - aktualna pielęgniarka
 *  @shift - aktualna zmiana
 * "1.For the period of Friday 22:00 to Monday 0:00 a nurse should have either no shifts or at least 2 shifts (‘Compvare Weekend’)."
 */
function checkSoftConstOne()
{
//raczej działa dobrze
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;  
    var numberOfBrokenConstraints = 0;

    for(var nurse = 0; nurse < nurses; nurse++)
    {
        //Zaczynam od zmiany "późnej" w piątek ponieważ kończy się o 23
        for(var shift = 18; shift < shifts; shift += 28)
        {
            var begin = shift;
            var sum = 0;
            //sprawdzam czy w okresie od zmiany "późnej" w piątek do nocnej w niedziele ta konkretna pielęgniarka pracuje 
            for(var i = begin; i < (begin + 10); i++) sum += nurseShifts[nurse][i];
            //Jeśli liczba jej zmian jest różna od 0(zera) i mniejsza od 2 to ograniczenie zostaje złamane
            if((sum != 0) && (sum < 2))
            { 
                numberOfBrokenConstraints++ ;
            }
        }
    }

    return numberOfBrokenConstraints;
}
/*
 * "2. For employees with availability of 30--‐48 hours per week, the length of a series of night shifts should be within the range 2--‐3. It could be before another series."
 *
 *  @subSum -  oznacza ilość zmian pod rząd
 *  @sum    -  oznacza łączną ilość zmian w ciągu tygodnia        
 */
function checkSoftConstTwo()
{
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;  
    var numberOfBrokenConstraints = 0;
    var nursesWithAvailabilty = 12 //nurses with availability of <30, 48> hours per week <0, 12>

    for(var nurse = 0; nurse <= nursesWithAvailabilty; nurse++)
    {
        //Zaczynam od poniedziałkowej zmiany nocnej 
        for(var nurse = 0; nurse < nursesWithAvailabilty; nurse++)
        {
            var series = 0;
            //Zaczynam od zmiany nocnej 
            for(var shift = 3; shift < shifts; shift += 4) 
            {
                //Znajduję pierwszą jedynkę 
                if(nurseShifts[nurse][shift] === 1)
                {
                    //Zwiększam długość serii
                    series++
                    //Jeśli seria nie spełnia oczekiwań i w kolejnej iteracji seria zostanie przerwana to ograniczenie jest złamane.
                    if(((series < 2) || (series > 3)) && (nurseShifts[nurse][shift + 4] === 0)) numberOfBrokenConstraints++;
                }
                else series = 0;
            }       
        }
      
    }

    return numberOfBrokenConstraints;

}
/*
 * "3. For employees with availability of 30--‐48 hours per week, within one week the number of shifts is within the range 4--‐5."
 *
 */
function checkSoftConstThree()
{
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;  
    var numberOfBrokenConstraints = 0;
    var nursesWithAvailabilty = 12 //nurses with availability of <30, 48> hours per week <0, 12>

    for(var nurse = 0; nurse < nursesWithAvailabilty; nurse++)
    {
        //Zaczynam od poniedziałkowej zmiany dziennej i kończę na nocnej niedzielnej
        for(var shift = 0; shift < shifts; shift += 28)
        {
            //Przy rozpocząeciu każdego tygodnia zeruję sumę.
            sum = 0;
            //Zliczam zmiany od poniedziałku do niedzieli
            for(var i = shift; i <= (shift + 27); i++)
            {
                //Zliczam wystąpienia zmian
                sum = sum + nurseShifts[nurse][i];
            }
            //Jeśli suma jest mniejsza od 4 lub większa od 5 to ograniczenie zostaje złamane
            if((sum < 4 ) || (sum > 5)) numberOfBrokenConstraints++;
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
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;  
    var numberOfBrokenConstraints = 0;
    var nursesWithAvailabilty = 12 //nurses with availability of <30, 48> hours per week <0, 12>
    var series = 0;
    //ta pętla porusza się po pielęgniarkach
    for(var nurse = 0; nurse < nursesWithAvailabilty; nurse++)
    {
        for(var shift = 0; shift < shifts; shift += 4)
        {
            var subSum = 0;
            for(var i = shift; i < shift + 4; ++i)
            {
                subSum += nurseShifts[nurse][i];
            }       
            if(subSum === 1)
            {
                series++;
                if(series > 0)
                {
                    if((series < 4) || (series > 6))
                    {
                        subSum = 0;
                        for(var j = i; j < i + 4; ++j)
                        {
                            subSum += nurseShifts[nurse][j];
                        } 
                        if(subSum === 0)
                        {
                            numberOfBrokenConstraints++;
                        }
                    }
                }
            }
            else
            {
                series = 0;
            }
        }
    }
    return numberOfBrokenConstraints;
}
/*
 *
 * "5. For all employees the length of a series of late shifts should be within the range of 2--‐3. It could be within another series."
 */
function checkSoftConstFive()
{
    const shifts = nurseShifts[0].length;
    const nurses = nurseShifts.length;  
    var numberOfBrokenConstraints = 0;

    for(var nurse = 0; nurse < nurses; nurse++)
    {
        var series = 0;
        //Zaczynam od zmiany późnej i kieruję się 3 kolejne dni na przód żeby sprawdzić ile razy pielęgniarka ma zmianę późną
        for(var shift = 2; shift < shifts; shift += 4)
        {
            //Znajduję pierwszą jedynkę 
            if(nurseShifts[nurse][shift] === 1)
            {
                series++
                //Jeśli seria nie spełnia oczekiwań i w kolejnej iteracji seria zostanie przerwana to ograniczenie jest złamane.
                if(((series < 2) || (series > 3)) && (nurseShifts[nurse][shift + 4] === 0)) numberOfBrokenConstraints++;
            }
            else series = 0;
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
  const shifts = nurseShifts[0].length;
  const nurses = nurseShifts.length;  
    var numberOfBrokenConstraints = 0;
    for(var nurse = 0; nurse < nurses; nurse++)
    {
        //zmiana 0 oznacza zmianę dzienną, 
        for(var shift = 0; shift < shifts; shift += 4)
        {
            //Jeśli zmiana dzienna jest zajeta i zmiana wczesna dnia następnego przez tę samą pielęgniarke to ograniczenie zostaje złamane.
            if((nurseShifts[nurse][shift] === 1) && (nurseShifts[nurse][shift + 5] === 1))
            {
                numberOfBrokenConstraints++;
            }
        }
 
    }

    return numberOfBrokenConstraints;
}


