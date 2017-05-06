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
      failedHards: [
        0,
        0,
        0,
        0,
        0,
        0
      ]
    },
    {
      failedSoftSum: 4748,
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
