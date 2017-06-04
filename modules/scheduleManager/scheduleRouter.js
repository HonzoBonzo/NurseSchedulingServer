var express = require('express');
var scheduleController = require('./scheduleController');
var constraintsController = require('./constraintsController');

scheduleManagerRouter = express.Router();

scheduleManagerRouter.get('/results/', scheduleController.getResultJson);
scheduleManagerRouter.get('/nurses/', scheduleController.getNurses);
scheduleManagerRouter.get('/days/', scheduleController.getDaysJson);
scheduleManagerRouter.get('/constraints/', constraintsController.getConstraints);

module.exports = scheduleManagerRouter;
