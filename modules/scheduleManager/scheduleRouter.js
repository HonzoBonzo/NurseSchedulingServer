var express = require('express');
var scheduleController = require('./scheduleController');

scheduleManagerRouter = express.Router();

scheduleManagerRouter.get('/results/', scheduleController.getResultJson);
scheduleManagerRouter.get('/nurses/', scheduleController.getNurses);
scheduleManagerRouter.get('/days/', scheduleController.getDaysJson);

module.exports = scheduleManagerRouter;