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
            {url: '/api/purchase/request/'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'purchasesList', is_must: true}},
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
    //新建请购单
    purchaseApplyCreatPage: function (req, res) {
        res.render('order/purchase/apply_creat');
    },
    //请购单详情
    purchaseApplyDetailPage: function (req, res) {
        res.render('order/purchase/apply_detail');
    },
    //采购列表
    purchaseDetailPage: function (req, res) {
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
    purchaseOrderDetailPage: function (req, res) {
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
};

module.exports = PurchaseController;