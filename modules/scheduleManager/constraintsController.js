var express = require('express');
var _ = require('lodash');
var scheduleService = require('./scheduleService');

module.exports = {
	getConstraints: getConstraints
}

function getConstraints(req, res, next) {
  const mockConstraints = [
    { 
      failedHardSum: 0,
      failedHards: {
        hard1: 0,
        hard2: 0,
        hard3: 0,
        hard4: 0,
        hard5: 0,
        hard6: 0
      }
    },
    {
      failedSoftSum: 4748,
      failedSofts: {
        soft1: 934,
        soft2: 2567,
        soft3: 123,
        soft4: 1137,
        soft5: 456,
        soft6: 235
      }
    }
  ];

  res.send(mockConstraints);
}
