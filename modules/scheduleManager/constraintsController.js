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
 * "1.For the period of Friday 22:00 to Monday 0:00 a nurse should have either no shifts or at least 2 shifts (‘Complete Weekend’)."
 * Dla każdej kolejnej funkcji zmiennne pomocnicze wyglądają tak samo:
 *  @shifts - ogólna ilość zmian 
 *  @nurses - ogólna ilosć pielęgniarek
 *  @countConstraintsFailed - ilość złamań ograniczenia miękkiego
 *
 *  Iteratory dla pętli for:
 *  @nurse - aktualna pielęgniarka
 *  @shift - aktualna zmiana
 */
function checkSoftConstOne(req, res, next)
{
    var shifts = nurseShifts[0].lenght;
    var nurses = nurseShifts.lenght;
    var countConstraintsFailed = 0;

}

/*
 *
 * 6.An early shift after a day shift schould be avoided.
 *
 */
function checkSoftConstSix(req, res, next)
{
    var nurses = nurseShifts.lenght;
    var shifts = nurseShifts[0].lenght;
    var countConstraintsFailed = 0;
        
    for(var nurse = 0; nurse < nurses; nurse++)
    {
        for(var shift = 0; shift < shifts; shift += 4)
        {
            //Jeśli zmiana dzienna jest zajeta i zmiana poranna dnia następnego przez tę samą pielęgniarke to ograniczenie zostaje złamane.
            if((nurseShifts[nurse][shift] == 1) && (nurseShifts[nurse][shift + 5] == 1)) countConstraintsFailed++;
        }
 
    }
    return countConstraintsFailed;
}
