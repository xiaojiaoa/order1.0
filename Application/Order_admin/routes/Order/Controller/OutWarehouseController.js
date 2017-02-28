//模板 供复制用
var Base = require('./BaseController');

//分页
var Pagination = require('pagination');

//生成请求query
var queryString = require('qs');

//自定义帮助函数
var helper = require('../config/helper');

//请求模块
var request = require('request');

//引入权限
var Permissions = require('../config/permission');


var OutWarehouseController = {

    waitSendPage: function (req, res) {
        res.render('order/shipments/wait_send');

    },
    doDelivery: function (req, res) {
        var tids = req.body.tids;
        tids = tids.substring(0, tids.length - 1);
        req.body.tids = tids;

        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/review/pass?'+queryString.stringify(req.body),
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/deliveryNote");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    deliveryNotePage: function (req, res) {
        res.render('order/shipments/deliver_note');

    },
    doDeliveryChecked: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/getTask?tids='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    deliveryNoteDeatil: function (req, res) {
        res.render('order/shipments/deliver_detail');

    },
    outMaterialPage: function (req, res) {
        res.render('order/shipments/out_material');

    },
    outMaterialChecked: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/getTask?tids='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    outMaterialDeatil: function (req, res) {
        res.render('order/shipments/out_material_detail');

    },
    canSendPage: function (req, res) {
        res.render('order/shipments/can_send');

    },
    doSend: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/getTask?tids='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    canSendDeatil: function (req, res) {
        res.render('order/shipments/can_send_detail');

    },
    outProductPage: function (req, res) {
        res.render('order/shipments/out_product');

    },
    outProductDeatil: function (req, res) {
        res.render('order/shipments/out_product_detail');

    },
    outBredPage: function (req, res) {
        res.render('order/shipments/out_bred');

    },
    outBredDeatil: function (req, res) {
        res.render('order/shipments/out_bred_detail');

    },

    doCheckBred: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/getTask?tids='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doUnCheckBred: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/getTask?tids='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = OutWarehouseController;

