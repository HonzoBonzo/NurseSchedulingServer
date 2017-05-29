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
  checkHardConsTwo: checkHardConsTwo
}

function getConstraints(req, res, next) {
  const mockConstraints = [
    { 
      failedHardSum: 1,
      failedHards: [
        checkHardConsOne(),
        checkHardConsTwo(),
        0,
        0,
        0,
        0
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
  const filePath = './wyniki/5000/tab.txt';
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

function checkHardConsTwo(req, res, next) {
  var shifts = nurseShifts[0].length;
  var nurses = nurseShifts.length;
  let consFailed = 0;

  for(var oneNurse = 0; oneNurse < nurses; oneNurse++){
    let shiftsPerDay = 0; 

    for(var oneShift = 0; oneShift < shifts; oneShift++){
      if ((oneShift % 4 == 0) && (oneShift != 0)){
        if (shiftsPerDay > 1){
          consFailed++;
          res.send(oneNurse + " " + oneShift)
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
function checkSoftConstOne(req, res, next)
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
 *
 * "4. For employees with availability of 30--‐48 hours per week, the length of a series of shifts should be within the range of 4--‐6."
 *
 */
function checkSoftConstFor(req, res, next)
{
    const shifts = nurseShifts[0].lenght;
    const nurses = nurseShifts.lenght;
    var numberOfBrokenConstraints = 0;
    var sum = 0;
    
    for(let nurse = 0; nurse < nurses; nurse++)
    {
        for(let shift = 0; shift < shifts; shift += 28)
        {
            for(let i = shift; i < shift + 28; i++)
            {
                if((shift != 0) && (shift % 28)) sum = 0;            
            }             
        }
    }
}
/*
 *
 * "5. For all employees the length of a series of late shifts should be within the range of 2--‐3. It could be within another series."
 */
function checkSoftConstFive(req, res, next)
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
function checkSoftConstSix(req, res, next)
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
