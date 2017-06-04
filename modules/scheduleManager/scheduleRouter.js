var express = require('express');
var scheduleController = require('./scheduleController');
var constraintsController = require('./constraintsController');
var integrationController = require('./integrationController');

scheduleManagerRouter = express.Router();

scheduleManagerRouter.get('/results/', scheduleController.getResultJson);
scheduleManagerRouter.get('/nurses/', scheduleController.getNurses);
scheduleManagerRouter.get('/days/', scheduleController.getDaysJson);
scheduleManagerRouter.get('/constraints/', constraintsController.getConstraints);
scheduleManagerRouter.get('/runAll/', integrationController.runAll);
scheduleManagerRouter.post('/firstWeek/', integrationController.saveFirstWeek);

module.exports = scheduleManagerRouter;