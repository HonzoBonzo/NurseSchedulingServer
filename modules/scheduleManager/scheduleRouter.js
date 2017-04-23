var express = require('express');
var scheduleController = require('./scheduleController');

scheduleManagerRouter = express.Router();

scheduleManagerRouter.get('/results/', scheduleController.getResultJson);

module.exports = scheduleManagerRouter;