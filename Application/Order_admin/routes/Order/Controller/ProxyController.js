//请求代理控制器
var Base = require('./BaseController');

//请求模块
var request = require('request');

var ProxyController = {
    commonProxy: function (req, res, next) {
        //设置代理
        //TODO method,path,root

        var url = req.url.replace('/common', '');

        request(Base.mergeRequestOptions({
            url: url,
            method: req.method,
            timeout: 5000
        }, req, res), function (error, response, body) {
            res.status(response.statusCode).send(body);
        });

    }
};

module.exports = ProxyController;