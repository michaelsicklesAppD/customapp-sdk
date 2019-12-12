
## Required Frameworks

1. NodeJS V8+

References:

* https://nodejs.org/en/download/


## Installing

1. Download the latest release https://github.com/Appdynamics/customapp-sdk/releases
1. Change into the directory: `cd customapp-sdk`
1. Download npm dependencies: `npm install`
1. Create a config.json file in the root directory with the following :

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

# Adding Node Modules to Front End
Sometimes it may be useful to download a module using npm.  The libraries are then on your server. You can add those src files to the public-libraries.json folder.  When you start up the server, the files in the public-libraries.json file will be exposed to the front end.  This is so that only what you need is exposed to the front end. 


# Documentation
You can navigate to http://localhost:3000/views/examples/intro.html

