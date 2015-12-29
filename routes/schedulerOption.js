'use strict';

var debug = require('debug')('secc:routes:schedulerOption');

var path = require('path');

module.exports = function(express, io, SECC, SCHEDULER) {
  var router = express.Router();

  var om = SCHEDULER.om;

  router.post('/analyze', function (req, res) {
    var json = req.body;

    if (typeof json !== 'object' 
      || !Array.isArray(json.argv)
      || typeof json.compiler === 'undefined'
      || typeof json.cwd === 'undefined'
      || typeof json.mode === 'undefined'
      ) {
      return res.status(400).send('invalid options');
    }

    res.send(om.analyzeArguments(json.argv, json.compiler, json.cwd, json.mode));
  });

  router.get('/gcc', function (req, res) {
    res.json(om.gccOptionList());
  });

  router.get('/gcc/index', function (req, res) {
    res.json(om.gccOptionIndexList());
  });

  return router;
};