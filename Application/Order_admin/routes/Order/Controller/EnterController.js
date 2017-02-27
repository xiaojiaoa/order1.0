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


var EnterController = {

    enterMaterialPage: function (req, res) {
        res.render('order/enter/enter_material');
        // var paramObject = helper.genPaginationQuery(req);
        // Base.multiDataRequest(req, res, [
        //     {url: '/api/customers?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'customerList', is_must: true}},
        //     {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}}
        // ], function (req, res, resultList) {
        //
        //     var paginationInfo =  resultList.customerList;
        //
        //     var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
        //         prelink: paramObject.withoutPageNo,
        //         current: paginationInfo.page,
        //         rowsPerPage: paginationInfo.pageSize,
        //         totalResult: paginationInfo.totalItems
        //     }));
        //
        //     var returnData = Base.mergeData(helper.mergeObject({
        //         title: ' ',
        //         pagination: boostrapPaginator.render(),
        //         Permission :Permissions,
        //     },resultList));
        //     res.render('order/customers', returnData);
        // });
    },
    enterMaterialDetailPage: function (req, res) {
        res.render('order/enter/enter_material_detail');
        // var cid =  req.params.cid;
        // Base.multiDataRequest(req, res, [
        //         {url: '/api/customers/'+ cid, method: 'GET', resConfig: {keyName: 'customerInfo', is_must: true}},
        //         {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}}
        //     ],
        //     function (req, res, resultList) {
        //         var returnData = Base.mergeData(helper.mergeObject({
        //             title: ' ',
        //             cid:cid,
        //             Permission :Permissions,
        //         }, resultList));
        //         res.render('order/customer/detail', returnData);
        //
        //     });
    },
    doPassMaterial: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/getTask/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    notPassMaterial: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/getTask/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    enterProductPage: function (req, res){
        res.render('order/enter/enter_product');
    },
    enterProductDetailPage: function (req, res){
        res.render('order/enter/enter_product_detail');
    },
};

module.exports = EnterController;

