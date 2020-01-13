var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	var parms = req.body;
	// var query = parms.query;
	// var start = parseInt(parms.start);
	// var end   = parseInt(parms.end);
	// var limit     = parseInt(parms.limit);

    

    
    res.status(200).send('This is custom data to be rendered');
});

module.exports = router;