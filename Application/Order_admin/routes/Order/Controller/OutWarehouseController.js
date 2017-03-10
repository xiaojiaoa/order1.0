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
        var ftyId = req.query.ftyId ? req.query.ftyId: req.session.user.ftyId;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/mates?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'matesList', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.matesList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                userFtyId: ftyId,
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/shipments/out_material', returnData);
        });

    },
    outMaterialChecked: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/cargout/mates?id='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    outMaterialDeatil: function (req, res) {
        var id = req.params.id;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/mates/'+ id, method: 'GET', resConfig: {keyName: 'matesInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                outId: id,
            },resultList));
            res.render('order/shipments/out_material_detail', returnData);
        });

    },
    canSendPage: function (req, res) {
        var type = req.params.type;
        var multiDataRequest = [];
        if(type == 'outMaterial'){
            multiDataRequest = [
                {url: '/api/whse/cargout/order?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'cargoutList', is_must: true}},
            ]
        }else{

        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, multiDataRequest, function (req, res, resultList) {

            var paginationInfo =  resultList.cargoutList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                type:type,
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/shipments/can_send', returnData);
        });

    },
    sendPage: function (req, res){
        var type = req.params.type;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url: '/api/purchase/reqmaterial/purchase/cargoin?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'cargoinList', is_must: false}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            ],
            function (req, res, resultList) {
                var paginationInfo =  resultList.cargoinList;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    type: type,
                    pagination: boostrapPaginator.render(),
                }, resultList));
                res.render('order/shipments/can_send_page', returnData);
            });

    },
    doSend: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/cargout/mates',
            form: req.body
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
        var ftyId = req.query.ftyId ? req.query.ftyId: req.session.user.ftyId;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/prods?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'prodsList', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.prodsList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                userFtyId: ftyId,
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/shipments/out_product', returnData);
        });

    },
    outProductChecked: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/cargout/mates?id='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    outProductDeatil: function (req, res) {
        var id = req.params.id;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/prods/'+ id, method: 'GET', resConfig: {keyName: 'prodsInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                outId: id,
            },resultList));
            res.render('order/shipments/out_product_detail', returnData);
        });
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

