<img src="https://github.com/Appdynamics/FastAppConfig/blob/master/public/img/features.png"/>

# Table of Contents

* [Installation](#installation)
* [Features](#features)

# Installation

## Required Frameworks

1. NodeJS version v0.10.34 or v4.x
1. Bower

References:

* https://nodejs.org/en/download/
* http://bower.io/

We are working on removing the bower dependency.

## Install on Your OS
## Installing

1. Clone from repository: `git clone https://github.com/Appdynamics/biqapp-sdk.git`
1. Change into the directory: `cd biqapp-sdk`
1. Download the dependencies: `bower install`
1. Download npm dependencies: `npm install`
1. Configure the app.
   Create a config.json file in the root directory with the following :

```
{
	"localport":3000,
	"controller":"",
    "https":true,
	"globalKey":"",
	"accessKey":"",
	"analyticsUrl":"https://analytics.api.appdynamics.com",
	"restdebug":false,
	"proxy_old": "http://<user>:<password>@<host>:<port>"
}
```

If you copy the above default text, you can still run the node.js server. Only configure the global and access keys when you are ready to execute adql queries.

* `localport`: the port that the node.js server will be started on
* `controller`: e.g. gummybears.saas.appdynamics.com
* `https`: use the https protocol
* `globalKey`: The Global Account Key for the controller
* `accessKey`: The Analytics API access key, used to execute the analytics query
* `restdebug`: If set to true, will print debug statements on the console
* `proxy_old`: Rename this to proxy if you are using a proxy on the server you running the BiQ App framework on.

If you are running your controller with a different port e.g. 8090 then you need to add the port element e.g.

```
"controller" : "server.saas.appdynamics.com",
"port": 8090,
```

6. Start node.js: `npm start`
7. Open browser to:
   http://localhost:3000

# Documentation
You can navigate to /views/examples/intro.html

