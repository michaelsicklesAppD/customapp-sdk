var express = require('express');
var router = express.Router();
var configManager = require('./../src/ConfigManager');

router.post('/', function(req, res) {
	var parms = req.body;
	var query = parms.query;
	var queryName = parms.queryname;
	var start = parseInt(parms.start);
	var end   = parseInt(parms.end);
	var limit     = parseInt(parms.limit);

	if(parms.queryname){
		query = configManager.getQuery(queryName);
	}


	req.analyticsManager.query(query,start,end,limit).then(function (results) {
		res.status(200).send(results);
	}, function(error){
		console.log(error);
		res.status(500).send(error.stack);
	}
	);
});

module.exports = router;
