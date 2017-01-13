/**
 * Created by fangjiahui on 16/12/23.
 */


var proxy = require('express-http-proxy');
var url = require('url');


var _serverConfig = {
    https: false,
    host: '192.2.17.63',
    port: '8082'
};

var ServerProxy = function (serverConfig) {
    serverConfig = serverConfig || {};

    var host = serverConfig.host || _serverConfig.host;
    var port = serverConfig.port || _serverConfig.port;

    var target = host + (port ? ':' + port : '');

    serverConfig.forwardPath = serverConfig.forwardPath || function (req, res) {
            return url.parse(req.url).path;
        };

    return proxy(target, serverConfig);
};

module.exports = ServerProxy;