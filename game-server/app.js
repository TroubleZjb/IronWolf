var pomelo = require('pomelo');
var fs = require('fs'),
    path = require('path');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'IronWolf');

// app configuration
app.configure('production|development', 'connector', function() {
    app.set('connectorConfig', {
        connector: pomelo.connectors.sioconnector,
        //websocket, htmlfile, xhr-polling, jsonp-polling, flashsocket
        transports: ['websocket'],
        heartbeats: true,
        closeTimeout: 60,
        heartbeatTimeout: 60,
        heartbeatInterval: 25
    });
});

// start app
app.start();

fs.writeFileSync(path.normalize(__dirname + '/config/wolfData/wolfData.json'), JSON.stringify({}));
fs.writeFileSync(path.normalize(__dirname + '/config/wolfData/playData.json'), JSON.stringify({}));

process.on('uncaughtException', function(err) {
    console.error(' Caught exception: ' + err.stack);
});
