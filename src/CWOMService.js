var rp = require('request-promise').defaults({ jar: true });
var configManager = require("./ConfigManager.js");
var Action = require("./CWOM/Action.js");
const uuidv4 = require('uuid/v4');

module.exports = class CWOMService {
    constructor(config) {
        this.config = configManager.getCWOMConfig();
        this.authToken = "";
    }
    getMockAppServerAction(severity) {
        var serverName = "Mock AppDynamics Application Server[127.0.0.1,tag:Tomcat2]";
        return new Action({
            "uuid": uuidv4(),
            "createTime": "2019-07-05T12:12:41-04:00",
            "actionType": "RIGHT_SIZE",
            "actionState": "RECOMMENDED",
            "actionMode": "RECOMMEND",
            "details": "Scale down Threads for " + serverName + " from 200.0 Threads to 153.0 Threads",
            "importance": 0,
            "target": {
                "uuid": uuidv4(),
                "displayName": serverName,
                "className": "ApplicationServer",
                "environmentType": "ONPREM"
            },
            "currentEntity": {
                "uuid": uuidv4(),
                "className": "Threads"
            },
            "newEntity": {
                "uuid": uuidv4(),
                "className": "Threads"
            },
            "currentValue": "200.0",
            "newValue": "153.0",
            "resizeToValue": "153.0",
            "risk": {
                "uuid": uuidv4(),
                "subCategory": "Efficiency Improvement",
                "description": "Underutilized Threads in Application Server '" + serverName + "'",
                "severity": severity || "MINOR",
                "reasonCommodity": "Threads",
                "importance": 0
            },
            "actionID": uuidv4()
        })
    }
    getTurboToken() {
        var svc = this;

        return new Promise(function (resolve, reject) {
            var turbourl = svc.config.turboserver + '/vmturbo/rest/login?disable_hateoas=true';
            var authorization = 'Basic ' + Buffer.from(`${svc.config.username}:${svc.config.password}`).toString("base64");
            var headers = { 'Authorization': authorization, 'Content-Type': 'multipart/form-data' };
            var params = { 'username': svc.config.username, 'password': svc.config.password};

            var _include_headers = function (body, response, resolveWithFullResponse) {
                return { 'headers': response.headers, 'data': body };
            };


            var options = {
                encoding: 'UTF-8',
                method: 'POST',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers,
                form: params,
                transform: _include_headers
            };



            rp(options).then(function (ret) {
                //console.log('Return from Turbo Token: ' + JSON.stringify(ret));
                //console.log('Response Headers from Turbo Token: ' + JSON.stringify(ret.headers));
                resolve(ret);
            }).catch(function (err) {
                throw err;
            });
        });
    }
    getTurboActionList(critOnly, supplyChain, uniqueID) {
        var svc = this;

        return new Promise(function (resolve, reject) {

            svc.getTurboActions(critOnly).then(function (actions) {

                //console.log("::::::: got turbo actions! Total VM Actions: " + actions.filter(action => "VirtualMachine" === action.target.className).length + " | Total AS Actions: " + actions.filter(action => "ApplicationServer" === action.target.className).length);
                //console.log("refreshing actions with critOnly = " + critOnly);
                var myCrit = (critOnly ? "true" : "false");

                //if (supplyChain) { getApplicationSupplyChain(authToken, uuid); }

                //console.log("----> Returning data to page with uniqueID: " + uniqueID);
                resolve(actions)
                //io.emit('refreshactions', { turboactions: htmlact, critOnly: myCrit, uniqueID: uniqueID });

            }).catch(function (rej) { console.log("Promise 4 Failed! " + rej); });

        });
    }
    getTurboActionListMockData(critOnly, supplyChain, uniqueID) {
        var svc = this;

        return new Promise(function (resolve, reject) {
                resolve([svc.getMockAppServerAction("MAJOR")]);
        });
    }
    getTurboActions(critOnly) {

        //
        // Only bring actions from these VMs (Highlighted in the demo flow)
        //
        var svc = this;


        return new Promise(function (resolve, reject) {

            //console.log("getting turbo actions!");

            svc.getTurboToken().then(async function (tokenret) {

                var bodyreturn = JSON.parse(tokenret.data);
                var headerreturn = tokenret.headers;

                svc.authToken = bodyreturn.authToken;
                var spreturn = null;
                var allActions = [];
                var vmUUids = svc.config.vmUUids;
                svc.getAppServerList(svc.config.uuid).then(async function (data) {

                    var allActions = [];
                    var asUUids = data;

                    let promisedActions = [];
                    for (var i = 0; i < vmUUids.length; i++) {
                        promisedActions.push(svc.getTurboVMAction(vmUUids[i], critOnly));
                    }

                    for (var z = 0; z < asUUids.length; z++) {
                        promisedActions.push(svc.getTurboAppServerAction(asUUids[z], critOnly));
                    }

                    Promise.all(promisedActions).then(function (resultData) {
                        var actions = [];
                        //console.log("===> Total Actions Returned: " + resultData.length);
                        for (var x = 0; x < resultData.length; x++) {
                            var newAction = resultData[x];
                            if (newAction != null && newAction.length > 0)
                            {
                  
                              for(var w = 0; w < newAction.length; w++)
                              {
                                var thisAction = newAction[w];
                                //console.log("===> Validating Action: " + thisAction.uuid + " of type: " + thisAction.target.className);
                                actions.push(thisAction);
                              }
                        } // end if null
                    }

                    resolve(actions);

                    }).catch(function (rej) { console.log("AppServerList Failed! " + rej); });

                }).catch(function (rej) { console.log("Promise ALL Failed! " + rej); });

            }).catch(function (rej) { console.log("Promise 3 Failed! " + rej); });

        });
    }
    //Gets List of App Servers from Business Application AD-Financial-CWOM
    getAppServerList(uuid) {
        var svc = this;
        return new Promise(resolve => {
            var asList = [];
            var turbourl = svc.config.turboserver + '/vmturbo/rest/entities/' + uuid;
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };

            rp(options).then(function (ret) {
                var entityreturn = JSON.parse(ret);
                var fullList = entityreturn.providers;
                for (var x = 0; x < fullList.length; x++) {
                    //console.log("====> APP Server Found: " + fullList[x].displayName);
                    asList.push(fullList[x].uuid);
                }
                //console.log("Got List of App Servers: " + JSON.stringify(asList));
                resolve(asList);

            }).catch(function (err) {
                console.log(JSON.stringify(err));
                throw err;
            });

        }); // end Promise


    }
    getTurboVMAction(uuid, critOnly) {
        var svc = this;
        return new Promise(resolve => {
            var turbourl = svc.config.turboserver + '/vmturbo/rest/entities/' + uuid + "/actions";
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };

            rp(options).then(function (ret) {
                if (ret.length > 100) {
                    var allVMActions = [];
                    var myactionreturn = JSON.parse(ret);

                    for (var i = 0; i < myactionreturn.length; i++) {
                        var thisAction = new Action(myactionreturn[i]);
                        if (thisAction.target.className === "VirtualMachine")
                        {
                          
                          if (!critOnly) {
                              //resolve(thisAction);
                              allVMActions.push(thisAction);
                          }
                          else if (critOnly && thisAction.risk.severity === "CRITICAL") {
                            //resolve(thisAction);
                            allVMActions.push(thisAction);
                          }
                        }

                        //else { resolve(null); }
                    }
                    //resolve(allActions);
                    resolve(allVMActions);

                } else { resolve(null); }
            }).catch(function (err) {
                console.log(JSON.stringify(err));
                throw err;
            });

        }); // end Promise
    }

    getTurboAppServerAction(uuid, critOnly) {
        var svc = this;
        return new Promise(resolve => {
            var turbourl = svc.config.turboserver + '/vmturbo/rest/entities/' + uuid + '/actions';
            var headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + svc.authToken
            };

            var options = {
                method: 'GET',
                "rejectUnauthorized": false,
                uri: turbourl,
                headers: headers
            };

            rp(options).then(function (ret) {
                //console.log("====> Result: " + ret);
                if (ret.length > 100) {
                    var allASActions = [];
                    var myactionreturn = JSON.parse(ret);
                
                    for (var i = 0; i < myactionreturn.length; i++) {
                        var thisAction = new Action(myactionreturn[i]);

                        //console.log("Returning Action: " + thisAction.getActionID() + " for App Server");
                        if (!critOnly) { allASActions.push(thisAction); }
                        else if (critOnly && thisAction.risk.severity === "CRITICAL") {
                            allASActions.push(thisAction);
                        } else { resolve(null); }
                    }
                }
                else { resolve(null); }
                resolve(allASActions);

            }).catch(function (err) {
                console.log(JSON.stringify(err));
                throw err;
            });

        }); // end Promise
    }

}

// class Provider {
//     constructor(prov) {
//         if(!prov) { prov = {};}
//         this.uuid = prov.uuid || '';
//         this.displayName = prov.displayName || '';
//         this.className = prov.className || '';
//     }
// }




// class Person {
//     constructor(per) {
//         if(!per) { per = {};}
//         this.uuid = per.uuid || '';
//         this.displayName = per.displayName || '';
//         this.type = per.type || '';
//     }
// }
