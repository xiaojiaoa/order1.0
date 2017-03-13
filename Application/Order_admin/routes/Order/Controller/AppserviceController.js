//模板 供复制用
var Base = require('./BaseController');


//生成请求query
var queryString = require('qs');

//自定义帮助函数
var helper = require('../config/helper');

//请求模块
var request = require('request');


var AppServiceController = {

    cargooutPage: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoout/package/list/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if(body){
                    var $data = JSON.parse(body);
                    res.send($data);
                }
            }
        })
        },
    cargooutOrder: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoout/order/list',
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if(body){
                    var $data = JSON.parse(body);
                    res.send($data);
                }
            }
        })
    },
    cargoinPackage: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/package/list',
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if(body){
                    var $data = JSON.parse(body);
                    res.send($data);
                }
            }
        })
    },
    cargoinOrder: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/order/package/list',
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if(body){
                    var $data = JSON.parse(body);
                    res.send($data);
                }
            }
        })
    },
    doCargoin: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/package',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                // res.redirect('/enterMaterial')
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doCargoout: function (req, res) {
        var pakgId = req.body.pakgId;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoout/prod?pakgId='+pakgId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                // res.redirect('/enterMaterial')
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

};
module.exports = AppServiceController;

