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


var OrderController = {

    listPage: function (req, res) {

        console.log(req);
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'orderList', is_must: true}},
            {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
            {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandInfo', is_must: false}},
            {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodInfo', is_must: false}}
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.orderList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/orders', returnData);
        });

    },
    detailPage: function (req, res) {

        var tid = req.params.tid;
        Base.multiDataRequest(req, res, [
                {url: '/api/orders/'+tid, method: 'GET', resConfig: {keyName: 'orderInfo', is_must: true}},
                // {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}},
                {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: false}},
                {url: '/api/assist/deco/style' , method: 'GET', resConfig: {keyName: 'styleInfo', is_must: true}},
                {url: '/api/assist/file/type', method: 'GET', resConfig: {keyName: 'allFileTypeInfo', is_must: true}}
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    Permission :Permissions,
                }, resultList));
                res.render('order/order/order_detail', returnData);
            });
    },
    resupplyPage: function (req, res) {
        res.render('order/order/resupplys');
    },
    acceptPage: function (req, res) {
        res.render('order/order/resupplys_accept');
    },
    tearsPage: function (req, res) {
        res.render('order/order/resupplys_tears');
    },
    resupplyDetailPage: function (req, res) {
        res.render('order/order/resupply_detail');
    },
    checkPage: function (req, res) {
        res.render('order/order/order_check');
    },
    processPage: function (req, res) {
        res.render('order/order/order_process');
    },
    permitPage: function (req, res) {

        // var paramObject = helper.genPaginationQuery(req);
        // Base.multiDataRequest(req, res, [
        //     {url: '', method: 'GET', resConfig: {keyName: 'Info', is_must: true}},
        // ], function (req, res, resultList) {
        //
        //     var paginationInfo =  resultList.Info;
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
        //     res.render('order/order/order_permit', returnData);
        // });
        res.render('order/order/order_permit');
    },
    nestingPage: function (req, res) {
        res.render('order/order/nesting');
    },
    packagePage: function (req, res) {
        res.render('order/order/package');
    },
};

module.exports = OrderController;

