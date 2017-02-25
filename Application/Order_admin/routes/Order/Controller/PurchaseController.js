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


var PurchaseController = {
    //已请购列表
    purchasePage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/purchase/request?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'purchasesList', is_must: true}},
            {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.purchasesList;
            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/purchase/index', returnData);

        });
    },
    //新建请购单页面
    purchaseApplyCreatPage: function (req, res) {
        var cid =  req.params.cid;
        Base.multiDataRequest(req, res, [
            {url: '/api/purchase/request/'+cid, method: 'GET', resConfig: {keyName: 'purchaseApplyCreat', is_must: true}},
            {url: '/api/assist/organ/types', method: 'GET', resConfig: {keyName: 'organTypes', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            },resultList));
            res.render('order/purchase/apply_creat', returnData);
        });
    },
    //请购单详情
    purchaseApplyDetailPage: function (req, res) {
        var tid = req.params.tid;
        Base.multiDataRequest(req, res, [
                {url: '/api/purchase/request/'+tid, method: 'GET', resConfig: {keyName: 'purchaseRequestDetail', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    Permission :Permissions,
                }, resultList));
                res.render('order/purchase/apply_detail', returnData);
            });
    },
    //审核请购单
    purchaseApplyReview: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchase/request?id='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //生成采购单
    purchaseOrder: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/purchases?reqId='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //采购列表
    purchaseDetail: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/purchases?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'purchasesLists', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.purchasesLists;
            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/purchase/detail', returnData);
        });
    },
    //采购单详情
    purchaseOrderDetail: function (req, res) {
        var tid = req.params.tid;
        Base.multiDataRequest(req, res, [
                {url: '/api/purchases/'+tid, method: 'GET', resConfig: {keyName: 'purchaseOrderList', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    Permission :Permissions,
                }, resultList));
                res.render('order/purchase/order_detail', returnData);
            });
    },
    //合并采购单
    purchaseMerge: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/merge?purcIds='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //审核采购单
    purchaseReview: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/review?purcIds='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //提交采购单
    purchaseSubmit: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/purchases/submit?purcIds='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = PurchaseController;