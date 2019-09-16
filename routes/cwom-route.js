var express = require('express');
var router = express.Router();
var CWOMService = require('../src/CWOMService.js');
var cwomsvc = new CWOMService({});

function getCounts(type, actions) {
    var subactions = actions.filter(action => action.target.className === type)
    var data = {
        type : type,
        critical : subactions.filter(action => action.risk.severity === 'CRITICAL').length,
        major : subactions.filter(action => action.risk.severity === 'MAJOR').length,
        minor : subactions.filter(action => action.risk.severity === 'MINOR').length,
    }
    return data;
}

router.get('/actions', function(req, res) {
    cwomsvc.getTurboActionList(false).then((actions) => {
        console.log('The List is:');
        console.log(actions);
        var results  = {
            actions :actions,
            counts: [getCounts("ApplicationServer", actions), getCounts("VirtualMachine", actions), getCounts("Host", actions), getCounts("Storage", actions), getCounts("Database", actions)]
        }
        res.status(200).send(results);
    } , (err) => {
        res.status(500).send({});
    });
    

	
});

module.exports = router;